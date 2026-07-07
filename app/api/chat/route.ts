import { handleMessage } from "@/lib/engine/conversation";
export async function POST(req: Request) {
  const reply = await handleMessage(await req.json());
  return Response.json(reply);
}
