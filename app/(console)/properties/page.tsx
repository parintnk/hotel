import * as db from "@/lib/db";
import UrlSearch from "@/components/UrlSearch";
import {
  AddPropertyButton,
  OnboardingChecklist,
  PropertyActions,
} from "@/components/PropertyManager";
import {
  Building2,
  CheckCircle2,
  ChevronDown,
  Circle,
  Link2,
  Phone,
  User,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const q = ((await searchParams).q ?? "").trim().toLowerCase();
  const all: any[] = await db.getProperties();
  const props = q
    ? all.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.location.includes(q) ||
          p.segment.toLowerCase().includes(q) ||
          p.services.some((s: string) => s.toLowerCase().includes(q)),
      )
    : all;
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mut">Agency · Client Hub</p><h1 className="mt-0.5 text-xl font-bold tracking-tight">โรงแรมลูกค้า (Property Hub)</h1>
      <p className="mt-1 max-w-2xl text-sm text-mut">
        ฐานข้อมูลกลางของทุกโรงแรม — ห้อง, rate plan, ผังเชื่อม OTA, ผู้ติดต่อ,
        ขอบเขตสัญญา ทุกโมดูล (รายงาน/งาน/ราคา) ดึงจากที่นี่ที่เดียว
        พนักงานใหม่เปิดดูแล้วเข้าใจโรงแรมได้ทันที
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <UrlSearch placeholder="ค้นหาชื่อ / ทำเล / บริการ…" />
        {q && (
          <span className="text-xs tabular-nums text-mut">
            พบ {props.length}/{all.length} โรงแรม
          </span>
        )}
        <span className="ml-auto">
          <AddPropertyButton />
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {props.map((p) => (
          <details
            key={p.id}
            className="group rounded-2xl border border-ink/10 bg-white shadow-card open:shadow-lift"
          >
            <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand-ink">
                <Building2 size={18} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{p.name}</span>
                  {p.onboarding && (
                    <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-semibold text-brand-ink">
                      กำลัง onboarding
                    </span>
                  )}
                </span>
                <span className="block text-xs text-mut">
                  {p.location} · {p.segment} · {p.total_rooms} ห้อง · สัญญาถึง{" "}
                  {p.contract_until}
                </span>
              </span>
              <span className="hidden flex-wrap justify-end gap-1 sm:flex">
                {p.services.map((s: string) => (
                  <span
                    key={s}
                    className="rounded-full border border-ink/15 bg-paper px-2 py-0.5 text-[10px] font-medium text-ink/70"
                  >
                    {s}
                  </span>
                ))}
              </span>
              <PropertyActions property={p} />
              <ChevronDown
                size={16}
                aria-hidden
                className="shrink-0 text-mut transition-transform group-open:rotate-180"
              />
            </summary>

            <div className="grid gap-4 border-t border-ink/10 p-4 md:grid-cols-3">
              {/* ห้องและราคา */}
              <div>
                <div className="text-xs font-semibold text-mut">
                  ประเภทห้อง / rate plan (Direct)
                </div>
                <table className="mt-2 w-full text-sm">
                  <tbody>
                    {p.room_types.map((rt: any) => (
                      <tr key={rt.type} className="border-b border-ink/5 last:border-0">
                        <td className="py-1.5">{rt.type}</td>
                        <td className="py-1.5 text-right text-xs tabular-nums text-mut">
                          {rt.count} ห้อง
                        </td>
                        <td className="py-1.5 text-right tabular-nums">
                          {rt.base_price.toLocaleString()} ฿
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* การเชื่อมต่อ */}
              <div>
                <div className="text-xs font-semibold text-mut">ผังการเชื่อมช่องทางขาย</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {p.channels.map((c: string) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1 rounded-full bg-paper px-2.5 py-1 text-xs"
                    >
                      <Link2 size={11} className="text-up" aria-hidden /> {c}
                    </span>
                  ))}
                </div>
                <div className="mt-3 text-xs text-mut">
                  Channel manager:{" "}
                  <span
                    className={
                      p.channel_manager === "ยังไม่เชื่อม"
                        ? "font-semibold text-down"
                        : "font-medium text-ink"
                    }
                  >
                    {p.channel_manager}
                  </span>
                </div>
                {/* ผู้ติดต่อ */}
                <div className="mt-3 text-xs font-semibold text-mut">ผู้ติดต่อ</div>
                <ul className="mt-1.5 space-y-1.5">
                  {p.contacts.map((c: any) => (
                    <li key={c.name} className="flex items-center gap-2 text-sm">
                      <User size={13} className="text-mut" aria-hidden />
                      <span className="font-medium">{c.name}</span>
                      <span className="text-xs text-mut">{c.role}</span>
                      <span className="ml-auto inline-flex items-center gap-1 text-xs tabular-nums text-mut">
                        <Phone size={11} aria-hidden /> {c.phone}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Onboarding */}
              <div>
                <div className="text-xs font-semibold text-mut">
                  {p.onboarding ? "เช็กลิสต์ onboarding" : "สถานะ"}
                </div>
                {p.onboarding ? (
                  <div className="mt-2">
                    <OnboardingChecklist propertyId={p.id} steps={p.onboarding} />
                  </div>
                ) : (
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-up">
                    <CheckCircle2 size={15} aria-hidden /> ดูแลตามสัญญาปกติ —
                    ข้อมูลครบ ทีมใหม่รับช่วงต่อได้ทันที
                  </p>
                )}
              </div>
            </div>
          </details>
        ))}
      </div>
    </main>
  );
}
