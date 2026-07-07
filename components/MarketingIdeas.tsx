"use client";
import { useState } from "react";
import { Lightbulb, Loader2 } from "lucide-react";

type Idea = { title: string; channel: string; why: string };

export default function MarketingIdeas({
  hotels,
}: {
  hotels: { id: string; name: string }[];
}) {
  const [hotelId, setHotelId] = useState(hotels[0]?.id ?? "h1");
  const [ideas, setIdeas] = useState<Idea[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    setIdeas(null);
    try {
      const res = await fetch("/api/marketing/ideas", {
        method: "POST",
        body: JSON.stringify({ hotelId }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setIdeas((await res.json()).ideas ?? []);
    } catch {
      setIdeas([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-brand/40 bg-[#FFFBEB] shadow-card p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8A6D00]">
          <Lightbulb size={14} aria-hidden /> AI คิดคอนเทนต์ให้
        </span>
        <label htmlFor="idea-hotel" className="sr-only">
          เลือกโรงแรม
        </label>
        <select
          id="idea-hotel"
          value={hotelId}
          onChange={(e) => setHotelId(e.target.value)}
          className="ml-auto cursor-pointer rounded-full border border-ink/15 bg-white px-3 py-1.5 text-xs"
        >
          {hotels.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
        <button
          onClick={run}
          disabled={loading}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-brand-ink transition-transform hover:scale-[1.03] disabled:opacity-60"
        >
          {loading && <Loader2 size={12} className="animate-spin" aria-hidden />}
          {loading ? "กำลังคิด…" : "เสนอไอเดีย"}
        </button>
      </div>
      {ideas &&
        (ideas.length ? (
          <div className="mt-3 grid gap-2 md:grid-cols-3">
            {ideas.map((i) => (
              <div key={i.title} className="rounded-xl bg-white p-3">
                <span className="rounded-full bg-paper px-2 py-0.5 text-[10px] font-semibold text-ink/60">
                  {i.channel}
                </span>
                <div className="mt-1.5 text-sm font-medium leading-snug">{i.title}</div>
                <p className="mt-1 text-xs leading-relaxed text-mut">{i.why}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs text-down">
            คิดไม่สำเร็จ — โควต้า/เน็ตเวิร์ก Gemini มีปัญหา ลองใหม่อีกครั้ง
          </p>
        ))}
    </div>
  );
}
