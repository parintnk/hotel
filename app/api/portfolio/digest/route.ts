import { buildMorningDigest } from "@/lib/engine/portfolio";

export async function POST() {
  return Response.json({ digest: await buildMorningDigest() });
}
