import * as db from "@/lib/db";
import { bad, missing, readBody } from "@/lib/api";

export async function GET() {
  return Response.json(await db.getCampaigns());
}

export async function POST(req: Request) {
  const b = await readBody(req);
  if (!b) return bad("body ต้องเป็น JSON");
  const miss = missing(b, ["title", "hotel_id", "channel", "date"]);
  if (miss.length) return bad(`ขาดข้อมูล: ${miss.join(", ")}`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(b.date)) return bad("date ต้องเป็น YYYY-MM-DD");
  const budget = Number(b.budget ?? 0);
  if (Number.isNaN(budget) || budget < 0) return bad("budget ต้องเป็นตัวเลข ≥ 0");
  const campaign = await db.createCampaign({
    title: String(b.title).slice(0, 200),
    hotel_id: b.hotel_id,
    channel: b.channel,
    date: b.date,
    budget,
    status: "planned",
    result: null,
  });
  return Response.json(campaign, { status: 201 });
}
