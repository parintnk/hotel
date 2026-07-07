"use client";
import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles, X } from "lucide-react";

type Msg = { role: "user" | "assistant"; text: string };

const SUGGEST = [
  "โรงแรมไหน occupancy ต่ำกว่าเป้าบ้าง?",
  "มีราคาหลุด parity ที่ไหน ควรแก้ยังไง?",
  "งานทีมที่ถึงกำหนดหรือเลยกำหนดวันนี้?",
  "ดีลขายไหนต้อง follow up ด่วนสุด?",
];

export default function Assistant() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // เลื่อนลงล่างสุดเมื่อมีข้อความใหม่ (ใช้ scrollTo กับ container — กัน extension monkey-patch)
    bodyRef.current?.scrollTo({ top: 1e9 });
  }, [msgs, busy, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(q: string) {
    const question = q.trim();
    if (!question || busy) return;
    const history = msgs.slice(-8);
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history }),
      });
      const data = await res.json();
      setMsgs((m) => [
        ...m,
        {
          role: "assistant",
          text: data.answer || data.error || "ตอบไม่ได้ตอนนี้ ลองใหม่อีกครั้งครับ",
        },
      ]);
    } catch {
      setMsgs((m) => [
        ...m,
        { role: "assistant", text: "เชื่อมต่อไม่ได้ ลองใหม่อีกครั้งครับ" },
      ]);
    } finally {
      setBusy(false);
    }
  }

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="เปิดผู้ช่วย AI"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-brand shadow-lift transition-transform hover:scale-105"
      >
        <Sparkles size={22} aria-hidden />
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-paper bg-brand"
        />
      </button>
    );

  return (
    <div
      role="dialog"
      aria-label="ผู้ช่วย AI"
      className="fixed bottom-4 right-4 z-50 flex h-[min(34rem,calc(100dvh-4rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-lift animate-[fade-up_0.25s_ease-out_both] motion-reduce:animate-none sm:bottom-5 sm:right-5"
    >
      <div className="flex items-center gap-2.5 bg-ink px-4 py-3 text-white">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-ink">
          <Sparkles size={16} aria-hidden />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-sm font-semibold">ผู้ช่วย AI ของทีม</div>
          <div className="text-[11px] text-white/55">
            ตอบจากข้อมูลจริงทุกโรงแรมในระบบ
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          aria-label="ปิด"
          className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
        >
          <X size={16} aria-hidden />
        </button>
      </div>

      <div ref={bodyRef} className="flex-1 space-y-2 overflow-y-auto bg-paper p-3">
        {msgs.length === 0 && (
          <div className="pt-2">
            <p className="px-1 text-xs text-mut">
              ถามได้ทุกเรื่อง — occupancy, ราคา/parity, รีวิว, งานทีม, ดีลขาย,
              แคมเปญ ของทั้ง 6 โรงแรม
            </p>
            <div className="mt-2.5 flex flex-col gap-1.5">
              {SUGGEST.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-xl border border-ink/10 bg-white px-3 py-2 text-left text-xs shadow-card transition-colors hover:border-brand hover:bg-brand/5"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm shadow-card ${
              m.role === "user"
                ? "ml-auto rounded-br-md bg-ink text-white"
                : "rounded-bl-md border border-ink/10 bg-white"
            }`}
          >
            {m.text}
          </div>
        ))}
        {busy && (
          <div className="flex w-fit items-center gap-2 rounded-2xl rounded-bl-md border border-ink/10 bg-white px-3 py-2 text-xs text-mut shadow-card">
            <Loader2 size={13} className="animate-spin motion-reduce:animate-none" aria-hidden />
            กำลังดูข้อมูล…
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 border-t border-ink/10 bg-white p-2.5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="ถามเรื่องโรงแรม ราคา งาน ดีล…"
          className="min-w-0 flex-1 rounded-lg border border-ink/15 bg-paper px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="ส่งคำถาม"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-ink transition-opacity disabled:opacity-40"
        >
          <Send size={15} aria-hidden />
        </button>
      </form>
    </div>
  );
}
