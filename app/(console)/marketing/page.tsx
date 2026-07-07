import * as db from "@/lib/db";
import MarketingIdeas from "@/components/MarketingIdeas";
import CampaignList from "@/components/CampaignList";

export const dynamic = "force-dynamic";

export default async function MarketingPage() {
  const [campaigns, props] = await Promise.all([
    db.getCampaigns(),
    db.getProperties(),
  ]);
  const hotelNames = Object.fromEntries(
    (props as any[]).map((p) => [p.id, p.name]),
  );
  const totalBudget = campaigns
    .filter((c) => c.status !== "done")
    .reduce((s, c) => s + c.budget, 0);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mut">
            Agency · Marketing
          </p>
          <h1 className="mt-0.5 text-xl font-bold tracking-tight">
            ปฏิทินการตลาด
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-mut">
            แผนคอนเทนต์และแคมเปญของลูกค้าทุกรายรวมไว้ที่เดียว —
            เลิกแยกไฟล์ใครไฟล์มัน เห็นงบและผลย้อนหลังครบ
          </p>
        </div>
        <span className="text-xs text-mut">
          งบแคมเปญที่กำลังจะใช้:{" "}
          <strong className="tabular-nums">{totalBudget.toLocaleString()} ฿</strong>
        </span>
      </div>

      <div className="mt-5">
        <MarketingIdeas
          hotels={(props as any[]).map((p) => ({ id: p.id, name: p.name }))}
        />
      </div>

      <CampaignList campaigns={campaigns as any} hotelNames={hotelNames} />
    </main>
  );
}
