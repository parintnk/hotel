import * as db from "@/lib/db";
import ChatWindow from "@/components/chat/ChatWindow";
import HotelSwitcher from "@/components/HotelSwitcher";

export const dynamic = "force-dynamic";

export default async function ChatPage({
  searchParams,
}: {
  searchParams: Promise<{ hotel?: string }>;
}) {
  const hotelId =
    (await searchParams).hotel ?? process.env.NEXT_PUBLIC_DEMO_HOTEL_ID ?? "h1";
  const properties: any[] = await db.getProperties();
  const hotel = properties.find((p) => p.id === hotelId);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
      <HotelSwitcher
        hotels={properties.map((p) => ({ id: p.id, name: p.name }))}
        current={hotelId}
      />
      <ChatWindow
        key={hotelId}
        hotelId={hotelId}
        hotelName={hotel?.name ?? "Hotel"}
      />
      <p className="max-w-md text-center text-xs text-mut">
        ลองพิมพ์ “มีห้องว่างเสาร์นี้ไหม” → ถามราคา → “จองเลย” —
        จองสำเร็จแล้วไปดูตัวเลขขยับที่หน้าภาพรวมได้
      </p>
    </main>
  );
}
