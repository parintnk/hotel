import * as db from "@/lib/db";
import { askAI } from "@/lib/ai";

// AI แนะนำวิธีแก้จองซ้อน — หาห้องว่างจริงช่วงที่ทับกันมาให้เป็นตัวเลือกก่อน ไม่ให้ AI เดา
export async function POST(req: Request) {
  const { conflict } = await req.json();
  const hotels = await db.getHotels();
  const hotelId = hotels.find((h: any) => h.name === conflict.hotel)?.id;

  const start =
    conflict.a.checkin > conflict.b.checkin
      ? conflict.a.checkin
      : conflict.b.checkin;
  const end =
    conflict.a.checkout < conflict.b.checkout
      ? conflict.a.checkout
      : conflict.b.checkout;

  const rooms = hotelId ? await db.getRooms(hotelId) : [];
  const booked = hotelId
    ? await db.getOverlappingBookings(hotelId, start, end)
    : [];
  const taken = new Set(booked.map((b: any) => b.room_id));
  const freeRooms = rooms
    .filter((r: any) => !taken.has(r.id))
    .map(
      (r: any) =>
        `ห้อง ${r.room_number} (${r.room_type}, ${Number(r.base_price).toLocaleString()} บ./คืน)`,
    );

  const suggestion = await askAI({
    system:
      "คุณคือหัวหน้า operations โรงแรม แก้เคสจองซ้อน: 1) ตัดสินใจว่าควรย้ายแขกคนไหน พร้อมเหตุผลสั้นๆ (ใครจองก่อน/ช่องทาง/ราคา) 2) เสนอห้องทดแทนจาก 'ห้องว่างจริง' ที่ให้มาเท่านั้น ถ้าไม่มีห้องว่างให้เสนอทางออกอื่น (อัปเกรด/โรงแรมพันธมิตร/ชดเชย) 3) ร่างข้อความติดต่อแขก 1 ย่อหน้า ภาษาไทย กระชับ ใช้หัวข้อ 1. 2. 3.",
    user: JSON.stringify({ เคสจองซ้อน: conflict, ห้องว่างช่วงนั้น: freeRooms }),
    model: "smart",
    maxTokens: 600,
  });
  return Response.json({ suggestion });
}
