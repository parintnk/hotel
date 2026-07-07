import * as db from "@/lib/db";
import { askAI } from "@/lib/ai";

export async function POST(req: Request) {
  const { text, rating, topics, hotelId } = await req.json();
  const hotels = await db.getHotels();
  const hotelName =
    hotels.find((h: any) => h.id === hotelId)?.name ?? "Riverside Boutique";
  const reply = await askAI({
    system: `คุณคือผู้จัดการโรงแรม ${hotelName} เขียนคำตอบรีวิวลูกค้า: ขอบคุณ, ขอโทษอย่างจริงใจในจุดที่พลาด, บอกสิ่งที่กำลังแก้ไขแบบเป็นรูปธรรม, เชิญกลับมาพักอีกครั้ง ยาว 2-3 ประโยค ภาษาไทย สุภาพ ไม่แก้ตัว ลงท้ายด้วย — ทีมงาน ${hotelName}`,
    user: `รีวิว (${rating}/5): ${text}${topics?.length ? ` | ประเด็น: ${topics.join(", ")}` : ""}`,
    model: "smart",
    maxTokens: 400,
  });
  return Response.json({ reply });
}
