import * as db from "@/lib/db";
import { bad, missing, readBody } from "@/lib/api";

export async function GET() {
  return Response.json(await db.getProperties());
}

export async function POST(req: Request) {
  const b = await readBody(req);
  if (!b) return bad("body ต้องเป็น JSON");
  const miss = missing(b, ["name", "location", "segment", "contract_until"]);
  if (miss.length) return bad(`ขาดข้อมูล: ${miss.join(", ")}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.contract_until))
    return bad("contract_until ต้องเป็น YYYY-MM-DD");
  if (!Array.isArray(b.room_types) || b.room_types.length === 0)
    return bad("ต้องมีประเภทห้องอย่างน้อย 1 รายการ");
  for (const rt of b.room_types) {
    if (!rt.type?.trim() || !(Number(rt.count) > 0) || !(Number(rt.base_price) > 0))
      return bad("ประเภทห้องแต่ละรายการต้องมี ชื่อ / จำนวน > 0 / ราคา > 0");
  }
  const property = await db.createProperty(b);
  return Response.json(property, { status: 201 });
}
