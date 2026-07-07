"use client";
import { useState } from "react";
import { Loader2, Sunrise } from "lucide-react";

export default function MorningDigest() {
  const [digest, setDigest] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio/digest", { method: "POST" });
      if (!res.ok) throw new Error(String(res.status));
      setDigest((await res.json()).digest);
    } catch {
      setDigest("สรุปไม่สำเร็จ — โควต้า/เน็ตเวิร์ก Gemini มีปัญหา ลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-brand/40 bg-[#FFFBEB] shadow-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8A6D00]">
          <Sunrise size={14} aria-hidden /> AI briefing เช้านี้ — ทั้ง portfolio
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-brand-ink transition-transform hover:scale-[1.03] disabled:opacity-60"
        >
          {loading && <Loader2 size={12} className="animate-spin" aria-hidden />}
          {loading ? "AI กำลังไล่ดูทุกโรงแรม…" : digest ? "สรุปใหม่" : "วันนี้โฟกัสที่ไหน?"}
        </button>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-[#5C4A00]">
        {digest ??
          "กดปุ่มให้ AI ไล่อ่าน performance + alerts ของลูกค้าทุกโรงแรม แล้วสรุปว่าเช้านี้ทีมควรลงแรงที่ไหนก่อน"}
      </p>
    </div>
  );
}
