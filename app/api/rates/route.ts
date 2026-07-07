import * as db from "@/lib/db";
import { bad, missing, notFound, readBody } from "@/lib/api";

// ราคา OTA ระบุตัวด้วย (hotel_id, room_type, channel) — แก้ราคา/โปรได้จากหน้า channels
export async function PATCH(req: Request) {
  const b = await readBody(req);
  if (!b) return bad("body ต้องเป็น JSON");
  const miss = missing(b, ["hotel_id", "room_type", "channel"]);
  if (miss.length) return bad(`ขาดข้อมูล: ${miss.join(", ")}`);
  const price = Number(b.price);
  if (Number.isNaN(price) || price <= 0) return bad("price ต้องเป็นตัวเลข > 0");
  const rate = await db.updateRate(
    { hotel_id: b.hotel_id, room_type: b.room_type, channel: b.channel },
    { price, promo: b.promo?.trim() ? String(b.promo).slice(0, 80) : null },
  );
  return rate ? Response.json(rate) : notFound();
}
