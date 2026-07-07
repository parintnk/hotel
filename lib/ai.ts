import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// เช็ค model id ล่าสุดที่ ai.google.dev — probe แล้ว key นี้ใช้ 3.x ได้ (2.5 เจอ 503 บ่อย)
// ponytail: smart ชี้ lite ไปก่อน — gemini-3.5-flash free tier ให้แค่ 20 req/วัน demo ตายง่าย
// ได้ paid key เมื่อไหร่เปลี่ยน smart กลับเป็น "gemini-3.5-flash" บรรทัดเดียวจบ
const MODELS = { fast: "gemini-3.1-flash-lite", smart: "gemini-3.1-flash-lite" };

// free tier เจอ 429/503 เป็นระยะ — retry หนึ่งครั้งหลังรอ 10 วิ กัน demo ล่มกลางคัน
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e: any) {
    if (/429|503|UNAVAILABLE|RESOURCE_EXHAUSTED/.test(String(e?.message ?? e))) {
      await new Promise((r) => setTimeout(r, 10_000));
      return fn();
    }
    throw e;
  }
}

export async function askAI(o: {
  system: string;
  user: string;
  model?: "fast" | "smart";
  maxTokens?: number;
}) {
  const res = await withRetry(() =>
    ai.models.generateContent({
      model: MODELS[o.model ?? "smart"],
      contents: o.user,
      config: {
        systemInstruction: o.system,
        maxOutputTokens: o.maxTokens ?? 1024,
      },
    }),
  );
  return res.text ?? "";
}

export async function askAIJSON<T>(o: {
  system: string;
  user: string;
  model?: "fast" | "smart";
}): Promise<T> {
  const res = await withRetry(() =>
    ai.models.generateContent({
      model: MODELS[o.model ?? "smart"],
      contents: o.user,
      config: {
        systemInstruction: o.system,
        responseMimeType: "application/json",
      },
    }),
  );
  // || ไม่ใช่ ?? — Gemini คืน "" ได้ (safety block) แล้ว JSON.parse("") จะพัง
  return JSON.parse(res.text || "{}") as T;
}
