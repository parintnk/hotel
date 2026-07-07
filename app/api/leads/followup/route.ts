import * as db from "@/lib/db";
import { askAIJSON } from "@/lib/ai";

// AI ร่างข้อความ follow-up ลูกค้า B2B — grounded ด้วยข้อมูล lead + โรงแรมที่เกี่ยวข้อง
export async function POST(req: Request) {
  const { lead } = await req.json();
  const props: any[] = await db.getProperties();
  const hotel = props.find((p) => p.id === lead.hotel_id);
  const STAGE_TH: Record<string, string> = {
    contact: "เพิ่งติดต่อกันครั้งแรก",
    nego: "กำลังเจรจาเงื่อนไข",
    proposal: "ส่งข้อเสนอไปแล้ว รอคำตอบ",
  };
  // บังคับ JSON schema — ไม่งั้นโมเดลชอบเติมคำเกริ่น/markdown มากับข้อความ
  const { message } = await askAIJSON<{ message: string }>({
    system:
      'คุณคือ sales มืออาชีพของทีมบริหารโรงแรม เขียนข้อความ follow-up สั้นๆ ส่งทาง LINE ถึงผู้ติดต่อฝั่งลูกค้า B2B: ทักอย่างสุภาพ อ้างถึงสถานะที่คุยค้างไว้ เสนอก้าวถัดไปที่ชัดเจน (นัดคุย/ส่งราคา/ตอบคำถาม) ยาว 2-3 ประโยค ภาษาไทย เป็นกันเองแบบมืออาชีพ ไม่ยัดเยียดขาย คืน JSON เท่านั้น: {"message":"เนื้อข้อความพร้อมส่ง ไม่มีคำเกริ่นหรือ markdown"}',
    user: JSON.stringify({
      บริษัท: lead.company,
      ประเภทดีล: lead.type,
      สถานะ: STAGE_TH[lead.stage] ?? lead.stage,
      มูลค่าโดยประมาณ: lead.value,
      โรงแรมที่เกี่ยวข้อง: hotel ? `${hotel.name} (${hotel.location})` : "หลายโรงแรมในเครือ",
    }),
    model: "smart",
  });
  return Response.json({ message });
}
