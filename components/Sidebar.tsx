"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ResetData from "@/components/ResetData";
import {
  Building2,
  FileText,
  Handshake,
  HeartPulse,
  LayoutDashboard,
  ListChecks,
  Megaphone,
  Scale,
  Star,
  Workflow,
} from "lucide-react";

const SECTIONS = [
  {
    title: "เอเจนซี่",
    links: [
      { href: "/portfolio", label: "ภาพรวมทุกโรงแรม", icon: LayoutDashboard },
      { href: "/properties", label: "โรงแรมลูกค้า", icon: Building2 },
      { href: "/channels", label: "ราคา & ช่องทาง", icon: Scale },
      { href: "/tasks", label: "งานของทีม", icon: ListChecks },
      { href: "/marketing", label: "ปฏิทินการตลาด", icon: Megaphone },
      { href: "/crm", label: "งานขาย (CRM)", icon: Handshake },
      { href: "/reports", label: "ศูนย์สร้างรายงาน", icon: FileText },
    ],
  },
  {
    title: "รายโรงแรม (สลับได้ทุกลูกค้า)",
    links: [
      { href: "/dashboard", label: "Dashboard + Health Check", icon: HeartPulse },
      { href: "/reviews", label: "Review Intelligence", icon: Star },
      { href: "/ops", label: "Data Pipeline (ETL)", icon: Workflow },
    ],
  },
];

function NavLinks({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  return (
    <>
      {SECTIONS.map((sec) => (
        <div key={sec.title} className={compact ? "flex gap-0.5" : ""}>
          {!compact && (
            <div className="px-3 pb-1.5 pt-5 text-[10px] font-semibold uppercase tracking-widest text-white/35">
              {sec.title}
            </div>
          )}
          {sec.links.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={`flex items-center gap-2.5 rounded-lg text-sm transition-colors ${
                  compact ? "px-2.5 py-1.5" : "mx-2 px-3 py-[7px]"
                } ${
                  active
                    ? "bg-brand font-semibold text-brand-ink"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={16} strokeWidth={2} aria-hidden className="shrink-0" />
                <span className={compact ? "sr-only" : ""}>{label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </>
  );
}

export default function Sidebar() {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col bg-ink text-white md:flex">
        <Link href="/" className="flex items-center gap-2.5 px-5 pb-3 pt-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-sm font-bold text-brand-ink">
            R+
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold">Hotel Ops Console</span>
            <span className="block text-[11px] text-white/45">
              ทีมบริหารโรงแรม · 6 ลูกค้า
            </span>
          </span>
        </Link>
        <nav className="flex-1 overflow-y-auto pb-4">
          <NavLinks />
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-up" aria-hidden />
            ระบบทำงานปกติ · AI 11 จุด
          </div>
          <Link
            href="/"
            className="mt-2 inline-flex items-center gap-1.5 text-xs text-brand hover:underline"
          >
            <HeartPulse size={12} aria-hidden /> เกี่ยวกับโปรเจคนี้
          </Link>
          <br />
          <ResetData />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center gap-1 overflow-x-auto border-b border-white/10 bg-ink px-3 py-2 text-white md:hidden">
        <Link
          href="/"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-xs font-bold text-brand-ink"
        >
          R+
        </Link>
        <NavLinks compact />
      </header>
    </>
  );
}
