import { runHealthCheck } from "@/lib/engine/health";

export async function POST(req: Request) {
  const { hotelId } = await req.json().catch(() => ({}) as any);
  return Response.json(
    await runHealthCheck(hotelId ?? process.env.NEXT_PUBLIC_DEMO_HOTEL_ID ?? "h1"),
  );
}
