import * as db from "@/lib/db";
import { bad, notFound, readBody } from "@/lib/api";

const EDITABLE = ["title", "service", "assignee", "due", "hotel_id", "recurring", "status"];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const b = await readBody(req);
  if (!b) return bad("body ต้องเป็น JSON");
  if (b.status && !["todo", "doing", "done"].includes(b.status))
    return bad("status ต้องเป็น todo | doing | done");
  const patch = Object.fromEntries(
    Object.entries(b).filter(([k]) => EDITABLE.includes(k)),
  );
  if (!Object.keys(patch).length) return bad("ไม่มี field ที่แก้ได้ใน body");
  const task = await db.updateTask(id, patch);
  return task ? Response.json(task) : notFound();
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return (await db.deleteTask(id)) ? Response.json({ ok: true }) : notFound();
}
