import { resetDb } from "@/lib/store";

// รีเซ็ตข้อมูลเดโมทั้งหมดกลับเป็น seed ของวันปัจจุบัน (ล้างทุกอย่างที่ผู้ใช้แก้)
export async function POST() {
  const db = resetDb();
  return Response.json({ ok: true, seededAt: db.seededAt });
}
