import * as db from "@/lib/db";
import { askAI } from "@/lib/ai";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { OccupancyChart } from "@/components/dashboard/OccupancyChart";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { AiBriefing } from "@/components/dashboard/AiBriefing";
import HealthCheck from "@/components/dashboard/HealthCheck";
import HotelSwitcher from "@/components/HotelSwitcher";
import CancelBooking from "@/components/CancelBooking";

// ponytail: กัน next build prerender หน้านี้ (ข้อมูล in-memory + เรียก AI ต้องสดทุก request)
export const dynamic = "force-dynamic";

// สีประจำช่องทาง (fixed order, ผ่าน CVD/contrast validator แล้ว)
const CHANNELS: [string, string][] = [
  ["Booking.com", "#D97706"],
  ["Agoda", "#0891B2"],
  ["Walk-in", "#7C3AED"],
  ["Chat", "#DB2777"],
];

const pct = (now?: number, prev?: number) =>
  now != null && prev ? +(((now - prev) / prev) * 100).toFixed(1) : undefined;

const RANGES = [7, 14, 30];

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ hotel?: string; range?: string }>;
}) {
  const sp = await searchParams;
  const hotelId =
    sp.hotel ?? process.env.NEXT_PUBLIC_DEMO_HOTEL_ID ?? "h1";
  const range = RANGES.includes(Number(sp.range)) ? Number(sp.range) : 14;
  const [metrics, bookings, properties] = await Promise.all([
    db.getMetrics(hotelId, range),
    db.getBookings(hotelId),
    db.getProperties(),
  ]);
  const hotel: any = (properties as any[]).find((p) => p.id === hotelId);
  const latest = metrics[metrics.length - 1];
  const weekAgo = metrics[metrics.length - 8];
  const chart = metrics.map((m: any) => ({
    date: m.metric_date.slice(5),
    occupancy: m.occupancy_rate,
    revenue: m.total_revenue,
  }));

  const byChannel = CHANNELS.map(([name, color]) => ({
    name,
    color,
    count: bookings.filter((b: any) => b.channel === name).length,
  }));
  const maxChannel = Math.max(1, ...byChannel.map((c) => c.count));
  const recent = [...bookings].slice(-7).reverse();

  const briefing = await askAI({
    system:
      "สรุปผลประกอบการโรงแรมเป็นภาษาคน 1-2 ประโยค ชี้จุดเด่น/จุดต้องระวัง ภาษาไทย",
    user: JSON.stringify(metrics),
    model: "smart",
    maxTokens: 400,
  }).catch(
    () => "ยังไม่ได้ตั้งค่า GEMINI_API_KEY — เติมใน .env.local เพื่อเปิด AI briefing",
  );

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mut">Property · Performance</p><h1 className="mt-0.5 text-xl font-bold tracking-tight">
            ภาพรวม — {hotel?.name ?? hotelId}
          </h1>
          <p className="mt-1 text-sm text-mut">
            {hotel?.location} · {hotel?.segment} · ตัวเลขขยับตามการจองจริง —
            ลองจองผ่านแชทแล้วกลับมาดู
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* ช่วงเวลา */}
          <span className="inline-flex rounded-full border border-ink/15 bg-white p-0.5">
            {RANGES.map((r) => (
              <a
                key={r}
                href={`/dashboard?hotel=${hotelId}&range=${r}`}
                className={`rounded-full px-3 py-1 text-xs tabular-nums transition-colors ${
                  r === range
                    ? "bg-ink font-semibold text-white"
                    : "text-ink/60 hover:text-ink"
                }`}
              >
                {r} วัน
              </a>
            ))}
          </span>
          <HotelSwitcher
            hotels={(properties as any[]).map((p) => ({ id: p.id, name: p.name }))}
            current={hotelId}
          />
        </div>
      </div>

      {/* Bento grid */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Occupancy"
          value={`${latest?.occupancy_rate ?? 0}`}
          unit="%"
          delta={pct(latest?.occupancy_rate, weekAgo?.occupancy_rate)}
          spark={metrics.map((m: any) => m.occupancy_rate)}
        />
        <KpiCard
          label="ADR"
          value={`${latest?.adr?.toLocaleString() ?? 0}`}
          unit="฿"
          delta={pct(latest?.adr, weekAgo?.adr)}
          spark={metrics.map((m: any) => m.adr)}
        />
        <KpiCard
          label="RevPAR"
          value={`${latest?.revpar?.toLocaleString() ?? 0}`}
          unit="฿"
          delta={pct(latest?.revpar, weekAgo?.revpar)}
          spark={metrics.map((m: any) => m.revpar)}
        />
        <KpiCard
          label="ยอดจองวันนี้"
          value={`${latest?.total_bookings ?? 0}`}
          delta={pct(latest?.total_bookings, weekAgo?.total_bookings)}
          spark={metrics.map((m: any) => m.total_bookings)}
        />

        <div className="col-span-2 lg:row-span-2">
          <HealthCheck hotelId={hotelId} />
        </div>
        <div className="col-span-2 flex flex-col gap-4">
          <AiBriefing text={briefing} />
          <OccupancyChart data={chart} days={range} />
        </div>

        <div className="col-span-2">
          <RevenueChart data={chart} />
        </div>

        {/* Channel mix — label ตรงตัว ไม่พึ่งสีอย่างเดียว */}
        <div className="col-span-2 rounded-2xl border border-ink/10 bg-white shadow-card p-4">
          <div className="text-sm font-medium">การจองแยกช่องทาง</div>
          <p className="mt-0.5 text-xs text-mut">
            รวมทุกรายการในระบบ ({bookings.length} จอง)
          </p>
          <div className="mt-4 space-y-3">
            {byChannel.map((c) => (
              <div key={c.name}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium">{c.name}</span>
                  <span className="tabular-nums text-mut">{c.count} จอง</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-paper">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(c.count / maxChannel) * 100}%`,
                      backgroundColor: c.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          {bookings.length === 0 && (
            <p className="mt-4 text-xs text-mut">
              ยังไม่มีข้อมูล — รัน pipeline ที่หน้า Data Pipeline ก่อน
            </p>
          )}
        </div>

        {/* Recent bookings */}
        <div className="col-span-2 overflow-x-auto rounded-2xl border border-ink/10 bg-white shadow-card p-4 lg:col-span-4">
          <div className="text-sm font-medium">การจองล่าสุด</div>
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs text-mut">
                <th className="pb-2 font-medium">ผู้เข้าพัก</th>
                <th className="pb-2 font-medium">ช่องทาง</th>
                <th className="pb-2 font-medium">เข้าพัก</th>
                <th className="pb-2 text-right font-medium">ยอด (฿)</th>
                <th className="pb-2 pl-2 text-right font-medium">
                  <span className="sr-only">จัดการ</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {recent.map((b: any) => {
                const cancelled = b.status === "cancelled";
                return (
                  <tr
                    key={b.id}
                    className={`border-b border-ink/5 last:border-0 ${cancelled ? "opacity-50" : ""}`}
                  >
                    <td className="py-2 font-medium">
                      <span className={cancelled ? "line-through" : ""}>
                        {b.guest_name}
                      </span>
                      {cancelled && (
                        <span className="ml-1.5 rounded-full bg-down/10 px-1.5 py-0.5 text-[10px] font-semibold text-down">
                          ยกเลิกแล้ว
                        </span>
                      )}
                    </td>
                    <td className="py-2">
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor:
                              CHANNELS.find(([n]) => n === b.channel)?.[1] ??
                              "#8A8880",
                          }}
                          aria-hidden
                        />
                        {b.channel}
                      </span>
                    </td>
                    <td className="py-2 text-xs tabular-nums text-ink/70">
                      {b.checkin_date} → {b.checkout_date}
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      {Number(b.amount).toLocaleString()}
                    </td>
                    <td className="py-2 pl-2 text-right">
                      {!cancelled && (
                        <CancelBooking id={b.id} guest={b.guest_name} />
                      )}
                    </td>
                  </tr>
                );
              })}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-xs text-mut">
                    ยังไม่มีการจอง — ลองจองผ่านแชท หรือรัน ETL pipeline
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
