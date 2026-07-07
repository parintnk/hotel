import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import * as db from "@/lib/db";

type Canonical = {
  source_ref: string;
  channel: string;
  hotel_name: string;
  guest_name: string;
  room_number: string;
  checkin_date: string;
  checkout_date: string;
  amount: number;
};

function parseDate(s: string): string {
  s = (s ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : "";
}

const normalizers: Record<string, (r: any) => Canonical> = {
  "booking_com.csv": (r) => ({
    source_ref: "BDC-" + r["Reservation ID"],
    channel: "Booking.com",
    hotel_name: r["Hotel"],
    guest_name: r["Guest Name"],
    room_number: r["Room"],
    checkin_date: parseDate(r["Check-in"]),
    checkout_date: parseDate(r["Check-out"]),
    amount: Number(r["Total Price"]),
  }),
  "agoda.csv": (r) => ({
    source_ref: "AGD-" + r["booking_id"],
    channel: "Agoda",
    hotel_name: r["hotel"],
    guest_name: r["customer"],
    room_number: r["room_no"],
    checkin_date: parseDate(r["arrival"]),
    checkout_date: parseDate(r["departure"]),
    amount: Number(r["price"]),
  }),
  "walkin.csv": (r) => ({
    source_ref: "WLK-" + r["ref"],
    channel: "Walk-in",
    hotel_name: r["hotel"],
    guest_name: r["name"],
    room_number: r["room"],
    checkin_date: parseDate(r["in"]),
    checkout_date: parseDate(r["out"]),
    amount: Number(r["amount"]),
  }),
};

const overlaps = (a: Canonical, b: Canonical) =>
  a.checkin_date < b.checkout_date && b.checkin_date < a.checkout_date;

export async function runETL() {
  const dir = path.join(process.cwd(), "data", "raw");
  const stats = {
    read: 0,
    invalid: 0,
    deduped: 0,
    inserted: 0,
    overbookings: 0,
  };

  let rows: Canonical[] = [];
  for (const file of Object.keys(normalizers)) {
    const { data } = Papa.parse(fs.readFileSync(path.join(dir, file), "utf8"), {
      header: true,
      skipEmptyLines: true,
    });
    for (const r of data as any[]) {
      const c = normalizers[file](r);
      stats.read++;
      if (!c.guest_name || !c.checkin_date || !c.checkout_date || !c.amount) {
        stats.invalid++;
        continue;
      }
      rows.push(c);
    }
  }

  const seen = new Set<string>();
  rows = rows.filter((c) => {
    const key = `${c.guest_name}|${c.room_number}|${c.checkin_date}|${c.checkout_date}`;
    if (seen.has(key)) {
      stats.deduped++;
      return false;
    }
    seen.add(key);
    return true;
  });

  const hotels = await db.getHotels();
  const allRooms = await db.getAllRooms();
  const hotelByName = new Map(hotels.map((h: any) => [h.name, h.id]));
  const roomMap = new Map(
    allRooms.map((r: any) => [`${r.hotel_id}|${r.room_number}`, r.id]),
  );

  const toInsert = rows.map((c) => {
    const hotel_id = hotelByName.get(c.hotel_name);
    return {
      hotel_id,
      room_id: roomMap.get(`${hotel_id}|${c.room_number}`),
      guest_name: c.guest_name,
      channel: c.channel,
      checkin_date: c.checkin_date,
      checkout_date: c.checkout_date,
      amount: c.amount,
      source_ref: c.source_ref,
      status: "confirmed",
      _c: c,
    };
  });

  await db.upsertBookings(toInsert.map(({ _c, ...b }) => b));
  stats.inserted = toInsert.length;

  const byRoom = new Map<string, Canonical[]>();
  for (const t of toInsert) {
    if (!t.room_id) continue;
    const a = byRoom.get(t.room_id) ?? [];
    a.push(t._c);
    byRoom.set(t.room_id, a);
  }
  const side = (c: Canonical) => ({
    ref: c.source_ref,
    guest: c.guest_name,
    channel: c.channel,
    checkin: c.checkin_date,
    checkout: c.checkout_date,
  });
  const conflicts: any[] = [];
  for (const [, list] of byRoom)
    for (let i = 0; i < list.length; i++)
      for (let j = i + 1; j < list.length; j++)
        if (
          overlaps(list[i], list[j]) &&
          list[i].guest_name !== list[j].guest_name
        )
          conflicts.push({
            room: list[i].room_number,
            hotel: list[i].hotel_name,
            a: side(list[i]),
            b: side(list[j]),
          });
  stats.overbookings = conflicts.length;

  return { stats, conflicts };
}
