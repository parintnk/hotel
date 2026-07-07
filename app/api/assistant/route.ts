import { bad, readBody } from "@/lib/api";
import * as db from "@/lib/db";
import { askAssistant, type ChatMsg } from "@/lib/engine/assistant";

export async function POST(req: Request) {
  const body = await readBody<{ question?: string; history?: ChatMsg[] }>(req);
  const question = body?.question?.trim();
  if (!question) return bad("ต้องส่ง question");
  try {
    const answer = await askAssistant(question, body?.history ?? []);
    await db.insertMessageLog({
      source: "assistant",
      question,
      answer,
      at: new Date().toISOString(),
    });
    return Response.json({ answer });
  } catch (e: any) {
    // ส่งเหตุผลจริงกลับไปโชว์ในบับเบิล (เช่น API key ผิด / quota หมด) — วินิจฉัยจากหน้าจอได้เลย
    return bad(`ตอบไม่สำเร็จ: ${String(e?.message ?? e).slice(0, 300)}`, 500);
  }
}
