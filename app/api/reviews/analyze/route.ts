import { analyzeReviews } from "@/lib/engine/reviews";

export async function POST(req: Request) {
  const { hotelId } = await req.json().catch(() => ({}) as any);
  return Response.json(await analyzeReviews(hotelId));
}
