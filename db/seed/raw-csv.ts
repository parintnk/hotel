import fs from "node:fs";
import path from "node:path";
import { HOTELS, ROOMS } from "../../lib/mock-data";

const RAW = path.join(process.cwd(), "data", "raw");
const day = (o: number) => {
  const d = new Date();
  d.setDate(d.getDate() + o);
  return d.toISOString().slice(0, 10);
};
const dmy = (s: string) => s.split("-").reverse().join("/");
const rand = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const NAMES = [
  "Somchai",
  "Anna",
  "Kenji",
  "Maria",
  "David",
  "Ploy",
  "Lee",
  "Nina",
];

export function writeRawCsvs() {
  fs.mkdirSync(RAW, { recursive: true });
  const bdc = [
    "Reservation ID,Hotel,Guest Name,Room,Check-in,Check-out,Total Price",
  ];
  const agd = ["booking_id,hotel,customer,room_no,arrival,departure,price"];
  const wlk = ["ref,hotel,name,room,in,out,amount"];
  let id = 1000;

  for (const h of HOTELS) {
    const rooms = ROOMS.filter((r) => r.hotel_id === h.id);
    for (let i = 0; i < 40; i++) {
      const room = rand(rooms),
        guest = rand(NAMES);
      const s = Math.floor(Math.random() * 30) - 8;
      const ci = day(s),
        co = day(s + 1 + Math.floor(Math.random() * 3)),
        price = room.base_price;
      const ch = Math.random();
      if (ch < 0.45)
        bdc.push(
          `${id},${h.name},${guest},${room.room_number},${ci},${co},${price}`,
        );
      else if (ch < 0.8)
        agd.push(
          `${id},${h.name},${guest},${room.room_number},${dmy(ci)},${dmy(co)},${price}`,
        );
      else
        wlk.push(
          `${id},${h.name},${Math.random() < 0.15 ? "" : guest},${room.room_number},${ci},${co},${Math.random() < 0.1 ? "" : price}`,
        );
      id++;
    }
  }
  const h0 = HOTELS[0];
  // overbooking: ห้อง 05 ช่วงเดียวกัน 2 ช่องทาง คนละคน
  bdc.push(`9001,${h0.name},Alice,05,${day(3)},${day(5)},1200`);
  agd.push(`9002,${h0.name},Bob,05,${dmy(day(3))},${dmy(day(5))},1300`);
  // duplicate ข้ามช่องทาง
  bdc.push(`9100,${h0.name},Carol,08,${day(7)},${day(9)},1100`);
  agd.push(`9101,${h0.name},Carol,08,${dmy(day(7))},${dmy(day(9))},1100`);

  fs.writeFileSync(path.join(RAW, "booking_com.csv"), bdc.join("\n"));
  fs.writeFileSync(path.join(RAW, "agoda.csv"), agd.join("\n"));
  fs.writeFileSync(path.join(RAW, "walkin.csv"), wlk.join("\n"));
  console.log("raw CSVs written");
}

if (require.main === module) writeRawCsvs();
