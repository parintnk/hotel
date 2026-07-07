"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Building2 } from "lucide-react";

export default function HotelSwitcher({
  hotels,
  current,
}: {
  hotels: { id: string; name: string }[];
  current: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-3 py-1.5">
      <Building2 size={14} className="text-mut" aria-hidden />
      <span className="sr-only">เลือกโรงแรม</span>
      <select
        value={current}
        onChange={(e) => {
          // เก็บ param อื่นไว้ (เช่น range) เปลี่ยนเฉพาะ hotel
          const params = new URLSearchParams(sp.toString());
          params.set("hotel", e.target.value);
          router.replace(`${pathname}?${params.toString()}`);
        }}
        className="cursor-pointer bg-transparent text-sm font-medium outline-none"
      >
        {hotels.map((h) => (
          <option key={h.id} value={h.id}>
            {h.name}
          </option>
        ))}
      </select>
    </label>
  );
}
