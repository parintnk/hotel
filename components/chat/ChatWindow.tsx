"use client";
import { useState, useRef, useEffect } from "react";
type Msg = {
  from: "user" | "bot";
  text: string;
  intent?: string;
  human?: boolean;
};

export default function ChatWindow({
  hotelId,
  hotelName,
}: {
  hotelId: string;
  hotelName: string;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([
    {
      from: "bot",
      text: `สวัสดีครับ ยินดีต้อนรับสู่ ${hotelName} 🏨 สอบถามห้องว่าง ราคา หรือจองได้เลยครับ`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  async function send() {
    const text = input.trim();
    if (!text) return;
    setMsgs((m) => [...m, { from: "user", text }]);
    setInput("");
    setTyping(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          hotelId,
          text,
          sessionId: "demo",
          history: msgs.slice(-8).map((m) => ({ from: m.from, text: m.text })),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const r = await res.json();
      setMsgs((m) => [
        ...m,
        {
          from: "bot",
          text: r.text,
          intent: r.intent,
          human: r.handledBy === "human",
        },
      ]);
    } catch {
      // ponytail: กันแชทค้าง "กำลังพิมพ์…" ตอน API พัง (เช่นยังไม่ใส่ GEMINI_API_KEY)
      setMsgs((m) => [
        ...m,
        {
          from: "bot",
          text: "ขออภัยครับ ระบบขัดข้องชั่วคราว ลองใหม่อีกครั้งนะครับ (เช็ค GEMINI_API_KEY ใน .env.local)",
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <div className="mx-auto flex h-[600px] w-full max-w-md flex-col overflow-hidden rounded-2xl border bg-[#EBEDF0] shadow-lift">
      <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5B301] font-semibold text-[#3A2C00]">
          {hotelName.charAt(0)}
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight">{hotelName}</div>
          <div className="text-xs text-emerald-600">online · ตอบอัตโนมัติ</div>
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {msgs.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[78%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm leading-relaxed ${m.from === "user" ? "rounded-br-sm bg-[#F5B301] text-[#3A2C00]" : "rounded-bl-sm bg-white text-gray-800 shadow-sm"}`}
            >
              {m.text}
              {m.from === "bot" && m.intent && (
                <div className="mt-1 flex gap-1">
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                    intent: {m.intent}
                  </span>
                  {m.human && (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] text-red-500">
                      ส่งต่อคน
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-white px-3 py-2 text-sm text-gray-400 shadow-sm">
              กำลังพิมพ์…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="flex items-center gap-2 border-t bg-white px-3 py-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="พิมพ์ข้อความ…"
          className="flex-1 rounded-full bg-gray-100 px-4 py-2 text-sm outline-none"
        />
        <button
          onClick={send}
          className="rounded-full bg-[#F5B301] px-4 py-2 text-sm font-medium text-[#3A2C00]"
        >
          ส่ง
        </button>
      </div>
    </div>
  );
}
