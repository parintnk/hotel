import { buildDailyReports } from "@/lib/engine/reports";
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`)
    return new Response("Unauthorized", { status: 401 });
  return Response.json({ ok: true, reports: await buildDailyReports() });
}
