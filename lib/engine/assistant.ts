import * as db from "@/lib/db";
import { askAI } from "@/lib/ai";
import { buildAlerts, findParityIssues } from "@/lib/engine/portfolio";

export type ChatMsg = { role: "user" | "assistant"; text: string };

// ponytail: 6 โรงแรมข้อมูลเล็กพอ ยัด snapshot ทั้งระบบใน prompt เดียว —
// portfolio โตเป็นร้อยโรงแรมค่อยแยก retrieval รายโดเมน
async function buildSnapshot() {
  const today = new Date().toISOString().slice(0, 10);
  const [props, perf, tasks, leads, campaigns, parity, alerts] =
    await Promise.all([
      db.getProperties(),
      db.getPerformance(),
      db.getTasks(),
      db.getLeads(),
      db.getCampaigns(),
      findParityIssues(),
      buildAlerts(),
    ]);
  const name = (id: string | null) =>
    props.find((p: any) => p.id === id)?.name ?? "ยังไม่ระบุโรงแรม";

  const hotels = await Promise.all(
    props.map(async (p: any) => {
      const pf = perf.find((x: any) => x.hotel_id === p.id) ?? {};
      const reviews = await db.getReviews(p.id);
      const bookings = (await db.getBookings(p.id)).filter(
        (b: any) => b.status !== "cancelled",
      );
      return {
        hotel: p.name,
        location: p.location,
        segment: p.segment,
        total_rooms: p.total_rooms,
        channel_manager: p.channel_manager,
        contract_until: p.contract_until,
        occupancy_pct: pf.occupancy,
        occupancy_target_pct: pf.occupancy_target,
        adr: pf.adr,
        revpar: pf.revpar,
        pickup_7d_nights: pf.pickup_7d,
        cancel_rate_pct: pf.cancel_rate,
        review_score: pf.review_score,
        pending_reviews: reviews.filter((r: any) => !r.sentiment).length,
        recent_negative_reviews: reviews
          .filter((r: any) => r.sentiment === "negative")
          .slice(-3)
          .map((r: any) => ({
            rating: r.rating,
            topics: r.topics,
            text: String(r.review_text ?? "").slice(0, 120),
          })),
        upcoming_checkins: bookings
          .filter((b: any) => b.checkin_date >= today)
          .slice(0, 6)
          .map((b: any) => ({
            guest: b.guest_name,
            channel: b.channel,
            checkin: b.checkin_date,
            checkout: b.checkout_date,
            amount: b.amount,
          })),
        onboarding_pending: (p.onboarding ?? [])
          .filter((s: any) => !s.done)
          .map((s: any) => s.label),
      };
    }),
  );

  return {
    today,
    hotels,
    rate_parity_issues: parity.map((i) => ({
      hotel: name(i.hotel_id),
      room_type: i.room_type,
      cheapest: i.min,
      most_expensive: i.max,
      spread_pct: i.spreadPct,
    })),
    alerts: alerts.map((a: any) => ({
      hotel: name(a.hotel_id),
      severity: a.severity,
      text: a.text,
    })),
    team_tasks: tasks.map((t: any) => ({
      title: t.title,
      hotel: name(t.hotel_id),
      service: t.service,
      assignee: t.assignee,
      due: t.due,
      status: t.status,
    })),
    sales_leads: leads.map((l: any) => ({
      company: l.company,
      type: l.type,
      hotel: name(l.hotel_id),
      value_thb: l.value,
      stage: l.stage,
      next_follow: l.next_follow,
      owner: l.owner,
    })),
    marketing_campaigns: campaigns.map((c: any) => ({
      title: c.title,
      hotel: name(c.hotel_id),
      channel: c.channel,
      date: c.date,
      status: c.status,
      budget_thb: c.budget,
      result: c.result,
    })),
  };
}

export async function askAssistant(question: string, history: ChatMsg[] = []) {
  const snapshot = await buildSnapshot();
  const convo = history
    .slice(-8)
    .map((m) => `${m.role === "user" ? "พนักงาน" : "ผู้ช่วย"}: ${m.text}`)
    .join("\n");
  return askAI({
    system:
      "คุณคือผู้ช่วย AI ประจำทีมเอเจนซี่บริหารโรงแรม ตอบคำถามพนักงานจาก snapshot ข้อมูลจริงที่แนบมาเท่านั้น " +
      "ห้ามแต่งตัวเลขหรือเดาข้อมูลที่ไม่มี ถ้าไม่มีในระบบให้บอกตรงๆ " +
      "ตอบภาษาไทย กระชับ ตรงคำถาม อ้างชื่อโรงแรมและตัวเลขจริงเสมอ " +
      "ขึ้นบรรทัดใหม่และใช้ • นำหน้ารายการได้ ห้ามใช้ตาราง markdown " +
      "(ศัพท์ใน snapshot: occupancy=อัตราเข้าพัก, adr=ราคาขายเฉลี่ย/คืน, revpar=รายได้ต่อห้องทั้งหมด, " +
      "pickup_7d_nights=คืนที่ถูกจองเข้ามาสำหรับ 7 วันข้างหน้า, stage ดีล: contact→proposal→nego→won/lost)",
    user:
      `snapshot ทั้งระบบ ณ วันนี้:\n${JSON.stringify(snapshot)}\n\n` +
      (convo ? `บทสนทนาก่อนหน้า:\n${convo}\n\n` : "") +
      `พนักงานถาม: ${question}`,
    maxTokens: 700,
  });
}
