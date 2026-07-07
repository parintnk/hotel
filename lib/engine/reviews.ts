import * as db from "@/lib/db";
import { askAIJSON } from "@/lib/ai";
type Analysis = {
  sentiment: "positive" | "neutral" | "negative";
  topics: string[];
};

export async function analyzeReviews(hotelId?: string) {
  const all = await db.getPendingReviews();
  const pending = hotelId ? all.filter((r: any) => r.hotel_id === hotelId) : all;
  const alerts: any[] = [];
  for (const r of pending) {
    const a = await askAIJSON<Analysis>({
      system: `วิเคราะห์รีวิวโรงแรม คืน JSON เท่านั้น: {"sentiment":"positive"|"neutral"|"negative","topics":[หัวข้อภาษาไทยสั้นๆ เช่น "ความสะอาด","พนักงาน","อาหาร","ราคา","สิ่งอำนวยความสะดวก"]}`,
      user: `คะแนน ${r.rating}/5: ${r.review_text}`,
      model: "fast",
    });
    await db.updateReviewAnalysis(r.id, a.sentiment, a.topics);
    if (a.sentiment === "negative")
      alerts.push({ id: r.id, text: r.review_text, topics: a.topics });
  }
  return { analyzed: pending.length, alerts };
}
