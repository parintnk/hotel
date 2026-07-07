import { buildMonthlyReport } from "@/lib/engine/reports";

export async function POST(req: Request) {
  const { hotelId } = await req.json();
  return Response.json(await buildMonthlyReport(hotelId));
}
