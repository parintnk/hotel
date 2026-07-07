import * as db from "@/lib/db";
import { bad, missing, readBody } from "@/lib/api";

export async function GET() {
  return Response.json(await db.getLeads());
}

export async function POST(req: Request) {
  const b = await readBody(req);
  if (!b) return bad("body ต้องเป็น JSON");
  const miss = missing(b, ["company", "type", "owner", "next_follow"]);
  if (miss.length) return bad(`ขาดข้อมูล: ${miss.join(", ")}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.next_follow))
    return bad("next_follow ต้องเป็น YYYY-MM-DD");
  const value = Number(b.value ?? 0);
  if (Number.isNaN(value) || value < 0) return bad("value ต้องเป็นตัวเลข ≥ 0");
  const lead = await db.createLead({
    company: String(b.company).slice(0, 200),
    type: b.type,
    owner: b.owner,
    next_follow: b.next_follow,
    value,
    hotel_id: b.hotel_id || null,
    stage: "contact",
  });
  return Response.json(lead, { status: 201 });
}
