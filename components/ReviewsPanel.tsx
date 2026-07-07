"use client";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Loader2,
  MessageSquareReply,
  Minus,
  Search,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

type Review = {
  id: string;
  source: string;
  rating: number;
  review_text: string;
  sentiment: "positive" | "neutral" | "negative" | null;
  topics: string[] | null;
  reviewed_at?: string;
};

const PER_PAGE = 8;
const SENT_FILTERS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "negative", label: "ต้องแก้" },
  { key: "neutral", label: "กลางๆ" },
  { key: "positive", label: "ชื่นชม" },
  { key: "pending", label: "รอวิเคราะห์" },
] as const;

const SENTIMENT = {
  positive: { label: "ชื่นชม", icon: ThumbsUp, cls: "bg-up/10 text-up" },
  neutral: { label: "กลางๆ", icon: Minus, cls: "bg-ink/5 text-ink/60" },
  negative: { label: "ต้องแก้", icon: ThumbsDown, cls: "bg-down/10 text-down" },
} as const;

function Stars({ n }: { n: number }) {
  return (
    <span
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${n} จาก 5 ดาว`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={12}
          aria-hidden
          className={i < n ? "fill-brand text-brand" : "text-ink/20"}
        />
      ))}
    </span>
  );
}

export default function ReviewsPanel({ hotelId }: { hotelId: string }) {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [drafting, setDrafting] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [sent, setSent] = useState<(typeof SENT_FILTERS)[number]["key"]>("all");
  const [source, setSource] = useState("all");
  const [page, setPage] = useState(1);

  async function load() {
    const res = await fetch(`/api/reviews?hotelId=${hotelId}`);
    setReviews(await res.json());
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId]);

  async function analyze() {
    setAnalyzing(true);
    setError(false);
    try {
      const res = await fetch("/api/reviews/analyze", {
        method: "POST",
        body: JSON.stringify({ hotelId }),
      });
      if (!res.ok) throw new Error(String(res.status));
      await load();
    } catch {
      setError(true);
    } finally {
      setAnalyzing(false);
    }
  }

  async function draftReply(r: Review) {
    setDrafting(r.id);
    try {
      const res = await fetch("/api/reviews/reply", {
        method: "POST",
        body: JSON.stringify({
          text: r.review_text,
          rating: r.rating,
          topics: r.topics,
          hotelId,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const { reply } = await res.json();
      setDrafts((d) => ({ ...d, [r.id]: reply }));
    } catch {
      setDrafts((d) => ({ ...d, [r.id]: "ร่างไม่สำเร็จ — ลองใหม่อีกครั้ง" }));
    } finally {
      setDrafting(null);
    }
  }

  async function copyDraft(id: string) {
    await navigator.clipboard.writeText(drafts[id] ?? "");
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const pending = reviews?.filter((r) => !r.sentiment).length ?? 0;
  const analyzed = reviews?.filter((r) => r.sentiment) ?? [];
  const negatives = analyzed.filter((r) => r.sentiment === "negative");
  const avg = reviews?.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "—";
  const topTopics = [
    ...analyzed
      .flatMap((r) => r.topics ?? [])
      .reduce((m, t) => m.set(t, (m.get(t) ?? 0) + 1), new Map<string, number>()),
  ]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <>
      <div className="flex justify-end">
        <button
          onClick={analyze}
          disabled={analyzing || pending === 0}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-ink transition-transform hover:scale-[1.03] disabled:opacity-60"
        >
          {analyzing ? (
            <Loader2 size={16} className="animate-spin" aria-hidden />
          ) : (
            <Sparkles size={16} aria-hidden />
          )}
          {analyzing
            ? "AI กำลังวิเคราะห์…"
            : pending > 0
              ? `วิเคราะห์รีวิวใหม่ (${pending})`
              : "วิเคราะห์ครบแล้ว"}
        </button>
      </div>

      {/* Summary tiles */}
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-ink/10 bg-white shadow-card p-4">
          <div className="text-xs text-mut">คะแนนเฉลี่ย</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-semibold tabular-nums">{avg}</span>
            <span className="text-sm text-mut">/ 5</span>
          </div>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white shadow-card p-4">
          <div className="text-xs text-mut">รีวิวทั้งหมด</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">
            {reviews?.length ?? "—"}
          </div>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white shadow-card p-4">
          <div className="text-xs text-mut">ต้องตามแก้</div>
          <div
            className={`mt-1 text-2xl font-semibold tabular-nums ${negatives.length ? "text-down" : ""}`}
          >
            {analyzed.length ? negatives.length : "—"}
          </div>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white shadow-card p-4">
          <div className="text-xs text-mut">หัวข้อที่ถูกพูดถึง</div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {topTopics.length ? (
              topTopics.map(([t, n]) => (
                <span
                  key={t}
                  className="rounded-full bg-paper px-2 py-0.5 text-[11px] font-medium text-ink/70"
                >
                  {t} · {n}
                </span>
              ))
            ) : (
              <span className="text-sm text-mut">รอวิเคราะห์</span>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-down/40 bg-down/5 p-4 text-sm text-down">
          วิเคราะห์ไม่สำเร็จ — เช็ค GEMINI_API_KEY / โควต้า แล้วลองใหม่
        </div>
      )}

      {/* Negative alerts */}
      {negatives.length > 0 && (
        <section className="mt-8">
          <h2 className="flex items-center gap-2 font-bold">
            <AlertTriangle size={17} className="text-down" aria-hidden />
            แจ้งเตือน: รีวิวลบที่ต้องจัดการ
          </h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {negatives.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border-l-4 border border-ink/10 border-l-down bg-white p-4 shadow-card"
              >
                <div className="flex items-center gap-2 text-xs text-mut">
                  <Stars n={r.rating} /> · {r.source}
                </div>
                <p className="mt-2 text-sm leading-relaxed">“{r.review_text}”</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(r.topics ?? []).map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-down/10 px-2 py-0.5 text-[11px] font-medium text-down"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                {drafts[r.id] ? (
                  <div className="mt-3 rounded-xl bg-paper p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-brand-ink">
                        คำตอบที่ AI ร่างให้ — แก้ได้ก่อนโพสต์
                      </span>
                      <button
                        onClick={() => copyDraft(r.id)}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-ink/15 px-2 py-0.5 text-[11px] text-ink/70 transition-colors hover:bg-white"
                      >
                        {copied === r.id ? (
                          <Check size={11} aria-hidden />
                        ) : (
                          <Copy size={11} aria-hidden />
                        )}
                        {copied === r.id ? "คัดลอกแล้ว" : "คัดลอก"}
                      </button>
                    </div>
                    <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-ink/80">
                      {drafts[r.id]}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => draftReply(r)}
                    disabled={drafting !== null}
                    className="mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-brand bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand-ink transition-colors hover:bg-brand/20 disabled:opacity-60"
                  >
                    {drafting === r.id ? (
                      <Loader2 size={12} className="animate-spin" aria-hidden />
                    ) : (
                      <MessageSquareReply size={12} aria-hidden />
                    )}
                    {drafting === r.id ? "AI กำลังร่าง…" : "ให้ AI ร่างคำตอบรีวิว"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All reviews — search / filter / pagination */}
      <section className="mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="mr-auto font-bold">รีวิวทั้งหมด</h2>
          <label className="relative">
            <Search
              size={13}
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mut"
            />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="ค้นหาข้อความรีวิว…"
              className="w-44 rounded-full border border-ink/15 bg-white py-1.5 pl-8 pr-3 text-xs outline-none transition-colors focus:border-brand"
            />
          </label>
          <select
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              setPage(1);
            }}
            aria-label="กรองตามช่องทาง"
            className="cursor-pointer rounded-full border border-ink/15 bg-white px-3 py-1.5 text-xs"
          >
            <option value="all">ทุกช่องทาง</option>
            {[...new Set((reviews ?? []).map((r) => r.source))].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {SENT_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setSent(f.key);
                setPage(1);
              }}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                sent === f.key
                  ? "bg-ink text-white"
                  : "border border-ink/15 bg-white text-ink/60 hover:border-ink/30"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {(() => {
          if (reviews === null)
            return (
              <div className="mt-3 rounded-2xl border border-ink/10 bg-white p-6 text-center text-sm text-mut shadow-card">
                กำลังโหลด…
              </div>
            );
          const filtered = reviews.filter(
            (r) =>
              (sent === "all" ||
                (sent === "pending" ? !r.sentiment : r.sentiment === sent)) &&
              (source === "all" || r.source === source) &&
              (!q.trim() || r.review_text.includes(q.trim())),
          );
          const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
          const cur = Math.min(page, pages);
          const slice = filtered.slice((cur - 1) * PER_PAGE, cur * PER_PAGE);
          return (
            <>
              <div className="mt-3 space-y-2">
                {slice.map((r) => {
                  const s = r.sentiment ? SENTIMENT[r.sentiment] : null;
                  return (
                    <div
                      key={r.id}
                      className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3 shadow-card"
                    >
                      <span className="w-14 text-[11px] tabular-nums text-mut">
                        {r.reviewed_at?.slice(5)}
                      </span>
                      <Stars n={r.rating} />
                      <span className="w-24 text-xs text-mut">{r.source}</span>
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {r.review_text}
                      </span>
                      <span className="hidden flex-wrap gap-1 lg:flex">
                        {(r.topics ?? []).map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-paper px-2 py-0.5 text-[11px] text-ink/60"
                          >
                            {t}
                          </span>
                        ))}
                      </span>
                      {s ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${s.cls}`}
                        >
                          <s.icon size={11} aria-hidden /> {s.label}
                        </span>
                      ) : (
                        <span className="rounded-full border border-dashed border-ink/20 px-2.5 py-1 text-[11px] text-mut">
                          รอวิเคราะห์
                        </span>
                      )}
                    </div>
                  );
                })}
                {slice.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-ink/20 p-8 text-center text-sm text-mut">
                    ไม่พบรีวิวตามเงื่อนไข — ลองปรับตัวกรอง
                  </div>
                )}
              </div>
              {pages > 1 && (
                <div className="mt-3 flex items-center justify-between text-xs text-mut">
                  <span className="tabular-nums">
                    {filtered.length} รีวิว · หน้า {cur}/{pages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(Math.max(1, cur - 1))}
                      disabled={cur === 1}
                      aria-label="หน้าก่อนหน้า"
                      className="cursor-pointer rounded-full border border-ink/15 bg-white p-1.5 transition-colors hover:border-ink/30 disabled:cursor-default disabled:opacity-40"
                    >
                      <ChevronLeft size={13} aria-hidden />
                    </button>
                    {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`h-7 w-7 cursor-pointer rounded-full text-xs tabular-nums transition-colors ${
                          n === cur
                            ? "bg-ink font-semibold text-white"
                            : "border border-ink/15 bg-white hover:border-ink/30"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(Math.min(pages, cur + 1))}
                      disabled={cur === pages}
                      aria-label="หน้าถัดไป"
                      className="cursor-pointer rounded-full border border-ink/15 bg-white p-1.5 transition-colors hover:border-ink/30 disabled:cursor-default disabled:opacity-40"
                    >
                      <ChevronRight size={13} aria-hidden />
                    </button>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </section>
    </>
  );
}
