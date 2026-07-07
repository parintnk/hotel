import { runETL } from "@/lib/engine/etl";
export async function POST() {
  return Response.json(await runETL());
}
