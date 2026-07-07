"use client";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  FileText,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { MonthlyReport } from "@/lib/engine/reports";

type Hotel = { id: string; name: string };

export default function ReportsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [hotelId, setHotelId] = useState("h1");
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/properties")
      .then((r) => r.json())
      .then((ps) => setHotels(ps.map((p: any) => ({ id: p.id, name: p.name }))))
      .catch(() => setHotels([{ id: "h1", name: "Riverside Boutique" }]));
  }, []);

  async function generate() {
    setLoading(true);
    setError(false);
    setReport(null);
    try {
      const res = await fetch("/api/reports/monthly", {
        method: "POST",
        body: JSON.stringify({ hotelId }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setReport(await res.json());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function copyReport() {
    if (!report) return;
    const text = [
      report.title,
      "",
      report.executive_summary,
      "",
      "จุดเด่นเดือนนี้:",
      ...report.highlights.map((h) => `• ${h}`),
      "",
      "จุดที่ต้องระวัง:",
      ...report.concerns.map((c) => `• ${c}`),
      "",
      `ช่องทางขาย: ${report.channel_insight}`,
      "",
      "แผนเดือนหน้า:",
      ...report.next_month_actions.map((a) => `• ${a}`),
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mut">Agency · Reporting</p><h1 className="mt-0.5 text-xl font-bold tracking-tight">ศูนย์สร้างรายงาน</h1>
      <p className="mt-1 max-w-2xl text-sm text-mut">
        รายงานรายเดือนส่งลูกค้า — ดึงตัวเลข, แคมเปญ, รีวิว และปัญหา parity
        ของโรงแรมนั้นมาเขียนเป็นรายงานฉบับเจ้าของอ่าน งานที่เคยใช้หลายชั่วโมงต่อโรงแรม
        เหลือกดปุ่มเดียว
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl border border-ink/10 bg-white shadow-card p-4">
        <FileText size={16} className="text-mut" aria-hidden />
        <label htmlFor="report-hotel" className="text-sm font-medium">
          สร้างรายงานของ
        </label>
        <select
          id="report-hotel"
          value={hotelId}
          onChange={(e) => setHotelId(e.target.value)}
          className="cursor-pointer rounded-full border border-ink/15 bg-paper px-3 py-1.5 text-sm"
        >
          {hotels.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
        <button
          onClick={generate}
          disabled={loading}
          className="ml-auto inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-brand-ink transition-transform hover:scale-[1.03] disabled:opacity-60"
        >
          {loading ? (
            <Loader2 size={15} className="animate-spin" aria-hidden />
          ) : (
            <Sparkles size={15} aria-hidden />
          )}
          {loading ? "AI กำลังเขียนรายงาน…" : "สร้างรายงานเดือนนี้"}
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-2xl border border-down/40 bg-down/5 p-4 text-sm text-down">
          สร้างไม่สำเร็จ — โควต้า/เน็ตเวิร์ก Gemini มีปัญหา ลองใหม่อีกครั้ง
        </p>
      )}

      {report && (
        <article className="mt-4 rounded-2xl border border-ink/10 bg-white shadow-card p-6 md:p-8">
          <div className="flex items-start justify-between gap-3 border-b border-ink/10 pb-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-mut">
                Monthly Performance Report
              </div>
              <h2 className="mt-1 text-lg font-bold">{report.title}</h2>
            </div>
            <button
              onClick={copyReport}
              className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-medium text-ink/70 transition-colors hover:bg-paper"
            >
              {copied ? <Check size={12} aria-hidden /> : <Copy size={12} aria-hidden />}
              {copied ? "คัดลอกแล้ว" : "คัดลอกทั้งฉบับ"}
            </button>
          </div>

          <p className="mt-4 leading-relaxed">{report.executive_summary}</p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-up/5 p-4">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-up">
                <CheckCircle2 size={15} aria-hidden /> จุดเด่นเดือนนี้
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
                {report.highlights.map((h) => (
                  <li key={h}>• {h}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-down/5 p-4">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold text-down">
                <AlertTriangle size={15} aria-hidden /> จุดที่ต้องระวัง
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
                {report.concerns.map((c) => (
                  <li key={c}>• {c}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-paper p-4">
            <h3 className="text-sm font-semibold">ช่องทางขาย</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink/80">
              {report.channel_insight}
            </p>
          </div>

          <div className="mt-4 rounded-xl border border-brand/40 bg-brand/5 p-4">
            <h3 className="text-sm font-semibold text-brand-ink">แผนเดือนหน้า</h3>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
              {report.next_month_actions.map((a) => (
                <li key={a}>• {a}</li>
              ))}
            </ul>
          </div>
        </article>
      )}

      {!report && !error && !loading && (
        <div className="mt-4 rounded-2xl border border-dashed border-ink/20 p-10 text-center text-sm text-mut">
          เลือกโรงแรมแล้วกดสร้าง — AI จะดึงข้อมูลจริงของโรงแรมนั้นมาเขียนให้ทั้งฉบับ
        </div>
      )}
    </main>
  );
}
