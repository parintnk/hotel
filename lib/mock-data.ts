export const day = (o: number) => {
  const d = new Date();
  d.setDate(d.getDate() + o);
  return d.toISOString().slice(0, 10);
};
const NAMES = ["Somchai", "Anna", "Kenji", "Maria", "David", "Ploy", "Lee", "Nina"];

// ===== Agency layer: ศูนย์กลางข้อมูลโรงแรมลูกค้า (Property Hub) =====
export const PROPERTIES = [
  {
    id: "h1",
    name: "Riverside Boutique",
    location: "เชียงใหม่",
    segment: "Boutique ริมน้ำ",
    total_rooms: 8,
    services: ["Online Revenue Management", "RevPlus+", "Marketing Communication"],
    contract_until: day(220),
    channel_manager: "SiteMinder",
    channels: ["Direct", "Booking.com", "Agoda"],
    contacts: [
      { name: "คุณสมชาย วงศ์ดี", role: "เจ้าของ", phone: "081-000-1001", line: "@riverside-owner" },
      { name: "คุณแพร", role: "GM", phone: "081-000-1002", line: "@prae.gm" },
    ],
    room_types: [
      { type: "Standard", count: 3, base_price: 1200 },
      { type: "Deluxe", count: 3, base_price: 1800 },
      { type: "Suite", count: 2, base_price: 2400 },
    ],
    onboarding: null as null | { label: string; done: boolean }[],
  },
  {
    id: "h2",
    name: "City Central Hotel",
    location: "กรุงเทพฯ",
    segment: "City hotel",
    total_rooms: 8,
    services: ["Online Revenue Management", "Sales Offline"],
    contract_until: day(150),
    channel_manager: "SiteMinder",
    channels: ["Direct", "Booking.com", "Agoda", "Expedia"],
    contacts: [{ name: "คุณวิชัย ตั้งใจ", role: "MD", phone: "081-000-2001", line: "@citycentral" }],
    room_types: [
      { type: "Standard", count: 4, base_price: 1400 },
      { type: "Deluxe", count: 4, base_price: 2100 },
    ],
    onboarding: null,
  },
  {
    id: "h3",
    name: "Baan Suan Resort",
    location: "เขาใหญ่",
    segment: "Resort ครอบครัว",
    total_rooms: 14,
    services: ["Online Revenue Management", "Marketing Communication"],
    contract_until: day(310),
    channel_manager: "HotelLink",
    channels: ["Direct", "Booking.com", "Agoda"],
    contacts: [{ name: "คุณนก", role: "เจ้าของ", phone: "081-000-3001", line: "@baansuan" }],
    room_types: [
      { type: "Villa", count: 6, base_price: 3200 },
      { type: "Deluxe", count: 8, base_price: 2200 },
    ],
    onboarding: null,
  },
  {
    id: "h4",
    name: "The Sand Beachfront",
    location: "กระบี่",
    segment: "Beach resort",
    total_rooms: 20,
    services: ["Online Revenue Management", "RevPlus+", "Sales Offline"],
    contract_until: day(95),
    channel_manager: "SiteMinder",
    channels: ["Direct", "Booking.com", "Agoda", "Expedia"],
    contacts: [{ name: "คุณเจมส์", role: "Owner rep", phone: "081-000-4001", line: "@thesand" }],
    room_types: [
      { type: "Standard", count: 10, base_price: 1900 },
      { type: "Sea View", count: 8, base_price: 2800 },
      { type: "Pool Villa", count: 2, base_price: 5500 },
    ],
    onboarding: null,
  },
  {
    id: "h5",
    name: "Nimman Loft",
    location: "เชียงใหม่",
    segment: "Design hostel-hotel",
    total_rooms: 12,
    services: ["Online Revenue Management", "Marketing Communication", "RevPlus+"],
    contract_until: day(400),
    channel_manager: "HotelLink",
    channels: ["Direct", "Booking.com", "Agoda"],
    contacts: [{ name: "คุณมายด์", role: "เจ้าของ", phone: "081-000-5001", line: "@nimmanloft" }],
    room_types: [
      { type: "Loft", count: 8, base_price: 1600 },
      { type: "Duplex", count: 4, base_price: 2500 },
    ],
    onboarding: null,
  },
  {
    id: "h6",
    name: "Riverfront Heritage",
    location: "อยุธยา",
    segment: "Heritage boutique",
    total_rooms: 10,
    services: ["RevPlus+", "Online Revenue Management"],
    contract_until: day(365),
    channel_manager: "ยังไม่เชื่อม",
    channels: ["Direct", "Booking.com"],
    contacts: [{ name: "คุณโอ๋", role: "เจ้าของ", phone: "081-000-6001", line: "@riverfront" }],
    room_types: [
      { type: "Heritage Room", count: 8, base_price: 2000 },
      { type: "River Suite", count: 2, base_price: 3600 },
    ],
    // ลูกค้าใหม่ — เช็กลิสต์ onboarding
    onboarding: [
      { label: "เซ็นสัญญา + กำหนดขอบเขตบริการ", done: true },
      { label: "เก็บข้อมูลห้อง/rate plan/รูปถ่าย", done: true },
      { label: "เชื่อม channel manager + ผูก OTA", done: false },
      { label: "ตั้ง rate strategy + เป้ารายเดือน", done: false },
      { label: "ตั้งค่า review monitoring", done: false },
      { label: "นัด kickoff กับเจ้าของ", done: true },
    ],
  },
];

// โครงที่ engine ใช้ (chat/ETL/metrics) — derive จาก PROPERTIES ทุกโรงแรม จะได้ไม่กรอกซ้ำ
export const HOTELS = PROPERTIES.map((p) => ({
  id: p.id,
  name: p.name,
  location: p.location,
  total_rooms: p.total_rooms,
}));

// ===== Channel & Rate Management: ราคาบน OTA (เช็ค rate parity) =====
export const OTA_RATES: {
  hotel_id: string;
  room_type: string;
  channel: string;
  price: number;
  promo: string | null;
}[] = PROPERTIES.flatMap((p) =>
  p.room_types.flatMap((rt) =>
    p.channels
      .filter((c) => c !== "Direct")
      .map((c) => ({
        hotel_id: p.id,
        room_type: rt.type,
        channel: c,
        price: Math.round((rt.base_price * 1.18) / 10) * 10, // ราคาขาย OTA (บวก markup มาตรฐาน)
        promo: null as string | null,
      })),
  ),
);
// จงใจปล่อย parity หลุด 3 จุด — ให้ระบบตรวจเจอ
{
  const set = (hid: string, rt: string, ch: string, price: number, promo?: string) => {
    const r = OTA_RATES.find(
      (x) => x.hotel_id === hid && x.room_type === rt && x.channel === ch,
    );
    if (r) {
      r.price = price;
      if (promo) r.promo = promo;
    }
  };
  set("h2", "Deluxe", "Agoda", 2180, "Flash Sale -12%");
  set("h4", "Standard", "Expedia", 2450);
  set("h3", "Villa", "Booking.com", 3560, "Mobile rate");
}

// ===== Performance & Alerts: snapshot รายโรงแรม (เทียบเป้า) =====
export const PERFORMANCE = [
  { hotel_id: "h1", occupancy: 74, occupancy_target: 70, adr: 1450, revpar: 1073, pickup_7d: 14, cancel_rate: 6, cancel_rate_prev: 5, review_score: 4.4 },
  { hotel_id: "h2", occupancy: 58, occupancy_target: 75, adr: 1620, revpar: 940, pickup_7d: 6, cancel_rate: 9, cancel_rate_prev: 8, review_score: 4.1 },
  { hotel_id: "h3", occupancy: 81, occupancy_target: 80, adr: 2540, revpar: 2057, pickup_7d: 11, cancel_rate: 18, cancel_rate_prev: 6, review_score: 4.6 },
  { hotel_id: "h4", occupancy: 66, occupancy_target: 65, adr: 2340, revpar: 1544, pickup_7d: 4, cancel_rate: 7, cancel_rate_prev: 7, review_score: 3.7 },
  { hotel_id: "h5", occupancy: 88, occupancy_target: 72, adr: 1790, revpar: 1575, pickup_7d: 19, cancel_rate: 4, cancel_rate_prev: 5, review_score: 4.8 },
  { hotel_id: "h6", occupancy: 45, occupancy_target: 60, adr: 2150, revpar: 968, pickup_7d: 7, cancel_rate: 5, cancel_rate_prev: 5, review_score: 4.0 },
];

// ===== Task & Workflow =====
export const TASKS: {
  id: string;
  hotel_id: string | null;
  title: string;
  service: string;
  assignee: string;
  due: string;
  status: "todo" | "doing" | "done";
  recurring: "weekly" | "monthly" | null;
}[] = [
  { id: "t1", hotel_id: "h2", title: "รีวิวราคาสุดสัปดาห์ + ปรับ BAR", service: "Revenue", assignee: "พี่เมย์", due: day(0), status: "doing", recurring: "weekly" },
  { id: "t2", hotel_id: "h3", title: "หาสาเหตุยอดยกเลิกพุ่ง (18%)", service: "Revenue", assignee: "พี่เมย์", due: day(0), status: "todo", recurring: null },
  { id: "t3", hotel_id: "h4", title: "แผนกู้คะแนนรีวิว (3.7) — คุยกับ GM", service: "RevPlus+", assignee: "คุณต้น", due: day(-1), status: "todo", recurring: null },
  { id: "t4", hotel_id: "h2", title: "แก้ rate parity Agoda (Flash Sale หลุด)", service: "Revenue", assignee: "พี่เมย์", due: day(1), status: "todo", recurring: null },
  { id: "t5", hotel_id: "h6", title: "เชื่อม channel manager + ผูก Booking.com", service: "Onboarding", assignee: "คุณต้น", due: day(2), status: "doing", recurring: null },
  { id: "t6", hotel_id: "h5", title: "คอนเทนต์ IG ชุดใหม่ (ห้อง Duplex)", service: "Marketing", assignee: "ทีม Marketing", due: day(3), status: "todo", recurring: null },
  { id: "t7", hotel_id: null, title: "รายงานรายเดือนส่งลูกค้าทุกราย", service: "Reporting", assignee: "ทีม Ops", due: day(5), status: "todo", recurring: "monthly" },
  { id: "t8", hotel_id: "h1", title: "ต่อรองโควต้าห้อง Agoda Q4", service: "Revenue", assignee: "พี่เมย์", due: day(6), status: "todo", recurring: null },
  { id: "t9", hotel_id: "h4", title: "เจรจา corporate rate — บ.ทัวร์ภูเก็ต", service: "Sales", assignee: "คุณบอส", due: day(4), status: "doing", recurring: null },
  { id: "t10", hotel_id: "h3", title: "สรุปผลแคมเปญ Facebook เดือนที่แล้ว", service: "Marketing", assignee: "ทีม Marketing", due: day(-2), status: "done", recurring: null },
  { id: "t11", hotel_id: "h1", title: "อัปเดตรูปห้อง Suite บน Booking.com", service: "Revenue", assignee: "น้องจูน", due: day(1), status: "todo", recurring: null },
  { id: "t12", hotel_id: "h5", title: "ตอบรีวิว Google ค้าง 3 รายการ", service: "Marketing", assignee: "น้องจูน", due: day(0), status: "doing", recurring: null },
  { id: "t13", hotel_id: "h4", title: "เช็คราคา Expedia หลัง sync (parity หลุด)", service: "Revenue", assignee: "พี่เมย์", due: day(0), status: "todo", recurring: null },
  { id: "t14", hotel_id: "h2", title: "วางแผนโปรโมชั่นวันหยุดยาวเดือนหน้า", service: "Revenue", assignee: "พี่เมย์", due: day(8), status: "todo", recurring: null },
  { id: "t15", hotel_id: "h6", title: "ถ่ายรูปห้อง River Suite ชุดใหม่", service: "Onboarding", assignee: "ทีม Marketing", due: day(5), status: "todo", recurring: null },
  { id: "t16", hotel_id: "h6", title: "ตั้งค่า review monitoring ทุกช่องทาง", service: "Onboarding", assignee: "คุณต้น", due: day(4), status: "todo", recurring: null },
  { id: "t17", hotel_id: "h3", title: "คุยแพ็คเกจครอบครัว + บัตรสวนสัตว์", service: "Sales", assignee: "คุณบอส", due: day(7), status: "todo", recurring: null },
  { id: "t18", hotel_id: null, title: "รีวิวราคารายสัปดาห์ — ทุกโรงแรม", service: "Revenue", assignee: "พี่เมย์", due: day(7), status: "todo", recurring: "weekly" },
  { id: "t19", hotel_id: "h4", title: "ต่อสัญญา corporate rate โรงงานกระบี่", service: "Sales", assignee: "คุณบอส", due: day(-3), status: "done", recurring: null },
  { id: "t20", hotel_id: "h5", title: "ทำ A/B รูปปกห้อง Loft บน Agoda", service: "Revenue", assignee: "น้องจูน", due: day(3), status: "doing", recurring: null },
  { id: "t21", hotel_id: "h1", title: "เตรียมข้อมูล quarterly review กับเจ้าของ", service: "RevPlus+", assignee: "คุณต้น", due: day(10), status: "todo", recurring: null },
  { id: "t22", hotel_id: "h2", title: "ตรวจ allotment ห้องช่วงงานแฟร์", service: "Revenue", assignee: "พี่เมย์", due: day(2), status: "todo", recurring: null },
  { id: "t23", hotel_id: "h3", title: "อัปเดตราคา Villa ช่วง long weekend", service: "Revenue", assignee: "พี่เมย์", due: day(-1), status: "done", recurring: null },
  { id: "t24", hotel_id: "h4", title: "brief ช่างภาพ drone วิวหาด", service: "Marketing", assignee: "ทีม Marketing", due: day(9), status: "todo", recurring: null },
  { id: "t25", hotel_id: null, title: "ประชุมทีมสรุป pipeline รายสัปดาห์", service: "Sales", assignee: "คุณบอส", due: day(2), status: "todo", recurring: "weekly" },
  { id: "t26", hotel_id: "h6", title: "เปิดรับจองตรงผ่านเว็บ (จากรีวิวลูกค้าบ่น)", service: "Onboarding", assignee: "คุณต้น", due: day(12), status: "todo", recurring: null },
  { id: "t27", hotel_id: "h5", title: "สรุปยอด direct booking หลังแคมเปญ", service: "Reporting", assignee: "ทีม Ops", due: day(-4), status: "done", recurring: null },
  { id: "t28", hotel_id: "h2", title: "โทรตาม feedback ลูกค้า corporate 2 ราย", service: "Sales", assignee: "คุณบอส", due: day(1), status: "doing", recurring: null },
];

// ===== Marketing Calendar =====
export const CAMPAIGNS = [
  { id: "c1", hotel_id: "h5", title: "รีล 'Loft มุมถ่ายรูป' ×3", channel: "Instagram", date: day(1), status: "planned", budget: 3000, result: null },
  { id: "c2", hotel_id: "h1", title: "โพสต์รีวิวแขก + ห้องริมน้ำ", channel: "Facebook", date: day(2), status: "planned", budget: 1500, result: null },
  { id: "c3", hotel_id: "h3", title: "Agoda Mid-year Sale (-15%)", channel: "Agoda", date: day(0), status: "live", budget: 0, result: "จองแล้ว 9 คืน" },
  { id: "c4", hotel_id: "h4", title: "Google Hotel Ads — high season", channel: "Google", date: day(7), status: "planned", budget: 12000, result: null },
  { id: "c5", hotel_id: "h5", title: "Boost โพสต์ Duplex + โปรจองตรง", channel: "Facebook", date: day(5), status: "planned", budget: 4000, result: null },
  { id: "c6", hotel_id: "h1", title: "อีเมลหาแขกเก่า — โปรหน้าฝน", channel: "Email", date: day(9), status: "planned", budget: 0, result: null },
  { id: "c7", hotel_id: "h3", title: "คลิปรีวิวครอบครัว + สวนสัตว์เขาใหญ่", channel: "TikTok", date: day(-3), status: "done", budget: 5000, result: "reach 48k · จอง 12 คืน" },
  { id: "c8", hotel_id: "h6", title: "เปิดตัวเพจ + ชุดภาพ Heritage", channel: "Facebook", date: day(12), status: "planned", budget: 6000, result: null },
  { id: "c9", hotel_id: "h1", title: "คลิปพาทัวร์ห้อง Suite ริมน้ำ", channel: "TikTok", date: day(-8), status: "done", budget: 3500, result: "reach 31k · จอง 6 คืน" },
  { id: "c10", hotel_id: "h2", title: "Agoda Preferred Partner boost", channel: "Agoda", date: day(-12), status: "done", budget: 0, result: "อันดับขึ้น 14 → 6" },
  { id: "c11", hotel_id: "h4", title: "รีลดำน้ำจุดใกล้โรงแรม ×2", channel: "Instagram", date: day(-15), status: "done", budget: 4500, result: "reach 22k · save 1.8k" },
  { id: "c12", hotel_id: "h5", title: "โพสต์ collab คาเฟ่นิมมาน", channel: "Instagram", date: day(-6), status: "done", budget: 2000, result: "follower +420" },
  { id: "c13", hotel_id: "h3", title: "แพ็คเกจครอบครัว + บัตรสวนสัตว์", channel: "Facebook", date: day(3), status: "planned", budget: 5000, result: null },
  { id: "c14", hotel_id: "h2", title: "Email โปรจองล่วงหน้า 30 วัน -20%", channel: "Email", date: day(4), status: "planned", budget: 0, result: null },
  { id: "c15", hotel_id: "h4", title: "Booking.com Genius แคมเปญ Q3", channel: "Booking.com", date: day(6), status: "planned", budget: 0, result: null },
  { id: "c16", hotel_id: "h1", title: "โพสต์เมนูอาหารเช้าใหม่", channel: "Facebook", date: day(-4), status: "done", budget: 800, result: "engagement 2.1k" },
  { id: "c17", hotel_id: "h5", title: "TikTok challenge มุมถ่ายรูป Loft", channel: "TikTok", date: day(8), status: "planned", budget: 6000, result: null },
  { id: "c18", hotel_id: "h6", title: "ภาพชุด heritage ลง Google Business", channel: "Google", date: day(15), status: "planned", budget: 0, result: null },
  { id: "c19", hotel_id: "h3", title: "Google Ads คีย์เวิร์ด 'ที่พักเขาใหญ่'", channel: "Google", date: day(-20), status: "done", budget: 9000, result: "CTR 4.2% · จอง 15 คืน" },
  { id: "c20", hotel_id: "h4", title: "โปรหน้าฝน Sea View -25%", channel: "Agoda", date: day(10), status: "planned", budget: 0, result: null },
  { id: "c21", hotel_id: "h2", title: "LINE OA broadcast ลูกค้าเก่า", channel: "Email", date: day(-2), status: "done", budget: 500, result: "เปิดอ่าน 38%" },
  { id: "c22", hotel_id: "h1", title: "รีวิวจากแขก repeat guest (UGC)", channel: "Instagram", date: day(14), status: "planned", budget: 1200, result: null },
];

// ===== Sales Pipeline (CRM) =====
export const LEADS = [
  { id: "l1", company: "บจก.ไทยทราเวล กรุ๊ป", type: "Travel agent", hotel_id: "h4", value: 240000, stage: "nego", next_follow: day(0), owner: "คุณบอส" },
  { id: "l2", company: "บมจ.พลังงานสยาม (corporate)", type: "Corporate", hotel_id: "h2", value: 380000, stage: "proposal", next_follow: day(-1), owner: "คุณบอส" },
  { id: "l3", company: "Wedding planner เชียงใหม่", type: "Event", hotel_id: "h1", value: 150000, stage: "contact", next_follow: day(2), owner: "พี่เมย์" },
  { id: "l4", company: "บ.ทัวร์เกาหลี K-Holiday", type: "Travel agent", hotel_id: "h4", value: 520000, stage: "nego", next_follow: day(1), owner: "คุณบอส" },
  { id: "l5", company: "บจก.ประกันภัยไทยรุ่ง (outing)", type: "Corporate", hotel_id: "h3", value: 95000, stage: "won", next_follow: day(14), owner: "คุณต้น" },
  { id: "l6", company: "Expedia TAAP partnership", type: "OTA deal", hotel_id: null, value: 0, stage: "contact", next_follow: day(3), owner: "พี่เมย์" },
  { id: "l7", company: "บ.จัดสัมมนา BKK Meetings", type: "Corporate", hotel_id: "h2", value: 120000, stage: "lost", next_follow: day(30), owner: "คุณบอส" },
  { id: "l8", company: "บจก.โลจิสติกส์ภาคเหนือ", type: "Corporate", hotel_id: "h1", value: 180000, stage: "contact", next_follow: day(0), owner: "น้องจูน" },
  { id: "l9", company: "China Travel Service (CTS)", type: "Travel agent", hotel_id: "h5", value: 450000, stage: "proposal", next_follow: day(2), owner: "คุณบอส" },
  { id: "l10", company: "งานแต่งคุณฝ้าย–คุณเจมส์ (120 ท่าน)", type: "Event", hotel_id: "h3", value: 220000, stage: "nego", next_follow: day(-2), owner: "พี่เมย์" },
  { id: "l11", company: "บ.ประชุมสัมมนา Siam MICE", type: "Corporate", hotel_id: "h4", value: 310000, stage: "contact", next_follow: day(5), owner: "คุณบอส" },
  { id: "l12", company: "Klook กิจกรรม + ที่พักแพ็คเกจ", type: "OTA deal", hotel_id: "h4", value: 160000, stage: "nego", next_follow: day(1), owner: "น้องจูน" },
  { id: "l13", company: "รถทัวร์เส้นทางอีสาน–เขาใหญ่", type: "Travel agent", hotel_id: "h3", value: 140000, stage: "contact", next_follow: day(4), owner: "พี่เมย์" },
  { id: "l14", company: "บมจ.ธนาคารกรุงสยาม (outing)", type: "Corporate", hotel_id: "h4", value: 480000, stage: "proposal", next_follow: day(0), owner: "คุณบอส" },
  { id: "l15", company: "Agoda Growth Express", type: "OTA deal", hotel_id: null, value: 0, stage: "won", next_follow: day(20), owner: "พี่เมย์" },
  { id: "l16", company: "ครูสอนโยคะ retreat 3 วัน", type: "Event", hotel_id: "h6", value: 85000, stage: "contact", next_follow: day(3), owner: "น้องจูน" },
  { id: "l17", company: "บ.ทัวร์ยุโรป EuroAsia", type: "Travel agent", hotel_id: "h1", value: 260000, stage: "lost", next_follow: day(45), owner: "คุณบอส" },
  { id: "l18", company: "Trip.com แพ็คเกจ FIT จีน", type: "OTA deal", hotel_id: "h5", value: 200000, stage: "nego", next_follow: day(6), owner: "พี่เมย์" },
];

// ห้องจริงของทุกโรงแรม — derive จาก room_types ใน PROPERTIES
export const ROOMS = PROPERTIES.flatMap((p) => {
  let n = 0;
  return p.room_types.flatMap((rt) =>
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
});

// จองตั้งต้น 6 รายการ/โรงแรม (deterministic) — dashboard ทุกแห่งมีข้อมูลทันทีก่อนรัน ETL
export const BOOKINGS: any[] = PROPERTIES.flatMap((p, pi) =>
  [0, 1, 2, 3, 4, 5].map((k) => {
    const rooms = ROOMS.filter((r) => r.hotel_id === p.id);
    const room = rooms[(k * 2 + pi) % rooms.length];
    return {
      id: `${p.id}-b${k}`,
      hotel_id: p.id,
      room_id: room.id,
      guest_name: NAMES[(pi + k * 3) % NAMES.length],
      channel: ["Booking.com", "Agoda", "Walk-in", "Chat"][k % 4],
      checkin_date: day(k * 2 - 3 + (pi % 3)),
      checkout_date: day(k * 2 - 1 + (pi % 3)),
      amount: room.base_price,
      status: "confirmed",
      source_ref: `SEED-${p.id}-${k}`,
    };
  }),
);

export const REVIEWS: any[] = [
  {
    id: "rv1",
    hotel_id: "h1",
    source: "Google",
    rating: 5,
    review_text: "ห้องสะอาดมาก พนักงานน่ารัก",
    sentiment: null,
    topics: null,
  },
  {
    id: "rv2",
    hotel_id: "h1",
    source: "Agoda",
    rating: 2,
    review_text: "แอร์เสีย เรียกช่างช้ามาก",
    sentiment: null,
    topics: null,
  },
  {
    id: "rv3",
    hotel_id: "h1",
    source: "Booking.com",
    rating: 2,
    review_text: "อาหารเช้าน้อยมาก ไม่คุ้ม",
    sentiment: null,
    topics: null,
  },
  {
    id: "rv4",
    hotel_id: "h1",
    source: "Google",
    rating: 4,
    review_text: "ทำเลดี ใกล้ตลาด แต่เสียงดังนิดหน่อย",
    sentiment: null,
    topics: null,
  },
  { id: "rv5", hotel_id: "h2", source: "Booking.com", rating: 4, review_text: "เดินทางสะดวก ติด BTS ห้องเล็กแต่ครบ", sentiment: null, topics: null },
  { id: "rv6", hotel_id: "h2", source: "Agoda", rating: 2, review_text: "เช็คอินช้ามาก รอเกือบชั่วโมง พนักงานหน้าเคาน์เตอร์ไม่พอ", sentiment: null, topics: null },
  { id: "rv7", hotel_id: "h3", source: "Google", rating: 5, review_text: "วิลล่ากว้าง เด็กๆ ชอบสระว่ายน้ำมาก จะกลับมาอีก", sentiment: null, topics: null },
  { id: "rv8", hotel_id: "h3", source: "Booking.com", rating: 3, review_text: "ธรรมชาติดี แต่ยุงเยอะและ Wi-Fi หลุดบ่อย", sentiment: null, topics: null },
  { id: "rv9", hotel_id: "h4", source: "Agoda", rating: 2, review_text: "จ่ายราคา sea view แต่วิวโดนต้นไม้บัง ผิดหวัง", sentiment: null, topics: null },
  { id: "rv10", hotel_id: "h4", source: "Google", rating: 2, review_text: "ชายหาดสวยแต่ห้องน้ำมีกลิ่น อาหารเช้าซ้ำทุกวัน", sentiment: null, topics: null },
  { id: "rv11", hotel_id: "h4", source: "Booking.com", rating: 4, review_text: "ทำเลติดหาด พนักงานยิ้มแย้ม", sentiment: null, topics: null },
  { id: "rv12", hotel_id: "h5", source: "Google", rating: 5, review_text: "ตกแต่งสวยมาก มุมถ่ายรูปเพียบ กาแฟชั้นล่างอร่อย", sentiment: null, topics: null },
  { id: "rv13", hotel_id: "h5", source: "Agoda", rating: 5, review_text: "ห้อง Duplex คุ้มราคา เงียบ นอนสบาย", sentiment: null, topics: null },
  { id: "rv14", hotel_id: "h6", source: "Booking.com", rating: 4, review_text: "บรรยากาศเมืองเก่าดีมาก ขี่จักรยานเที่ยววัดสะดวก", sentiment: null, topics: null },
  { id: "rv15", hotel_id: "h6", source: "Google", rating: 3, review_text: "ห้องสวยแต่จองยาก เว็บไม่มีให้จองตรง ต้องโทรอย่างเดียว", sentiment: null, topics: null },
];

// รีวิวย้อนหลังที่วิเคราะห์ไปแล้วรอบก่อนๆ — เติมให้หน้า UI แน่นแบบของจริง (deterministic ไม่สุ่ม)
const RV_POOL: [number, string, "positive" | "neutral" | "negative", string[]][] = [
  [5, "พนักงานดูแลดีมาก เช็คอินไวไม่ต้องรอ", "positive", ["พนักงาน", "การบริการ"]],
  [5, "เตียงนอนสบายมาก หลับสนิททั้งคืน", "positive", ["ห้องพัก"]],
  [4, "ห้องกว้าง วิวสวย คุ้มกับราคาที่จ่าย", "positive", ["ห้องพัก", "ราคา"]],
  [4, "อาหารเช้าหลากหลาย กาแฟอร่อย", "positive", ["อาหาร"]],
  [5, "สระว่ายน้ำสะอาด ลูกๆ ชอบมาก", "positive", ["สิ่งอำนวยความสะดวก"]],
  [4, "ทำเลดี เดินไปร้านอาหารได้หลายร้าน", "positive", ["ทำเล"]],
  [3, "โดยรวมโอเค แต่ที่จอดรถน้อยไปหน่อย", "neutral", ["ที่จอดรถ"]],
  [3, "ห้องตรงปก แต่ผนังบางได้ยินเสียงข้างห้อง", "neutral", ["ห้องพัก", "เสียงรบกวน"]],
  [3, "เช็คอินช้าไปนิด แต่พนักงานสุภาพดี", "neutral", ["การบริการ"]],
  [2, "น้ำอุ่นเสีย แจ้งช่างแล้วมาช้ามาก", "negative", ["ห้องน้ำ", "การบริการ"]],
  [2, "Wi-Fi หลุดทั้งคืน ทำงานไม่ได้เลย", "negative", ["Wi-Fi"]],
  [1, "ห้องมีกลิ่นอับ ผ้าปูดูไม่สะอาด", "negative", ["ความสะอาด"]],
  [2, "เสียงก่อสร้างข้างโรงแรมดังทั้งวัน", "negative", ["เสียงรบกวน"]],
  [4, "ราคาดีมากช่วงโปร พนักงานเป็นกันเอง", "positive", ["ราคา", "พนักงาน"]],
];
const RV_SOURCES = ["Google", "Agoda", "Booking.com", "TripAdvisor"];
REVIEWS.push(
  ...PROPERTIES.flatMap((p, pi) =>
    Array.from({ length: 6 }, (_, i) => {
      const [rating, text, sentiment, topics] =
        RV_POOL[(pi * 5 + i * 3) % RV_POOL.length];
      return {
        id: `g-${p.id}-${i}`,
        hotel_id: p.id,
        source: RV_SOURCES[(pi + i) % RV_SOURCES.length],
        rating,
        review_text: text,
        sentiment,
        topics,
        reviewed_at: day(-(i * 4 + pi + 4)),
      };
    }),
  ),
);
// รีวิวชุดแรก (ยังไม่วิเคราะห์) ให้เป็นรีวิวล่าสุด
REVIEWS.forEach((r, i) => {
  if (!r.reviewed_at) r.reviewed_at = day(-(i % 4));
});

export const MESSAGE_LOGS: any[] = [];

// 14 วันย้อนหลังของทุกโรงแรม — คาแรกเตอร์ต่อโรงแรมล้อกับ PERFORMANCE snapshot
const METRIC_PROFILE: Record<string, { occ: number; amp: number; adr: number }> = {
  h1: { occ: 68, amp: 18, adr: 1400 },
  h2: { occ: 57, amp: 10, adr: 1580 },
  h3: { occ: 76, amp: 14, adr: 2450 },
  h4: { occ: 64, amp: 9, adr: 2300 },
  h5: { occ: 83, amp: 8, adr: 1740 },
  h6: { occ: 44, amp: 7, adr: 2100 },
};
// 30 วันย้อนหลัง — dashboard เลือกช่วง 7/14/30 วันได้
export const DAILY_METRICS: any[] = PROPERTIES.flatMap((p) => {
  const prof = METRIC_PROFILE[p.id] ?? { occ: 60, amp: 10, adr: 1500 };
  return Array.from({ length: 30 }, (_, i) => {
    const occ = Math.max(
      30,
      Math.min(96, prof.occ + Math.round(prof.amp * Math.sin(i / 2 + p.id.charCodeAt(1)))),
    );
    const adr = prof.adr + (i % 4) * 90;
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
});
