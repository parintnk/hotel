import fs from "node:fs";
import path from "node:path";
import * as seed from "./mock-data";

// ===== Local JSON store =====
// เก็บทุกอย่างลงไฟล์เดียว data/local-db.json — โหลดครั้งแรกจาก seed (mock-data)
// แล้วทุก mutation เขียนทับไฟล์ทันที ข้อมูลอยู่ครบข้าม restart
// ponytail: single-file JSON พอสำหรับ single-process demo — ถ้าต้อง multi-instance ค่อยขยับไป SQLite
//
// หมายเหตุ: seed ใช้วันที่ relative กับวันที่ seed — ถ้าปล่อยไว้หลายวันข้อมูลจะดูเก่า
// กด "รีเซ็ตข้อมูลเดโม" ใน sidebar (POST /api/admin/reset) เพื่อ seed ใหม่เป็นวันปัจจุบัน

export type DB = {
  seededAt: string;
  properties: any[];
  rooms: any[];
  bookings: any[];
  reviews: any[];
  metrics: any[];
  performance: any[];
  ota_rates: any[];
  tasks: any[];
  campaigns: any[];
  leads: any[];
  message_logs: any[];
};

const FILE = path.join(process.cwd(), "data", "local-db.json");
let cache: DB | null = null;

function fromSeed(): DB {
  return structuredClone({
    seededAt: new Date().toISOString().slice(0, 10),
    properties: seed.PROPERTIES,
    rooms: seed.ROOMS,
    bookings: seed.BOOKINGS,
    reviews: seed.REVIEWS,
    metrics: seed.DAILY_METRICS,
    performance: seed.PERFORMANCE,
    ota_rates: seed.OTA_RATES,
    tasks: seed.TASKS,
    campaigns: seed.CAMPAIGNS,
    leads: seed.LEADS,
    message_logs: [],
  });
}

export function getDb(): DB {
  if (cache) return cache;
  try {
    cache = JSON.parse(fs.readFileSync(FILE, "utf8")) as DB;
  } catch {
    cache = fromSeed();
    save();
  }
  return cache!;
}

export function save() {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(cache, null, 1));
}

export function resetDb(): DB {
  cache = fromSeed();
  save();
  return cache;
}

export const newId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
