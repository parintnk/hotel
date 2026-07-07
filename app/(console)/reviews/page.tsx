import * as db from "@/lib/db";
import HotelSwitcher from "@/components/HotelSwitcher";
import ReviewsPanel from "@/components/ReviewsPanel";

export const dynamic = "force-dynamic";

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ hotel?: string }>;
}) {
  const hotelId =
    (await searchParams).hotel ?? process.env.NEXT_PUBLIC_DEMO_HOTEL_ID ?? "h1";
  const properties: any[] = await db.getProperties();
  const hotel = properties.find((p) => p.id === hotelId);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mut">Property · Reputation</p><h1 className="mt-0.5 text-xl font-bold tracking-tight">
            Review Intelligence — {hotel?.name ?? hotelId}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-mut">
            AI อ่านรีวิวจากทุกช่องทาง แยกอารมณ์ + หัวข้อปัญหา
            แล้วดันรีวิวลบขึ้นมาเป็นงานให้ทีมตามแก้ พร้อมร่างคำตอบให้
          </p>
        </div>
        <HotelSwitcher
          hotels={properties.map((p) => ({ id: p.id, name: p.name }))}
          current={hotelId}
        />
      </div>
      <div className="mt-4">
        <ReviewsPanel key={hotelId} hotelId={hotelId} />
      </div>
    </main>
  );
}
