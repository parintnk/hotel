import * as db from "@/lib/db";
import { askAIJSON } from "@/lib/ai";

// AI คิดไอเดียคอนเทนต์ต่อโรงแรม — grounded ด้วยข้อมูลจริง (ทำเล/ห้อง/แคมเปญที่ผ่านมา)
export async function POST(req: Request) {
  const { hotelId } = await req.json();
  const [props, campaigns] = await Promise.all([
    db.getProperties(),
    db.getCampaigns(),
  ]);
  const p: any = props.find((x: any) => x.id === hotelId);
  const ideas = await askAIJSON<{ ideas: { title: string; channel: string; why: string }[] }>({
    system:
      'คุณคือครีเอทีฟเอเจนซี่การตลาดโรงแรม เสนอไอเดียคอนเทนต์ 3 ชิ้น คืน JSON เท่านั้น: {"ideas":[{"title":"ชื่อคอนเทนต์","channel":"Facebook|Instagram|TikTok|Email","why":"ทำไมเหมาะกับโรงแรมนี้ 1 ประโยค"}]} ภาษาไทย ห้ามซ้ำกับแคมเปญที่มีอยู่',
    user: JSON.stringify({
      โรงแรม: { name: p?.name, location: p?.location, segment: p?.segment, room_types: p?.room_types },
      แคมเปญที่มีอยู่: campaigns.filter((c) => c.hotel_id === hotelId).map((c) => c.title),
    }),
    model: "smart",
  });
  return Response.json(ideas);
}
