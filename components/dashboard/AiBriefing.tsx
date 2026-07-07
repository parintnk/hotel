import { Sparkles } from "lucide-react";

export function AiBriefing({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-brand/40 bg-[#FFFBEB] shadow-card p-5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8A6D00]">
        <Sparkles size={13} aria-hidden /> AI briefing เช้านี้
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-[#5C4A00]">{text}</p>
    </div>
  );
}
