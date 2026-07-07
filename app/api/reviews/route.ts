import * as db from "@/lib/db";

export async function GET(req: Request) {
  const hotelId =
    new URL(req.url).searchParams.get("hotelId") ??
    process.env.NEXT_PUBLIC_DEMO_HOTEL_ID ??
    "h1";
  return Response.json(await db.getReviews(hotelId));
}
