import fs from "node:fs";
import os from "node:os";
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

const REPO_FILE = path.join(process.cwd(), "data", "local-db.json");
// ponytail: Vercel/serverless FS อ่านอย่างเดียว — เขียนไม่ได้ก็ตกไป /tmp
// (อยู่แค่ช่วง warm instance, cold start กลับเป็น seed จาก repo — พอสำหรับเดโม, ของจริงย้ายไป DB ที่ lib/db.ts จุดเดียว)
const TMP_FILE = path.join(os.tmpdir(), "hotel-ops-local-db.json");
let FILE = fs.existsSync(TMP_FILE) ? TMP_FILE : REPO_FILE;
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
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, JSON.stringify(cache, null, 1));
  } catch (e) {
    if (FILE === TMP_FILE) throw e;
    FILE = TMP_FILE;
    fs.writeFileSync(FILE, JSON.stringify(cache, null, 1));
  }
}

export function resetDb(): DB {
  cache = fromSeed();
  save();
  return cache;
}

export const newId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
