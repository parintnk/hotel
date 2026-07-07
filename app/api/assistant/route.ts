import { bad, readBody } from "@/lib/api";
import * as db from "@/lib/db";
import { askAssistant, type ChatMsg } from "@/lib/engine/assistant";

export async function POST(req: Request) {
  const body = await readBody<{ question?: string; history?: ChatMsg[] }>(req);
  const question = body?.question?.trim();
  if (!question) return bad("ต้องส่ง question");
  const answer = await askAssistant(question, body?.history ?? []);
  await db.insertMessageLog({
    source: "assistant",
    question,
    answer,
    at: new Date().toISOString(),
  });
  return Response.json({ answer });
}
