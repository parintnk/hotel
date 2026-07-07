import * as db from "@/lib/db";
import { askAIJSON } from "@/lib/ai";

export type HealthReport = {
  score: number;
  grade: "A" | "B" | "C" | "D";
  headline: string;
  strengths: string[];
  risks: string[];
  actions: string[];
};

// ประเมินสุขภาพโรงแรมจากข้อมูลจริงทั้งระบบ (metrics + จอง + รีวิว) — สไตล์บริการตรวจสุขภาพโรงแรมของที่ปรึกษา
export async function runHealthCheck(hotelId: string): Promise<HealthReport> {
  const [metrics, reviews, bookings] = await Promise.all([
    db.getRecentMetrics(hotelId, 14),
    db.getReviews(hotelId),
    db.getBookings(hotelId),
  ]);

  const channelMix: Record<string, number> = {};
  for (const b of bookings)
    channelMix[b.channel] = (channelMix[b.channel] ?? 0) + 1;

  const analyzed = reviews.filter((r: any) => r.sentiment);
  const reviewSummary = {
    total: reviews.length,
    avgRating: reviews.length
      ? +(
          reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length
        ).toFixed(1)
      : null,
    negative: analyzed
      .filter((r: any) => r.sentiment === "negative")
      .map((r: any) => ({ text: r.review_text, topics: r.topics })),
    topTopics: analyzed.flatMap((r: any) => r.topics ?? []),
  };

  return askAIJSON<HealthReport>({
    system:
      `คุณคือที่ปรึกษาบริหารโรงแรมมืออาชีพ ประเมินสุขภาพโรงแรมจากข้อมูลจริง คืน JSON เท่านั้น: ` +
      `{"score":0-100,"grade":"A"|"B"|"C"|"D","headline":"สรุปภาพรวม 1 ประโยค",` +
      `"strengths":["จุดแข็ง 2-3 ข้อ อิงตัวเลข"],"risks":["ความเสี่ยง 2-3 ข้อ อิงตัวเลข"],` +
      `"actions":["สิ่งที่ควรทำทันที 3-4 ข้อ ลงมือได้จริง รวมคำแนะนำด้านราคา/ช่องทางขาย/รีวิว"]} ` +
      `ภาษาไทย กระชับ ตรงไปตรงมา ห้ามแต่งข้อมูลที่ไม่มี`,
    user: JSON.stringify({
      metrics14วัน: metrics,
      สัดส่วนช่องทางจอง: channelMix,
      รีวิว: reviewSummary,
    }),
    model: "smart",
  });
}
