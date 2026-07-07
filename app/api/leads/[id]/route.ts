import * as db from "@/lib/db";
import { bad, notFound, readBody } from "@/lib/api";

const EDITABLE = ["company", "type", "owner", "next_follow", "value", "hotel_id", "stage"];
const STAGES = ["contact", "nego", "proposal", "won", "lost"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const b = await readBody(req);
  if (!b) return bad("body ต้องเป็น JSON");
  if (b.stage && !STAGES.includes(b.stage))
    return bad(`stage ต้องเป็น ${STAGES.join(" | ")}`);
  if (b.value !== undefined && (Number.isNaN(Number(b.value)) || Number(b.value) < 0))
    return bad("value ต้องเป็นตัวเลข ≥ 0");
  const patch = Object.fromEntries(
    Object.entries(b).filter(([k]) => EDITABLE.includes(k)),
  );
  if (!Object.keys(patch).length) return bad("ไม่มี field ที่แก้ได้ใน body");
  const lead = await db.updateLead(id, patch);
  return lead ? Response.json(lead) : notFound();
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return (await db.deleteLead(id)) ? Response.json({ ok: true }) : notFound();
}
