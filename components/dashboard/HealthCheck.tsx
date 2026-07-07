"use client";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HeartPulse,
  Loader2,
} from "lucide-react";
import type { HealthReport } from "@/lib/engine/health";

const GRADE_COLOR: Record<string, string> = {
  A: "#1D9E75",
  B: "#D97706",
  C: "#B45309",
  D: "#D64545",
};

function ScoreRing({ score, grade }: { score: number; grade: string }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const color = GRADE_COLOR[grade] ?? "#D97706";
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 84 84" className="h-full w-full -rotate-90">
        <circle cx="42" cy="42" r={r} fill="none" stroke="#EFEEE8" strokeWidth="8" />
        <circle
          cx="42"
          cy="42"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          className="transition-[stroke-dashoffset] duration-700 motion-reduce:transition-none"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold tabular-nums leading-none">{score}</span>
        <span className="text-[10px] font-semibold" style={{ color }}>
          เกรด {grade}
        </span>
      </div>
    </div>
  );
}

export default function HealthCheck({ hotelId }: { hotelId: string }) {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function run() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/health", {
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

  return (
    <div className="flex flex-col rounded-2xl border border-ink/10 bg-ink p-5 shadow-card text-white">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <HeartPulse size={16} className="text-brand" aria-hidden />
            Hotel Health Check
          </div>
          <p className="mt-0.5 text-xs text-white/55">
            AI ประเมินสุขภาพธุรกิจจาก metrics + ช่องทางจอง + รีวิว แล้วบอกว่าต้องทำอะไรต่อ
          </p>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-brand-ink transition-transform hover:scale-[1.03] disabled:opacity-60"
        >
          {loading && <Loader2 size={13} className="animate-spin" aria-hidden />}
          {loading ? "กำลังประเมิน…" : report ? "ประเมินใหม่" : "ตรวจสุขภาพเลย"}
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-down/20 p-3 text-xs text-red-200">
          ประเมินไม่สำเร็จ — เช็ค GEMINI_API_KEY / เน็ตเวิร์ก แล้วลองใหม่
        </p>
      )}

      {!report && !error && (
        <div className="mt-4 flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/15 p-6 text-center text-xs text-white/40">
          {loading
            ? "AI กำลังอ่านข้อมูล 14 วันย้อนหลัง…"
            : "ยังไม่เคยประเมิน — กดปุ่มเพื่อให้ AI วิเคราะห์ทั้งระบบ"}
        </div>
      )}

      {report && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-4">
            <ScoreRing score={report.score} grade={report.grade} />
            <p className="text-sm leading-relaxed text-white/85">
              {report.headline}
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl bg-white/5 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-up">
                <CheckCircle2 size={13} aria-hidden /> จุดแข็ง
              </div>
              <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-white/75">
                {report.strengths.map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-white/5 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#FF9F9F]">
                <AlertTriangle size={13} aria-hidden /> ความเสี่ยง
              </div>
              <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-white/75">
                {report.risks.map((s) => (
                  <li key={s}>• {s}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="rounded-xl border border-brand/30 bg-brand/10 p-3">
            <div className="text-xs font-semibold text-brand">ควรทำทันที</div>
            <ul className="mt-1.5 space-y-1.5 text-xs leading-relaxed text-white/85">
              {report.actions.map((s) => (
                <li key={s} className="flex gap-1.5">
                  <ArrowRight size={12} className="mt-0.5 shrink-0 text-brand" aria-hidden />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
