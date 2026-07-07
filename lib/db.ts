import { getDb, save, newId } from "./store";

// ===== Data layer =====
// ทุกโมดูลเรียกข้อมูลผ่านไฟล์นี้ที่เดียว — เบื้องหลังคือ local JSON store (lib/store.ts)
// อยากย้ายไป DB จริงเมื่อไหร่ แก้ที่นี่ไฟล์เดียว โมดูลอื่นไม่แตะ

// ---------- Properties / Hotels ----------
export async function getProperties() {
  return getDb().properties;
}

// สร้างห้อง + ราคา OTA + metrics จาก room_types ของโรงแรม — ใช้ทั้งตอนสร้างและตอนแก้ผังห้อง
function genRoomsFor(p: any) {
  let n = 0;
  return p.room_types.flatMap((rt: any) =>
    Array.from({ length: rt.count }, () => {
      n += 1;
      return {
        id: `${p.id}-r${n}`,
        hotel_id: p.id,
        room_number: String(n).padStart(2, "0"),
        room_type: rt.type,
        base_price: rt.base_price,
        status: "available",
      };
    }),
  );
}
function genRatesFor(p: any) {
  return p.room_types.flatMap((rt: any) =>
    p.channels
      .filter((c: string) => c !== "Direct")
      .map((c: string) => ({
        hotel_id: p.id,
        room_type: rt.type,
        channel: c,
        price: Math.round((rt.base_price * 1.18) / 10) * 10,
        promo: null,
      })),
  );
}
function genMetricsFor(p: any) {
  const avgPrice =
    p.room_types.reduce((s: number, rt: any) => s + rt.base_price * rt.count, 0) /
    Math.max(1, p.total_rooms);
  const day = (o: number) => {
    const d = new Date();
    d.setDate(d.getDate() + o);
    return d.toISOString().slice(0, 10);
  };
  return Array.from({ length: 30 }, (_, i) => {
    const occ = Math.max(30, Math.min(70, 48 + Math.round(8 * Math.sin(i / 3))));
    const adr = Math.round(avgPrice + (i % 4) * 60);
    return {
      hotel_id: p.id,
      metric_date: day(i - 29),
      occupancy_rate: occ,
      adr,
      revpar: Math.round((adr * occ) / 100),
      total_bookings: Math.round((occ / 100) * p.total_rooms),
      total_revenue: Math.round((occ / 100) * p.total_rooms * adr),
    };
  });
}

const DEFAULT_ONBOARDING = [
  "เซ็นสัญญา + กำหนดขอบเขตบริการ",
  "เก็บข้อมูลห้อง/rate plan/รูปถ่าย",
  "เชื่อม channel manager + ผูก OTA",
  "ตั้ง rate strategy + เป้ารายเดือน",
  "ตั้งค่า review monitoring",
  "นัด kickoff กับเจ้าของ",
];

export async function createProperty(input: any) {
  const db = getDb();
  const id = newId("h");
  const room_types = input.room_types.map((rt: any) => ({
    type: String(rt.type),
    count: Number(rt.count),
    base_price: Number(rt.base_price),
  }));
  const channels = [...new Set(["Direct", ...(input.channels ?? [])])];
  const property = {
    id,
    name: String(input.name).trim(),
    location: String(input.location).trim(),
    segment: String(input.segment).trim(),
    total_rooms: room_types.reduce((s: number, rt: any) => s + rt.count, 0),
    services: input.services ?? [],
    contract_until: input.contract_until,
    channel_manager: input.channel_manager || "ยังไม่เชื่อม",
    channels,
    contacts: input.contact?.name
      ? [{ name: input.contact.name, role: input.contact.role || "เจ้าของ", phone: input.contact.phone || "-", line: "-" }]
      : [],
    room_types,
    // ลูกค้าใหม่เริ่มที่เช็กลิสต์ onboarding เสมอ
    onboarding: DEFAULT_ONBOARDING.map((label, i) => ({ label, done: i === 0 })),
  };
  db.properties.push(property);
  db.rooms.push(...genRoomsFor(property));
  db.ota_rates.push(...genRatesFor(property));
  db.metrics.push(...genMetricsFor(property));
  db.performance.push({
    hotel_id: id,
    occupancy: 48,
    occupancy_target: Number(input.occupancy_target ?? 60),
    adr: Math.round(
      room_types.reduce((s: number, rt: any) => s + rt.base_price * rt.count, 0) /
        Math.max(1, property.total_rooms),
    ),
    revpar: 0,
    pickup_7d: 0,
    cancel_rate: 5,
    cancel_rate_prev: 5,
    review_score: null,
  });
  save();
  return property;
}

export async function updateProperty(id: string, patch: any) {
  const db = getDb();
  const p = db.properties.find((x: any) => x.id === id);
  if (!p) return null;
  const roomTypesChanged = !!patch.room_types;
  Object.assign(p, patch);
  if (patch.channels) p.channels = [...new Set(["Direct", ...patch.channels])];
  if (roomTypesChanged) {
    p.total_rooms = p.room_types.reduce((s: number, rt: any) => s + rt.count, 0);
    // ผังห้องเปลี่ยน → สร้างห้องและราคา OTA ใหม่ (การจองเดิมคงไว้เป็นประวัติ)
    db.rooms = db.rooms.filter((r: any) => r.hotel_id !== id);
    db.ota_rates = db.ota_rates.filter((r: any) => r.hotel_id !== id);
    db.rooms.push(...genRoomsFor(p));
    db.ota_rates.push(...genRatesFor(p));
  }
  save();
  return p;
}

export async function deleteProperty(id: string) {
  const db = getDb();
  if (db.properties.length <= 1) return "last"; // กันลบโรงแรมสุดท้าย
  const i = db.properties.findIndex((x: any) => x.id === id);
  if (i < 0) return null;
  db.properties.splice(i, 1);
  // cascade ทุกอย่างที่ผูกกับโรงแรมนี้ — ดีลใน CRM คงไว้แต่ปลดโรงแรมออก
  db.rooms = db.rooms.filter((x: any) => x.hotel_id !== id);
  db.bookings = db.bookings.filter((x: any) => x.hotel_id !== id);
  db.reviews = db.reviews.filter((x: any) => x.hotel_id !== id);
  db.metrics = db.metrics.filter((x: any) => x.hotel_id !== id);
  db.performance = db.performance.filter((x: any) => x.hotel_id !== id);
  db.ota_rates = db.ota_rates.filter((x: any) => x.hotel_id !== id);
  db.tasks = db.tasks.filter((x: any) => x.hotel_id !== id);
  db.campaigns = db.campaigns.filter((x: any) => x.hotel_id !== id);
  db.leads = db.leads.map((l: any) =>
    l.hotel_id === id ? { ...l, hotel_id: null } : l,
  );
  save();
  return true;
}
export async function getHotels() {
  return getDb().properties.map((p: any) => ({
    id: p.id,
    name: p.name,
    location: p.location,
    total_rooms: p.total_rooms,
  }));
}

// ---------- Rooms ----------
export async function getRooms(hotelId: string) {
  return getDb().rooms.filter((r: any) => r.hotel_id === hotelId);
}
export async function getAllRooms() {
  return getDb().rooms;
}

// ---------- Bookings ----------
export async function getBookings(hotelId: string) {
  return getDb().bookings.filter((b: any) => b.hotel_id === hotelId);
}
export async function getOverlappingBookings(
  hotelId: string,
  checkin: string,
  checkout: string,
) {
  return getDb().bookings.filter(
    (b: any) =>
      b.hotel_id === hotelId &&
      b.status === "confirmed" &&
      b.checkin_date < checkout &&
      b.checkout_date > checkin,
  );
}
export async function getBookingsCoveringDate(hotelId: string, dateISO: string) {
  return getDb().bookings.filter(
    (b: any) =>
      b.hotel_id === hotelId &&
      b.status === "confirmed" &&
      b.checkin_date <= dateISO &&
      b.checkout_date > dateISO,
  );
}
export async function insertBooking(b: any) {
  getDb().bookings.push({ id: newId("b"), ...b });
  save();
}
export async function updateBooking(id: string, patch: any) {
  const b = getDb().bookings.find((x: any) => x.id === id);
  if (!b) return null;
  Object.assign(b, patch);
  save();
  return b;
}
export async function upsertBookings(rows: any[]) {
  const db = getDb();
  for (const row of rows) {
    const i = db.bookings.findIndex((b: any) => b.source_ref === row.source_ref);
    if (i >= 0) db.bookings[i] = { ...db.bookings[i], ...row };
    else db.bookings.push({ id: newId("b"), ...row });
  }
  save();
}

// ---------- Reviews ----------
export async function getReviews(hotelId: string) {
  return getDb().reviews.filter((r: any) => r.hotel_id === hotelId);
}
export async function getPendingReviews() {
  return getDb().reviews.filter((r: any) => r.sentiment == null);
}
export async function updateReviewAnalysis(
  id: string,
  sentiment: string,
  topics: string[],
) {
  const r = getDb().reviews.find((x: any) => x.id === id);
  if (r) {
    r.sentiment = sentiment;
    r.topics = topics;
    save();
  }
}

// ---------- Metrics ----------
export async function getAllMetrics() {
  return getDb().metrics;
}
export async function getMetrics(hotelId: string, limit: number) {
  return getDb()
    .metrics.filter((m: any) => m.hotel_id === hotelId)
    .slice(-limit);
}
export async function getRecentMetrics(hotelId: string, limit: number) {
  return getDb()
    .metrics.filter((m: any) => m.hotel_id === hotelId)
    .slice(-limit)
    .reverse();
}
export async function upsertDailyMetric(row: any) {
  const db = getDb();
  const i = db.metrics.findIndex(
    (m: any) => m.hotel_id === row.hotel_id && m.metric_date === row.metric_date,
  );
  if (i >= 0) db.metrics[i] = row;
  else db.metrics.push(row);
  save();
}

// ---------- Performance / Rates ----------
export async function getPerformance() {
  return getDb().performance;
}
export async function getOtaRates() {
  return getDb().ota_rates;
}
export async function updateRate(
  key: { hotel_id: string; room_type: string; channel: string },
  patch: { price?: number; promo?: string | null },
) {
  const r = getDb().ota_rates.find(
    (x: any) =>
      x.hotel_id === key.hotel_id &&
      x.room_type === key.room_type &&
      x.channel === key.channel,
  );
  if (!r) return null;
  Object.assign(r, patch);
  save();
  return r;
}

// ---------- Tasks ----------
export async function getTasks() {
  return getDb().tasks;
}
export async function createTask(t: any) {
  const task = { id: newId("t"), status: "todo", recurring: null, ...t };
  getDb().tasks.push(task);
  save();
  return task;
}
export async function updateTask(id: string, patch: any) {
  const t = getDb().tasks.find((x: any) => x.id === id);
  if (!t) return null;
  Object.assign(t, patch);
  save();
  return t;
}
export async function deleteTask(id: string) {
  const db = getDb();
  const i = db.tasks.findIndex((x: any) => x.id === id);
  if (i < 0) return false;
  db.tasks.splice(i, 1);
  save();
  return true;
}

// ---------- Leads ----------
export async function getLeads() {
  return getDb().leads;
}
export async function createLead(l: any) {
  const lead = { id: newId("l"), stage: "contact", ...l };
  getDb().leads.push(lead);
  save();
  return lead;
}
export async function updateLead(id: string, patch: any) {
  const l = getDb().leads.find((x: any) => x.id === id);
  if (!l) return null;
  Object.assign(l, patch);
  save();
  return l;
}
export async function deleteLead(id: string) {
  const db = getDb();
  const i = db.leads.findIndex((x: any) => x.id === id);
  if (i < 0) return false;
  db.leads.splice(i, 1);
  save();
  return true;
}

// ---------- Campaigns ----------
export async function getCampaigns() {
  return getDb().campaigns;
}
export async function createCampaign(c: any) {
  const campaign = { id: newId("c"), status: "planned", result: null, ...c };
  getDb().campaigns.push(campaign);
  save();
  return campaign;
}
export async function updateCampaign(id: string, patch: any) {
  const c = getDb().campaigns.find((x: any) => x.id === id);
  if (!c) return null;
  Object.assign(c, patch);
  save();
  return c;
}
export async function deleteCampaign(id: string) {
  const db = getDb();
  const i = db.campaigns.findIndex((x: any) => x.id === id);
  if (i < 0) return false;
  db.campaigns.splice(i, 1);
  save();
  return true;
}

// ---------- Message logs ----------
export async function insertMessageLog(log: any) {
  getDb().message_logs.push(log);
  save();
}
