import Link from "next/link";
import * as db from "@/lib/db";
import { buildAlerts } from "@/lib/engine/portfolio";
import MorningDigest from "@/components/portfolio/MorningDigest";
import PortfolioTrend from "@/components/portfolio/PortfolioTrend";
import Spark from "@/components/Spark";
import { AlertTriangle, ArrowRight, Star } from "lucide-react";

export const dynamic = "force-dynamic";

// สีประจำตัวโรงแรม (monogram) — วนตามลำดับ
const AVATAR_COLORS = ["#D97706", "#0891B2", "#7C3AED", "#DB2777", "#1D9E75", "#B45309"];

export default async function PortfolioPage() {
  const [props, perf, alerts, allMetrics] = await Promise.all([
    db.getProperties(),
    db.getPerformance(),
    buildAlerts(),
    db.getAllMetrics(),
  ]);
  const name = (id: string) => props.find((p: any) => p.id === id)?.name ?? id;
  const highs = alerts.filter((a) => a.severity === "high");

  // รวมรายได้รายวันทุกโรงแรม + สรุปตัวเลขทั้ง portfolio
  const byDate = new Map<string, number>();
  for (const m of allMetrics)
    byDate.set(m.metric_date, (byDate.get(m.metric_date) ?? 0) + m.total_revenue);
  const trend = [...byDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([d, revenue]) => ({ date: d.slice(5), revenue }));
  const occSpark = (id: string) =>
    allMetrics.filter((m: any) => m.hotel_id === id).map((m: any) => m.occupancy_rate);

  const totalRooms = props.reduce((s: number, p: any) => s + p.total_rooms, 0);
  const occAvg = Math.round(
    perf.reduce((s, p) => {
      const rooms = (props as any[]).find((x) => x.id === p.hotel_id)?.total_rooms ?? 0;
      return s + p.occupancy * rooms;
    }, 0) / totalRooms,
  );
  const revToday = perf.reduce((s, p) => {
    const rooms = (props as any[]).find((x) => x.id === p.hotel_id)?.total_rooms ?? 0;
    return s + p.revpar * rooms;
  }, 0);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mut">
            Agency · Portfolio
          </p>
          <h1 className="mt-0.5 text-xl font-bold tracking-tight">
            ภาพรวมทุกโรงแรมลูกค้า
          </h1>
          <p className="mt-1 text-sm text-mut">
            {props.length} โรงแรมในความดูแล · ระบบชี้เป้าให้ว่าเช้านี้ต้องโฟกัสที่ไหน
            ไม่ต้องไล่เปิดดูทีละแห่ง
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3 py-1 text-xs shadow-card">
          <AlertTriangle size={12} className="text-down" aria-hidden />
          {alerts.length} เรื่องต้องดู · {highs.length} ด่วน
        </span>
      </div>

      {/* KPI strip ทั้ง portfolio */}
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-ink/10 bg-ink p-4 text-white shadow-card">
          <div className="text-xs font-medium text-white/60">รายได้วันนี้ (ทุกโรงแรม)</div>
          <div className="mt-1 text-2xl font-bold tabular-nums tracking-tight">
            {Math.round(revToday).toLocaleString()}
            <span className="ml-1 text-sm font-normal text-white/50">฿</span>
          </div>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-card">
          <div className="text-xs font-medium text-mut">Occupancy เฉลี่ยถ่วงน้ำหนัก</div>
          <div className="mt-1 text-2xl font-bold tabular-nums tracking-tight">
            {occAvg}
            <span className="ml-1 text-sm font-normal text-mut">%</span>
          </div>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-card">
          <div className="text-xs font-medium text-mut">ห้องในความดูแล</div>
          <div className="mt-1 text-2xl font-bold tabular-nums tracking-tight">
            {totalRooms}
            <span className="ml-1 text-sm font-normal text-mut">ห้อง</span>
          </div>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-card">
          <div className="text-xs font-medium text-mut">แจ้งเตือนค้าง</div>
          <div className={`mt-1 text-2xl font-bold tabular-nums tracking-tight ${highs.length ? "text-down" : ""}`}>
            {alerts.length}
            <span className="ml-1 text-sm font-normal text-mut">
              · ด่วน {highs.length}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <MorningDigest />
        </div>
        <div className="lg:col-span-2">
          <PortfolioTrend data={trend} />
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <section className="mt-4 rounded-2xl border border-ink/10 bg-white p-4">
          <h2 className="text-sm font-semibold">แจ้งเตือนวันนี้</h2>
          <ul className="mt-2 space-y-1.5">
            {alerts.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${a.severity === "high" ? "bg-down" : "bg-brand"}`}
                  aria-hidden
                />
                <span
                  className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${a.severity === "high" ? "bg-down/10 text-down" : "bg-brand/15 text-brand-ink"}`}
                >
                  {a.severity === "high" ? "ด่วน" : "เฝ้าดู"}
                </span>
                <span className="font-medium">{name(a.hotel_id)}</span>
                <span className="text-ink/70">— {a.text}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Property cards */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {perf.map((p, i) => {
          const prop: any = props.find((x: any) => x.id === p.hotel_id);
          const gap = p.occupancy - p.occupancy_target;
          const propAlerts = alerts.filter((a) => a.hotel_id === p.hotel_id);
          const hasHigh = propAlerts.some((a) => a.severity === "high");
          const barColor =
            gap >= 0 ? "#1D9E75" : gap > -10 ? "#D97706" : "#D64545";
          const avatar = AVATAR_COLORS[i % AVATAR_COLORS.length];
          const spark = occSpark(p.hotel_id);
          const trend = spark.length > 1 ? spark[spark.length - 1] - spark[0] : 0;
          const health = hasHigh
            ? { label: "ด่วน", cls: "bg-down/10 text-down" }
            : propAlerts.length
              ? { label: "เฝ้าดู", cls: "bg-brand/15 text-brand-ink" }
              : { label: "ตามเป้า", cls: "bg-up/10 text-up" };
          return (
            <Link
              key={p.hotel_id}
              href={`/dashboard?hotel=${p.hotel_id}`}
              className={`group flex flex-col rounded-2xl border bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift ${hasHigh ? "border-down/30 hover:border-down/50" : "border-ink/10 hover:border-brand/60"}`}
            >
              {/* Header */}
              <div className="flex items-start gap-3">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: avatar }}
                  aria-hidden
                >
                  {prop?.name?.charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold leading-tight">
                    {prop?.name}
                  </span>
                  <span className="block truncate text-xs text-mut">
                    {prop?.location} · {prop?.segment}
                  </span>
                </span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${health.cls}`}
                >
                  {health.label}
                </span>
              </div>

              {/* Hero: occupancy + trend + sparkline */}
              <div className="mt-4 flex items-end justify-between gap-2">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-mut">
                    Occupancy วันนี้
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold tabular-nums tracking-tight">
                      {p.occupancy}
                      <span className="text-base font-semibold text-mut">%</span>
                    </span>
                    <span className="text-xs tabular-nums text-mut">
                      / เป้า {p.occupancy_target}%
                    </span>
                  </div>
                  <div
                    className={`mt-0.5 text-[11px] font-medium tabular-nums ${trend >= 0 ? "text-up" : "text-down"}`}
                  >
                    {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)} จุด ใน 14 วัน
                  </div>
                </div>
                <Spark points={spark} width={104} height={38} />
              </div>

              {/* Target bar */}
              <div
                className="relative mt-2 h-2 overflow-hidden rounded-full bg-paper"
                role="img"
                aria-label={`occupancy ${p.occupancy}% จากเป้า ${p.occupancy_target}%`}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(100, p.occupancy)}%`,
                    backgroundColor: barColor,
                  }}
                />
                <div
                  className="absolute inset-y-0 w-0.5 bg-ink/40"
                  style={{ left: `${Math.min(100, p.occupancy_target)}%` }}
                />
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-3 divide-x divide-ink/10">
                <div className="pr-2">
                  <div className="text-[10px] font-medium uppercase tracking-wide text-mut">
                    ADR
                  </div>
                  <div className="text-sm font-bold tabular-nums">
                    {p.adr.toLocaleString()}
                    <span className="ml-0.5 text-[10px] font-normal text-mut">฿</span>
                  </div>
                </div>
                <div className="px-2">
                  <div className="text-[10px] font-medium uppercase tracking-wide text-mut">
                    RevPAR
                  </div>
                  <div className="text-sm font-bold tabular-nums">
                    {p.revpar.toLocaleString()}
                    <span className="ml-0.5 text-[10px] font-normal text-mut">฿</span>
                  </div>
                </div>
                <div className="pl-2">
                  <div className="text-[10px] font-medium uppercase tracking-wide text-mut">
                    Pickup 7 วัน
                  </div>
                  <div
                    className={`text-sm font-bold tabular-nums ${p.pickup_7d < 5 ? "text-down" : ""}`}
                  >
                    {p.pickup_7d}
                    <span className="ml-0.5 text-[10px] font-normal text-mut">คืน</span>
                  </div>
                </div>
              </div>

              {/* Alert chips */}
              {propAlerts.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {propAlerts.slice(0, 2).map((a, j) => (
                    <span
                      key={j}
                      title={a.text}
                      className={`inline-flex max-w-full items-center gap-1 truncate rounded-full px-2 py-0.5 text-[10px] font-medium ${a.severity === "high" ? "bg-down/10 text-down" : "bg-paper text-ink/60"}`}
                    >
                      <AlertTriangle size={9} aria-hidden className="shrink-0" />
                      <span className="truncate">{a.text}</span>
                    </span>
                  ))}
                  {propAlerts.length > 2 && (
                    <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] text-mut">
                      +{propAlerts.length - 2}
                    </span>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="min-h-3 flex-1" />
              <div className="flex items-center justify-between border-t border-ink/5 pt-3">
                <span
                  className="mt-0 inline-flex items-center gap-1 text-xs tabular-nums text-mut"
                  title="คะแนนรีวิวเฉลี่ย"
                >
                  <Star size={11} className="fill-brand text-brand" aria-hidden />
                  {p.review_score ?? "ใหม่"}
                  <span className="text-ink/30">·</span>
                  {prop?.total_rooms} ห้อง
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-ink">
                  เปิด dashboard
                  <ArrowRight
                    size={12}
                    aria-hidden
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
