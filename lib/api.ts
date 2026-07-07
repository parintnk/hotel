// helper เล็กๆ ให้ทุก route ตอบแบบเดียวกัน: 400 พร้อมเหตุผลเมื่อ input ผิด, 404 เมื่อไม่เจอ
export async function readBody<T = any>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

export const bad = (error: string, status = 400) =>
  Response.json({ error }, { status });

export const notFound = () => bad("ไม่พบรายการที่ระบุ", 404);

// คืน field ที่ขาด (ค่าว่าง/undefined) จากรายการที่บังคับ
export function missing(obj: any, fields: string[]) {
  return fields.filter(
    (f) => obj?.[f] === undefined || obj?.[f] === null || obj?.[f] === "",
  );
}
