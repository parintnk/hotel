"use client";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CopyX,
  FileWarning,
  FileText,
  Loader2,
  Play,
  Search,
  Sparkles,
  Upload,
} from "lucide-react";

type Side = {
  ref: string;
  guest: string;
  channel: string;
  checkin: string;
  checkout: string;
};
type Row = {
  ref: string;
  guest: string;
  hotel: string;
  room: string;
  channel: string;
  checkin: string;
  checkout: string;
  amount: number;
};
type EtlResult = {
  stats: {
    read: number;
    invalid: number;
    deduped: number;
    inserted: number;
    overbookings: number;
  };
  conflicts: { room: string; hotel: string; a: Side; b: Side }[];
  rows?: Row[];
};

const PER_PAGE = 10;

const SOURCES = [
  {
    file: "booking_com.csv",
    channel: "Booking.com",
    quirk: "หัวคอลัมน์ Title Case · วันที่ ISO (YYYY-MM-DD)",
  },
  {
    file: "agoda.csv",
    channel: "Agoda",
    quirk: "snake_case · วันที่ DD/MM/YYYY ต้องแปลงก่อน",
  },
  {
    file: "walkin.csv",
    channel: "Walk-in",
    quirk: "จดมือ — ชื่อ/ราคาหายเป็นบางแถว ต้องคัดทิ้ง",
  },
];

export default function OpsPage() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<EtlResult | null>(null);
  const [error, setError] = useState(false);
  const [advice, setAdvice] = useState<Record<number, string>>({});
  const [advising, setAdvising] = useState<number | null>(null);
  // ตารางรายการนำเข้า: ค้นหา + กรองช่องทาง + แบ่งหน้า (client-side — ข้อมูลอยู่ในมือแล้ว)
  const [q, setQ] = useState("");
  const [chan, setChan] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [allConflicts, setAllConflicts] = useState(false);

  const rows = result?.rows ?? [];
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!chan || r.channel === chan) &&
        (!needle ||
          `${r.guest} ${r.ref} ${r.hotel} ${r.room}`.toLowerCase().includes(needle)),
    );
  }, [rows, q, chan]);
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const view = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  async function resolve(i: number, conflict: EtlResult["conflicts"][number]) {
    setAdvising(i);
    try {
      const res = await fetch("/api/ops/resolve", {
        method: "POST",
        body: JSON.stringify({ conflict }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const { suggestion } = await res.json();
      setAdvice((a) => ({ ...a, [i]: suggestion }));
    } catch {
      setAdvice((a) => ({ ...a, [i]: "แนะนำไม่สำเร็จ — ลองใหม่อีกครั้ง" }));
    } finally {
      setAdvising(null);
    }
  }

  async function run() {
    setRunning(true);
    setError(false);
    try {
      const res = await fetch("/api/etl", { method: "POST" });
      if (!res.ok) throw new Error(String(res.status));
      setResult(await res.json());
      setQ("");
      setChan(null);
      setPage(1);
      setAllConflicts(false);
    } catch {
      setError(true);
    } finally {
      setRunning(false);
    }
  }

  const s = result?.stats;
  const STEPS = [
    {
      icon: FileText,
      title: "Extract",
      desc: "อ่าน CSV 3 ช่องทาง",
      value: s ? `${s.read} แถว` : "—",
    },
    {
      icon: FileWarning,
      title: "Validate",
      desc: "คัดแถวข้อมูลขาดทิ้ง",
      value: s ? `${s.invalid} แถวเสีย` : "—",
    },
    {
      icon: CopyX,
      title: "Dedupe",
      desc: "จองซ้ำข้ามช่องทาง",
      value: s ? `${s.deduped} ซ้ำ` : "—",
    },
    {
      icon: Upload,
      title: "Load",
      desc: "upsert ด้วย source_ref",
      value: s ? `${s.inserted} รายการ` : "—",
    },
    {
      icon: AlertTriangle,
      title: "Detect",
      desc: "จับจองซ้อน (overlap)",
      value: s ? `${s.overbookings} conflict` : "—",
      alert: (s?.overbookings ?? 0) > 0,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mut">Property · Data Pipeline</p><h1 className="mt-0.5 text-xl font-bold tracking-tight">Data Pipeline — ETL</h1>
          <p className="mt-1 max-w-xl text-sm text-mut">
            รวมไฟล์จองจาก 3 ช่องทางคนละฟอร์แมต → normalize → กันซ้ำ →
            เขียนลงระบบ แล้วตรวจจับ <strong>overbooking</strong> ก่อนลูกค้ามาเจอหน้างาน
          </p>
        </div>
        <button
          onClick={run}
          disabled={running}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-ink transition-transform hover:scale-[1.03] disabled:opacity-60"
        >
          {running ? (
            <Loader2 size={16} className="animate-spin" aria-hidden />
          ) : (
            <Play size={16} aria-hidden />
          )}
          {running ? "กำลังรัน pipeline…" : result ? "รันซ้ำ" : "รัน pipeline"}
        </button>
      </div>

      {/* Sources */}
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {SOURCES.map((src) => (
          <div key={src.file} className="rounded-xl border border-ink/10 bg-white shadow-card p-4">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-mut" aria-hidden />
              <span className="font-mono text-xs font-semibold">{src.file}</span>
              <span className="ml-auto rounded-full bg-paper px-2 py-0.5 text-[10px] font-medium text-ink/60">
                {src.channel}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-mut">{src.quirk}</p>
          </div>
        ))}
      </div>

      {/* Pipeline steps */}
      <div className="mt-8 grid gap-3 md:grid-cols-5">
        {STEPS.map((st, i) => (
          <div key={st.title} className="relative">
            <div
              className={`h-full rounded-xl border bg-white p-4 shadow-card ${
                st.alert ? "border-down/40" : "border-ink/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <st.icon
                  size={17}
                  aria-hidden
                  className={st.alert ? "text-down" : "text-brand-ink"}
                />
                <span className="text-[10px] font-semibold tracking-widest text-mut">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="mt-2 text-sm font-semibold">{st.title}</div>
              <div className="text-xs text-mut">{st.desc}</div>
              <div
                className={`mt-2 text-lg font-bold tabular-nums ${
                  st.alert ? "text-down" : ""
                }`}
              >
                {st.value}
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <ArrowDown
                size={14}
                aria-hidden
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-mut md:hidden"
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-down/40 bg-down/5 p-4 text-sm text-down">
          รัน pipeline ไม่สำเร็จ — ลองใหม่อีกครั้ง หรือเช็คว่า dev server ยังรันอยู่
        </div>
      )}

      {/* Results */}
      {result &&
        (result.conflicts.length > 0 ? (
          <section className="mt-8">
            <h2 className="flex items-center gap-2 font-bold">
              <AlertTriangle size={17} className="text-down" aria-hidden />
              พบจองซ้อน {result.conflicts.length} รายการ — ต้องจัดการก่อนวันเข้าพัก
            </h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {(allConflicts ? result.conflicts : result.conflicts.slice(0, 6)).map((c, i) => (
                <div
                  key={i}
                  className="rounded-2xl border-l-4 border border-ink/10 border-l-down bg-white p-4 shadow-card"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    ห้อง {c.room} · {c.hotel}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    {[c.a, c.b].map((sd) => (
                      <div key={sd.ref} className="rounded-lg bg-paper p-2.5">
                        <div className="font-mono text-[10px] text-mut">{sd.ref}</div>
                        <div className="mt-0.5 font-medium">{sd.guest}</div>
                        <div className="text-mut">{sd.channel}</div>
                        <div className="mt-1 tabular-nums text-ink/70">
                          {sd.checkin} → {sd.checkout}
                        </div>
                      </div>
                    ))}
                  </div>
                  {advice[i] ? (
                    <div className="mt-3 rounded-xl border border-brand/40 bg-brand/5 p-3">
                      <div className="text-[11px] font-semibold text-brand-ink">
                        AI แนะนำวิธีจัดการ (เช็คห้องว่างจริงแล้ว)
                      </div>
                      <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-ink/80">
                        {advice[i]}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => resolve(i, c)}
                      disabled={advising !== null}
                      className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-brand bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand-ink transition-colors hover:bg-brand/20 disabled:opacity-60"
                    >
                      {advising === i ? (
                        <Loader2 size={12} className="animate-spin" aria-hidden />
                      ) : (
                        <Sparkles size={12} aria-hidden />
                      )}
                      {advising === i ? "AI กำลังวิเคราะห์…" : "ให้ AI แนะนำวิธีแก้"}
                    </button>
                  )}
                </div>
              ))}
            </div>
            {result.conflicts.length > 6 && !allConflicts && (
              <button
                onClick={() => setAllConflicts(true)}
                className="mt-3 w-full cursor-pointer rounded-xl border border-dashed border-ink/20 py-2.5 text-sm font-medium text-ink/70 transition-colors hover:border-ink/40"
              >
                แสดงอีก {result.conflicts.length - 6} รายการ
              </button>
            )}
          </section>
        ) : (
          <div className="mt-8 flex items-center gap-2 rounded-xl border border-up/30 bg-up/5 p-4 text-sm font-medium text-up">
            <CheckCircle2 size={17} aria-hidden /> ไม่พบจองซ้อน — ข้อมูลทุกช่องทางสอดคล้องกัน
          </div>
        ))}

      {/* Imported rows — search / channel filter / pagination */}
      {result && rows.length > 0 && (
        <section className="mt-8">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-bold">รายการที่นำเข้ารอบนี้</h2>
            <span className="text-xs tabular-nums text-mut">
              {filtered.length}/{rows.length} รายการ
            </span>
            <div className="ml-auto flex flex-wrap items-center gap-1.5">
              {[null, ...SOURCES.map((s) => s.channel)].map((c) => (
                <button
                  key={c ?? "all"}
                  onClick={() => {
                    setChan(c);
                    setPage(1);
                  }}
                  className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    chan === c
                      ? "bg-ink text-white"
                      : "border border-ink/15 bg-white text-ink/70 hover:border-ink/40"
                  }`}
                >
                  {c ?? "ทุกช่องทาง"}
                  {c && (
                    <span className="ml-1 tabular-nums opacity-60">
                      {rows.filter((r) => r.channel === c).length}
                    </span>
                  )}
                </button>
              ))}
              <label className="relative">
                <Search
                  size={13}
                  aria-hidden
                  className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-mut"
                />
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  placeholder="ค้นหาแขก / ref / โรงแรม / ห้อง…"
                  className="w-52 rounded-full border border-ink/15 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus:border-brand"
                />
              </label>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto rounded-2xl border border-ink/10 bg-white shadow-card">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-left text-[11px] uppercase tracking-wide text-mut">
                  <th className="px-4 py-2.5 font-medium">Ref</th>
                  <th className="px-3 py-2.5 font-medium">แขก</th>
                  <th className="px-3 py-2.5 font-medium">โรงแรม</th>
                  <th className="px-3 py-2.5 font-medium">ห้อง</th>
                  <th className="px-3 py-2.5 font-medium">ช่องทาง</th>
                  <th className="px-3 py-2.5 font-medium">เข้าพัก</th>
                  <th className="px-4 py-2.5 text-right font-medium">ยอด (฿)</th>
                </tr>
              </thead>
              <tbody>
                {view.map((r) => (
                  <tr key={r.ref} className="border-b border-ink/5 last:border-0">
                    <td className="px-4 py-2 font-mono text-[11px] text-mut">{r.ref}</td>
                    <td className="px-3 py-2 font-medium">{r.guest}</td>
                    <td className="px-3 py-2 text-xs text-ink/70">{r.hotel}</td>
                    <td className="px-3 py-2 text-xs tabular-nums">{r.room}</td>
                    <td className="px-3 py-2 text-xs">{r.channel}</td>
                    <td className="px-3 py-2 text-xs tabular-nums text-ink/70">
                      {r.checkin} → {r.checkout}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">
                      {r.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {view.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-mut">
                      ไม่พบรายการที่ตรงกับเงื่อนไข
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {pages > 1 && (
              <div className="flex items-center justify-between border-t border-ink/10 px-4 py-2 text-xs">
                <span className="tabular-nums text-mut">
                  หน้า {page}/{pages}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    aria-label="หน้าก่อนหน้า"
                    className="cursor-pointer rounded-lg border border-ink/15 p-1.5 transition-colors hover:border-ink/40 disabled:opacity-30"
                  >
                    <ChevronLeft size={13} aria-hidden />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    disabled={page === pages}
                    aria-label="หน้าถัดไป"
                    className="cursor-pointer rounded-lg border border-ink/15 p-1.5 transition-colors hover:border-ink/40 disabled:opacity-30"
                  >
                    <ChevronRight size={13} aria-hidden />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {!result && !error && (
        <div className="mt-8 rounded-xl border border-dashed border-ink/20 p-8 text-center text-sm text-mut">
          ยังไม่ได้รันรอบนี้ — กด <strong>รัน pipeline</strong> เพื่อดึงข้อมูลจองล่าสุดจากทุกช่องทาง
        </div>
      )}
    </main>
  );
}
