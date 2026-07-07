import * as db from "@/lib/db";
import { bad, notFound, readBody } from "@/lib/api";

// ยกเลิก/คืนสถานะการจอง — การยกเลิกทำให้ห้องกลับมาว่างในระบบเช็คห้องทันที
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const b = await readBody(req);
  if (!b || !["confirmed", "cancelled"].includes(b.status))
    return bad("status ต้องเป็น confirmed | cancelled");
  const booking = await db.updateBooking(id, { status: b.status });
  return booking ? Response.json(booking) : notFound();
}
