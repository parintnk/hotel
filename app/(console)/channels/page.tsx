import Link from "next/link";
import * as db from "@/lib/db";
import { findParityIssues } from "@/lib/engine/portfolio";
import UrlSearch from "@/components/UrlSearch";
import RateCell from "@/components/RateCell";
import { AlertTriangle, Check, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

const OTA_CHANNELS = ["Booking.com", "Agoda", "Expedia"];

export default async function ChannelsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; issues?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const issuesOnly = sp.issues === "1";
  const [allProps, rates, issues] = await Promise.all([
    db.getProperties(),
    db.getOtaRates(),
    findParityIssues(),
  ]);
  const issueOf = new Map(issues.map((i) => [`${i.hotel_id}|${i.room_type}`, i]));

  // กรองตามคำค้น (ชื่อโรงแรม/ทำเล/ประเภทห้อง) และโหมด "เฉพาะที่หลุด parity"
  const props = (allProps as any[])
    .map((p) => ({
      ...p,
      room_types: p.room_types.filter(
        (rt: any) =>
          (!q ||
            p.name.toLowerCase().includes(q.toLowerCase()) ||
            p.location.includes(q) ||
            rt.type.toLowerCase().includes(q.toLowerCase())) &&
          (!issuesOnly || issueOf.has(`${p.id}|${rt.type}`)),
      ),
    }))
    .filter((p) => p.room_types.length > 0);
  const price = (hid: string, rt: string, ch: string) =>
    rates.find(
      (r) => r.hotel_id === hid && r.room_type === rt && r.channel === ch,
    );

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mut">Agency · Revenue Management</p><h1 className="mt-0.5 text-xl font-bold tracking-tight">ราคา & ช่องทางขาย</h1>
          <p className="mt-1 max-w-2xl text-sm text-mut">
            ราคาทุก OTA ของทุกโรงแรมในหน้าเดียว — ไม่ต้อง login extranet ทีละอัน
            ระบบเช็ค <strong>rate parity</strong> ให้อัตโนมัติแทนการไล่ดูด้วยตา
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${issues.length ? "border-down/30 bg-down/5 text-down" : "border-up/30 bg-up/5 text-up"}`}
        >
          <AlertTriangle size={12} aria-hidden /> parity หลุด {issues.length} จุด
        </span>
      </div>

      {/* Parity issues */}
      {issues.length > 0 && (
        <section className="mt-5 grid gap-3 md:grid-cols-3">
          {issues.map((i) => {
            const p: any = props.find((x: any) => x.id === i.hotel_id);
            return (
              <div
                key={`${i.hotel_id}${i.room_type}`}
                className="rounded-2xl border-l-4 border border-ink/10 border-l-down bg-white p-4 shadow-card"
              >
                <div className="text-sm font-semibold">
                  {p?.name} — {i.room_type}
                </div>
                <div className="mt-1 text-xs text-ink/70">
                  ราคาต่างกัน <strong className="text-down">{i.spreadPct}%</strong>
                </div>
                <div className="mt-2 space-y-1 text-xs tabular-nums">
                  <div className="flex justify-between rounded-lg bg-paper px-2 py-1">
                    <span>
                      {i.min.channel}
                      {i.min.promo && (
                        <span className="ml-1 text-down">({i.min.promo})</span>
                      )}
                    </span>
                    <span>{i.min.price.toLocaleString()} ฿</span>
                  </div>
                  <div className="flex justify-between rounded-lg bg-paper px-2 py-1">
                    <span>{i.max.channel}</span>
                    <span>{i.max.price.toLocaleString()} ฿</span>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* Rate matrix */}
      <section className="mt-5 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 px-4 py-3">
          <h2 className="text-sm font-semibold">ตารางราคาทุกโรงแรม (คืนนี้)</h2>
          <div className="flex flex-wrap items-center gap-2">
            <UrlSearch placeholder="ค้นหาโรงแรม / ห้อง…" />
            <Link
              href={issuesOnly ? "/channels" + (q ? `?q=${q}` : "") : `/channels?issues=1${q ? `&q=${q}` : ""}`}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                issuesOnly
                  ? "bg-down text-white"
                  : "border border-ink/15 bg-white text-ink/60 hover:border-down/40 hover:text-down"
              }`}
            >
              เฉพาะที่หลุด parity
            </Link>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-mut">
            <span className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-brand/15 ring-1 ring-brand/40" aria-hidden />
              จองตรง (base rate)
            </span>
            <span className="inline-flex items-center gap-1">
              <AlertTriangle size={11} className="text-down" aria-hidden />
              ราคาหลุด parity
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="bg-paper/70 text-[11px] uppercase tracking-wider text-mut">
                <th className="px-4 py-2.5 text-left font-semibold">ห้องพัก</th>
                <th className="bg-brand/[0.06] px-3 py-2.5 text-right font-semibold text-brand-ink">
                  Direct
                </th>
                {OTA_CHANNELS.map((c) => (
                  <th key={c} className="px-3 py-2.5 text-right font-semibold">
                    {c}
                  </th>
                ))}
                <th className="px-4 py-2.5 text-center font-semibold">Parity</th>
              </tr>
            </thead>
            <tbody>
              {props.map((p: any) => (
                <PropertyRows key={p.id} p={p} issueOf={issueOf} price={price} />
              ))}
              {props.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-mut">
                    ไม่พบห้องตามเงื่อนไข — ลองล้างคำค้นหรือปิดโหมด parity
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-4 flex items-start gap-2 rounded-2xl border border-ink/10 bg-white shadow-card p-4 text-xs leading-relaxed text-mut">
        <ShieldCheck size={15} className="mt-0.5 shrink-0 text-up" aria-hidden />
        ราคาดึงผ่าน channel manager (SiteMinder / HotelLink) ไม่เก็บรหัสผ่าน
        extranet ของ OTA เอง — ปลอดภัยกว่าและได้ราคา near real-time · demo
        นี้ใช้ mock snapshot ผ่าน data layer เดียวกัน สลับเป็น API จริงได้ที่{" "}
        <code className="rounded bg-paper px-1 font-mono">lib/db.ts</code>
      </p>
    </main>
  );
}

// แถวของแต่ละโรงแรม: หัวหมวด (ชื่อ+ทำเล+channel manager) ตามด้วยแถวราคาต่อประเภทห้อง
function PropertyRows({
  p,
  issueOf,
  price,
}: {
  p: any;
  issueOf: Map<string, any>;
  price: (hid: string, rt: string, ch: string) => any;
}) {
  return (
    <>
      <tr className="border-y border-ink/10 bg-ink/[0.03]">
        <td colSpan={6} className="px-4 py-2">
          <span className="text-[13px] font-bold">{p.name}</span>
          <span className="ml-2 text-xs text-mut">{p.location}</span>
          <span
            className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${
              p.channel_manager === "ยังไม่เชื่อม"
                ? "bg-down/10 text-down"
                : "bg-white text-ink/60 ring-1 ring-ink/10"
            }`}
          >
            {p.channel_manager}
          </span>
        </td>
      </tr>
      {p.room_types.map((rt: any) => {
        const issue = issueOf.get(`${p.id}|${rt.type}`);
        return (
          <tr
            key={rt.type}
            className="border-b border-ink/5 transition-colors last:border-0 hover:bg-paper/60"
          >
            <td className="px-4 py-2.5">
              <span className="font-medium">{rt.type}</span>
              <span className="ml-1.5 text-[11px] text-mut">× {rt.count} ห้อง</span>
            </td>
            <td className="bg-brand/[0.04] px-3 py-2.5 text-right font-semibold tabular-nums">
              {rt.base_price.toLocaleString()}
            </td>
            {OTA_CHANNELS.map((ch) => {
              const r = price(p.id, rt.type, ch);
              if (!r)
                return (
                  <td key={ch} className="px-3 py-2.5 text-right text-ink/20">
                    —
                  </td>
                );
              const isLeak = issue && issue.min.channel === ch;
              return (
                <td key={ch} className="px-3 py-2.5 text-right">
                  <RateCell rate={r} isLeak={!!isLeak} hotelName={p.name} />
                </td>
              );
            })}
            <td className="px-4 py-2.5 text-center">
              {issue ? (
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-down/10 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-down"
                  title={`${issue.min.channel} ↔ ${issue.max.channel} ต่างกัน ${issue.spreadPct}%`}
                >
                  <AlertTriangle size={10} aria-hidden /> {issue.spreadPct}%
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-up/80">
                  <Check size={12} aria-hidden /> ตรง
                </span>
              )}
            </td>
          </tr>
        );
      })}
    </>
  );
}
