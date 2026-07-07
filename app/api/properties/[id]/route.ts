import * as db from "@/lib/db";
import { bad, notFound, readBody } from "@/lib/api";

const EDITABLE = [
  "name",
  "location",
  "segment",
  "services",
  "channels",
  "channel_manager",
  "contract_until",
  "contacts",
  "room_types",
  "onboarding",
];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const b = await readBody(req);
  if (!b) return bad("body ต้องเป็น JSON");
  if (b.room_types) {
    if (!Array.isArray(b.room_types) || b.room_types.length === 0)
      return bad("ต้องมีประเภทห้องอย่างน้อย 1 รายการ");
    for (const rt of b.room_types) {
      if (!rt.type?.trim() || !(Number(rt.count) > 0) || !(Number(rt.base_price) > 0))
        return bad("ประเภทห้องแต่ละรายการต้องมี ชื่อ / จำนวน > 0 / ราคา > 0");
    }
  }
  const patch = Object.fromEntries(
    Object.entries(b).filter(([k]) => EDITABLE.includes(k)),
  );
  if (!Object.keys(patch).length) return bad("ไม่มี field ที่แก้ได้ใน body");
  const p = await db.updateProperty(id, patch);
  return p ? Response.json(p) : notFound();
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const r = await db.deleteProperty(id);
  if (r === "last") return bad("ลบโรงแรมสุดท้ายไม่ได้ — ระบบต้องมีอย่างน้อย 1 แห่ง");
  return r ? Response.json({ ok: true }) : notFound();
}
