import * as db from "@/lib/db";
import { bad, missing, readBody } from "@/lib/api";

export async function GET() {
  return Response.json(await db.getTasks());
}

export async function POST(req: Request) {
  const b = await readBody(req);
  if (!b) return bad("body ต้องเป็น JSON");
  const miss = missing(b, ["title", "service", "assignee", "due"]);
  if (miss.length) return bad(`ขาดข้อมูล: ${miss.join(", ")}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.due)) return bad("due ต้องเป็น YYYY-MM-DD");
  const task = await db.createTask({
    title: String(b.title).slice(0, 200),
    service: b.service,
    assignee: b.assignee,
    due: b.due,
    hotel_id: b.hotel_id || null,
    recurring: b.recurring || null,
    status: "todo",
  });
  return Response.json(task, { status: 201 });
}
