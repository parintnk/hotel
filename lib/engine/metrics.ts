import * as db from "@/lib/db";
export async function computeDailyMetrics(dateISO: string) {
  const hotels = await db.getHotels();
  for (const h of hotels) {
    const bk = await db.getBookingsCoveringDate(h.id, dateISO);
    const sold = bk.length;
    const revenue = bk.reduce(
      (s: number, b: any) => s + Number(b.amount || 0),
      0,
    );
    const occ = sold / h.total_rooms;
    await db.upsertDailyMetric({
      hotel_id: h.id,
      metric_date: dateISO,
      occupancy_rate: +(occ * 100).toFixed(1),
      adr: +(sold ? revenue / sold : 0).toFixed(0),
      revpar: +(revenue / h.total_rooms).toFixed(0),
      total_bookings: sold,
      total_revenue: revenue,
    });
  }
}
