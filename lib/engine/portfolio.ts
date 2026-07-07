import * as db from "@/lib/db";
import { askAI } from "@/lib/ai";

export type ParityIssue = {
  hotel_id: string;
  room_type: string;
  min: { channel: string; price: number; promo: string | null };
  max: { channel: string; price: number; promo: string | null };
  spreadPct: number;
};

// rate parity: ราคาห้องเดียวกันบน OTA ควรเท่ากัน — ต่างเกิน 3% = หลุด
export async function findParityIssues(): Promise<ParityIssue[]> {
  const rates = await db.getOtaRates();
  const groups = new Map<string, typeof rates>();
  for (const r of rates) {
    const key = `${r.hotel_id}|${r.room_type}`;
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  const issues: ParityIssue[] = [];
  for (const [key, list] of groups) {
    if (list.length < 2) continue;
    const sorted = [...list].sort((a, b) => a.price - b.price);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const spreadPct = +(((max.price - min.price) / min.price) * 100).toFixed(1);
    if (spreadPct > 3) {
      const [hotel_id, room_type] = key.split("|");
      issues.push({
        hotel_id,
        room_type,
        min: { channel: min.channel, price: min.price, promo: min.promo },
        max: { channel: max.channel, price: max.price, promo: max.promo },
        spreadPct,
      });
    }
  }
  return issues;
}

export type Alert = {
  hotel_id: string;
  severity: "high" | "warn";
  text: string;
};

// กติกาชี้เป้า — พนักงานหนึ่งคนดูหลายโรงแรม ระบบต้องบอกว่าเช้านี้โฟกัสที่ไหน
export async function buildAlerts(): Promise<Alert[]> {
  const [perf, parity] = await Promise.all([
    db.getPerformance(),
    findParityIssues(),
  ]);
  const alerts: Alert[] = [];
  for (const p of perf) {
    const gap = p.occupancy - p.occupancy_target;
    if (gap <= -15)
      alerts.push({ hotel_id: p.hotel_id, severity: "high", text: `Occupancy ต่ำกว่าเป้า ${Math.abs(gap)} จุด (${p.occupancy}% / เป้า ${p.occupancy_target}%)` });
    else if (gap <= -8)
      alerts.push({ hotel_id: p.hotel_id, severity: "warn", text: `Occupancy หลุดเป้า ${Math.abs(gap)} จุด` });
    if (p.cancel_rate >= p.cancel_rate_prev * 2 && p.cancel_rate >= 10)
      alerts.push({ hotel_id: p.hotel_id, severity: "high", text: `ยอดยกเลิกพุ่ง ${p.cancel_rate}% (สัปดาห์ก่อน ${p.cancel_rate_prev}%)` });
    if (p.review_score < 4.0)
      alerts.push({ hotel_id: p.hotel_id, severity: "warn", text: `คะแนนรีวิวต่ำ ${p.review_score} — กระทบ conversion บน OTA` });
    if (p.pickup_7d < 5)
      alerts.push({ hotel_id: p.hotel_id, severity: "warn", text: `Pickup 7 วันข้างหน้าแค่ ${p.pickup_7d} คืน — ต้องกระตุ้น` });
  }
  for (const i of parity)
    alerts.push({ hotel_id: i.hotel_id, severity: "warn", text: `Rate parity หลุด: ${i.room_type} ต่างกัน ${i.spreadPct}% (${i.min.channel} ↔ ${i.max.channel})` });
  return alerts.sort((a) => (a.severity === "high" ? -1 : 1));
}

// AI สรุปเช้า: ทั้ง portfolio วันนี้ควรโฟกัสอะไร เรียงความสำคัญ
export async function buildMorningDigest() {
  const [perf, alerts, props] = await Promise.all([
    db.getPerformance(),
    buildAlerts(),
    db.getProperties(),
  ]);
  const name = (id: string) => props.find((p: any) => p.id === id)?.name ?? id;
  return askAI({
    system:
      "คุณคือหัวหน้าทีม revenue management ของเอเจนซี่บริหารโรงแรม สรุป briefing เช้าให้ทีม: เรียงว่าวันนี้ควรโฟกัสโรงแรมไหนก่อน เพราะอะไร (อิงตัวเลข) และชม 1 โรงแรมที่ทำได้ดี ยาว 3-4 ประโยค ภาษาไทย กระชับ ห้ามแต่งข้อมูลเพิ่ม",
    user: JSON.stringify({
      performance: perf.map((p) => ({ ...p, hotel: name(p.hotel_id) })),
      alerts: alerts.map((a) => ({ ...a, hotel: name(a.hotel_id) })),
    }),
    model: "smart",
    maxTokens: 600,
  });
}
