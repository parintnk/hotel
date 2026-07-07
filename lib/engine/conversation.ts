import * as db from "@/lib/db";
import { askAI, askAIJSON } from "@/lib/ai";
import type { IncomingMessage, BotReply, Intent } from "@/lib/types";

type Classification = {
  intent: Intent;
  confidence: number;
  checkin?: string | null;
  checkout?: string | null;
  roomType?: string | null;
};

// รวมประวัติแชทเป็น transcript — classifier stateless เฉยๆ จองไม่สำเร็จ (ลืมวันที่ที่คุยไปแล้ว)
const transcript = (msg: IncomingMessage) =>
  [
    ...(msg.history ?? []).slice(-8).map(
      (t) => `${t.from === "user" ? "User" : "Assistant"}: ${t.text}`,
    ),
    `User: ${msg.text}`,
  ].join("\n");

async function classify(msg: IncomingMessage): Promise<Classification> {
  const today = new Date().toISOString().slice(0, 10);
  const system =
    `You are an intent classifier for a hotel booking assistant. Today is ${today}. ` +
    `You get the conversation so far; classify the LAST user message in context. ` +
    `Return ONLY JSON: {"intent":"check_availability"|"book"|"price"|"complaint"|"general",` +
    `"confidence":0..1,"checkin":"YYYY-MM-DD"|null,"checkout":"YYYY-MM-DD"|null,"roomType":string|null}. ` +
    `Resolve relative dates like "this weekend". ` +
    `Carry over dates/roomType mentioned earlier in the conversation when the last message omits them. ` +
    `A short confirmation (e.g. "สนใจ", "จองเลย", "เอาเลย") after the assistant offered rooms means intent "book" with those dates.`;
  return askAIJSON<Classification>({
    system,
    user: transcript(msg),
    model: "fast",
  });
}

async function log(
  msg: IncomingMessage,
  dir: "in" | "out",
  intent: string | null,
  by: string | null,
  content?: string,
) {
  await db.insertMessageLog({
    hotel_id: msg.hotelId,
    platform: "mock_chat",
    direction: dir,
    detected_intent: intent,
    handled_by: by,
    content: content ?? msg.text,
    created_at: new Date().toISOString(),
  });
}

async function freeRooms(msg: IncomingMessage, c: Classification) {
  const rooms = await db.getRooms(msg.hotelId);
  const booked = await db.getOverlappingBookings(
    msg.hotelId,
    c.checkin!,
    c.checkout!,
  );
  const taken = new Set(booked.map((b: any) => b.room_id));
  return rooms.filter(
    (r: any) => !taken.has(r.id) && (!c.roomType || r.room_type === c.roomType),
  );
}

async function checkAvailability(
  msg: IncomingMessage,
  c: Classification,
): Promise<BotReply> {
  if (!c.checkin || !c.checkout)
    return {
      text: "รบกวนบอกวันเช็คอินและเช็คเอาท์ด้วยครับ 🙏",
      intent: "check_availability",
      handledBy: "ai",
    };
  const free = await freeRooms(msg, c);
  if (free.length === 0)
    return {
      text: `ช่วง ${c.checkin}–${c.checkout} ห้องเต็มพอดีครับ ลองปรับวันได้ไหมครับ?`,
      intent: "check_availability",
      handledBy: "ai",
    };
  const cheapest = [...free].sort((a, b) => a.base_price - b.base_price)[0];
  return {
    text: `ช่วง ${c.checkin}–${c.checkout} มีห้องว่าง ${free.length} ห้องครับ เริ่มต้นห้อง ${cheapest.room_type} คืนละ ${cheapest.base_price.toLocaleString()} บาท สนใจจองไหมครับ?`,
    intent: "check_availability",
    handledBy: "ai",
  };
}

async function createBooking(
  msg: IncomingMessage,
  c: Classification,
): Promise<BotReply> {
  if (!c.checkin || !c.checkout)
    return {
      text: "รบกวนบอกวันที่เข้าพักด้วยครับ แล้วผมจองให้เลย",
      intent: "book",
      handledBy: "ai",
    };
  const free = await freeRooms(msg, c);
  if (free.length === 0)
    return {
      text: `ขออภัยครับ ช่วง ${c.checkin}–${c.checkout} ไม่มีห้องว่างแล้ว`,
      intent: "book",
      handledBy: "ai",
    };
  const room = free[0];
  await db.insertBooking({
    hotel_id: msg.hotelId,
    room_id: room.id,
    guest_name: "Chat Guest",
    channel: "Chat",
    checkin_date: c.checkin,
    checkout_date: c.checkout,
    amount: room.base_price,
    status: "confirmed",
    source_ref: `CHAT-${Date.now()}`,
  });
  return {
    text: `จองสำเร็จครับ ✅ ห้อง ${room.room_type} (${room.room_number}) ${c.checkin}–${c.checkout} คืนละ ${room.base_price.toLocaleString()} บาท`,
    intent: "book",
    handledBy: "ai",
  };
}

async function getPricing(msg: IncomingMessage): Promise<BotReply> {
  const rooms = await db.getRooms(msg.hotelId);
  const byType = new Map<string, number>();
  for (const r of rooms)
    if (!byType.has(r.room_type) || r.base_price < byType.get(r.room_type)!)
      byType.set(r.room_type, r.base_price);
  const lines = [...byType]
    .map(([t, p]) => `• ${t}: เริ่มต้น ${p.toLocaleString()} บาท/คืน`)
    .join("\n");
  return {
    text: `ราคาห้องพักครับ:\n${lines}`,
    intent: "price",
    handledBy: "ai",
  };
}

async function generalAnswer(msg: IncomingMessage): Promise<BotReply> {
  const hotels = await db.getHotels();
  const hotelName =
    hotels.find((h: any) => h.id === msg.hotelId)?.name ?? "ของเรา";
  const text = await askAI({
    system: `คุณคือผู้ช่วยชายของโรงแรม ${hotelName} ตอบข้อความล่าสุดของลูกค้าให้ต่อเนื่องกับบทสนทนา สั้น สุภาพ เป็นกันเอง ภาษาไทย ลงท้าย 'ครับ' ถ้าไม่รู้ให้เสนอส่งต่อพนักงาน`,
    user: transcript(msg),
    model: "smart",
    maxTokens: 300,
  });
  return { text, intent: "general", handledBy: "ai" };
}

export async function handleMessage(msg: IncomingMessage): Promise<BotReply> {
  await log(msg, "in", null, null);
  const c = await classify(msg);
  if (c.confidence < 0.5 || c.intent === "complaint") {
    const reply: BotReply = {
      text: "ขอส่งเรื่องนี้ให้ทีมงานดูแลนะครับ เดี๋ยวมีเจ้าหน้าที่ติดต่อกลับไปครับ 🙏",
      intent: c.intent,
      handledBy: "human",
    };
    await log(msg, "out", c.intent, "human", reply.text);
    return reply;
  }
  let reply: BotReply;
  if (c.intent === "check_availability")
    reply = await checkAvailability(msg, c);
  else if (c.intent === "book") reply = await createBooking(msg, c);
  else if (c.intent === "price") reply = await getPricing(msg);
  else reply = await generalAnswer(msg);
  await log(msg, "out", reply.intent, reply.handledBy, reply.text);
  return reply;
}
