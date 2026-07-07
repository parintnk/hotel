import * as db from "@/lib/db";
import CrmBoard from "@/components/CrmBoard";

export const dynamic = "force-dynamic";

export default async function CrmPage() {
  const [leads, props] = await Promise.all([db.getLeads(), db.getProperties()]);
  const hotelNames = Object.fromEntries(
    (props as any[]).map((p) => [p.id, p.name]),
  );

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mut">
          Agency · Sales
        </p>
        <h1 className="mt-0.5 text-xl font-bold tracking-tight">
          งานขาย (Sales Pipeline)
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-mut">
          Lead เอเย่นต์/บริษัท/OTA deal ของทุกโรงแรม — ลากการ์ดข้าม stage ได้เลย
          ระบบเตือนเมื่อถึงกำหนดตาม และ AI ร่างข้อความ follow-up ให้เสร็จ
        </p>
      </div>
      <CrmBoard initial={leads as any} hotelNames={hotelNames} />
    </main>
  );
}
