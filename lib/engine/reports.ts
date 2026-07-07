import * as db from "@/lib/db";
import { askAI, askAIJSON } from "@/lib/ai";
import { findParityIssues } from "./portfolio";

export type MonthlyReport = {
  title: string;
  executive_summary: string;
  highlights: string[];
  concerns: string[];
  channel_insight: string;
  next_month_actions: string[];
};

// ศูนย์สร้างรายงาน: รายงานรายเดือนส่งลูกค้า — เคยทำมือใน PPT หลายชั่วโมง/โรงแรม เหลือกดปุ่มเดียว
export async function buildMonthlyReport(hotelId: string): Promise<MonthlyReport> {
  const [props, perf, campaigns, parity, reviews] = await Promise.all([
    db.getProperties(),
    db.getPerformance(),
    db.getCampaigns(),
    findParityIssues(),
    db.getReviews(hotelId),
  ]);
  const p: any = props.find((x: any) => x.id === hotelId);
  const data = {
    โรงแรม: p ? { name: p.name, location: p.location, segment: p.segment, services: p.services } : hotelId,
    ตัวเลขเดือนนี้: perf.find((x) => x.hotel_id === hotelId),
    แคมเปญ: campaigns.filter((c) => c.hotel_id === hotelId),
    ปัญหาparity: parity.filter((i) => i.hotel_id === hotelId),
    รีวิว: reviews.map((r: any) => ({ rating: r.rating, sentiment: r.sentiment, text: r.review_text })),
  };
  return askAIJSON<MonthlyReport>({
    system:
      `คุณคือที่ปรึกษาบริหารโรงแรม เขียนรายงานประจำเดือนส่งเจ้าของโรงแรม คืน JSON เท่านั้น: ` +
      `{"title":"รายงานประจำเดือน — <ชื่อโรงแรม>","executive_summary":"2-3 ประโยคภาพรวม",` +
      `"highlights":["สิ่งที่ทำได้ดี 2-3 ข้อ อิงตัวเลข"],"concerns":["จุดที่ต้องระวัง 1-3 ข้อ อิงตัวเลข"],` +
      `"channel_insight":"วิเคราะห์ช่องทางขาย/OTA 1-2 ประโยค","next_month_actions":["แผนเดือนหน้า 3-4 ข้อ ลงมือได้จริง"]} ` +
      `ภาษาไทย มืออาชีพ เขียนให้เจ้าของที่ไม่ใช่สายเทคนิคอ่านเข้าใจ ห้ามแต่งข้อมูลที่ไม่มี`,
    user: JSON.stringify(data),
    model: "smart",
  });
}
export async function buildDailyReports() {
  const hotels = await db.getHotels();
  const reports = [];
  for (const h of hotels) {
    const m = await db.getRecentMetrics(h.id, 7);
    if (!m.length) continue; // โรงแรมที่ยังไม่มี metrics ข้ามไป ไม่ให้ AI เดา
    const summary = await askAI({
      system:
        "เขียนสรุปผลประกอบการโรงแรมรายวันสำหรับเจ้าของ 3-4 ประโยค ชี้เทรนด์และข้อเสนอแนะ ภาษาไทย",
      user: `โรงแรม ${h.name} ข้อมูล 7 วันล่าสุด: ${JSON.stringify(m)}`,
      model: "smart",
      maxTokens: 800, // Gemini 3.x เป็น thinking model — เผื่อ budget ไม่งั้นข้อความโดนตัด
    });
    reports.push({ hotel: h.name, summary });
  }
  return reports;
}
