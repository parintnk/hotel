import Link from "next/link";
import {
  ArrowRight,
  Bot,
  ChevronRight,
  Database,
  HeartPulse,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Webhook,
  Workflow,
} from "lucide-react";

const FLOW = [
  {
    icon: Webhook,
    tag: "TRIGGER",
    title: "Chat · Cron · API",
    desc: "ข้อความลูกค้า, cron รายวัน, ไฟล์จาก OTA",
  },
  {
    icon: Database,
    tag: "DATA PIPELINE",
    title: "ETL 3 ช่องทาง",
    desc: "Extract → Normalize → Dedupe → จับ overbooking",
  },
  {
    icon: Bot,
    tag: "AI AGENT",
    title: "LLM 12 จุดทั่วระบบ",
    desc: "classify · วิเคราะห์ · ประเมินสุขภาพ · ร่างข้อความ",
  },
  {
    icon: LayoutDashboard,
    tag: "OUTPUT",
    title: "จอง · Dashboard · Alerts",
    desc: "ตอบแชท+จองจริง, KPI, แจ้งเตือน, รายงานเช้า",
  },
];

const SERVICES = [
  {
    icon: TrendingUp,
    service: "Online Revenue Management",
    title: "บริหารยอดจอง + ช่องทางขาย",
    desc: "Portfolio view ทุกโรงแรมเทียบเป้าในจอเดียว, ราคาทุก OTA + ตรวจ rate parity อัตโนมัติ, แก้ราคาจากหน้าเดียวจบ",
    href: "/channels",
    cta: "เปิดราคา & ช่องทาง",
  },
  {
    icon: HeartPulse,
    service: "Hotel Health Assessment",
    title: "AI Health Check ทั้งธุรกิจในคลิกเดียว",
    desc: "AI อ่าน metrics + ช่องทางจอง + รีวิว แล้วให้คะแนนสุขภาพพร้อมสิ่งที่ควรทำทันที — งานที่ปรึกษาทำเป็นวัน เหลือไม่กี่วินาที",
    href: "/dashboard",
    cta: "ลองตรวจสุขภาพ",
  },
  {
    icon: Megaphone,
    service: "Marketing Communication",
    title: "ดูแลชื่อเสียงและเสียงลูกค้า",
    desc: "AI แยก sentiment + ร่างคำตอบรีวิวลบในโทนแบรนด์, ปฏิทินแคมเปญทุกลูกค้า + AI คิดคอนเทนต์จากข้อมูลจริงของโรงแรม",
    href: "/reviews",
    cta: "เปิด Review Intelligence",
  },
  {
    icon: Workflow,
    service: "Operational Efficiency",
    title: "งานหลังบ้านที่เคยทำมือ — อัตโนมัติหมด",
    desc: "ETL รวมไฟล์จอง 3 ฟอร์แมต จับจองซ้อนก่อนแขกถึงหน้างาน, task board ลากวาง, CRM เตือนตามดีลพร้อม AI ร่างข้อความ",
    href: "/ops",
    cta: "รัน pipeline",
  },
];

const STACK = [
  "Next.js 16",
  "TypeScript",
  "Gemini API",
  "Local JSON store",
  "Recharts",
  "Tailwind v4",
  "Vercel Cron",
];

const STATS = [
  { value: "6", label: "โรงแรมลูกค้าในระบบ" },
  { value: "12", label: "จุดที่ AI ทำงานแทนคน" },
  { value: "20+", label: "REST API + CRUD ครบ" },
  { value: "1 คลิก", label: "รายงานรายเดือนทั้งฉบับ" },
];

const rise = (delay: number) => ({
  className:
    "animate-[fade-up_0.65s_ease-out_both] motion-reduce:animate-none",
  style: { animationDelay: `${delay}ms` },
});

// mock console ลอยข้าง hero — ของจริงย่อส่วน ทำด้วย CSS ล้วน
function MockConsole() {
  const bars = [42, 66, 50, 78, 58, 88, 70];
  return (
    <div
      className="relative animate-[float-y_7s_ease-in-out_infinite] motion-reduce:animate-none"
      aria-hidden
    >
      <div className="absolute -inset-6 rounded-[2rem] bg-brand/15 blur-2xl" />
      <div className="relative rounded-2xl border border-white/10 bg-[#201E25] p-4 shadow-2xl">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          <span className="ml-2 text-[10px] font-medium tracking-wide text-white/40">
            Hotel Ops Console — portfolio
          </span>
          <span className="ml-auto flex items-center gap-1 text-[9px] text-white/40">
            <span className="h-1.5 w-1.5 animate-[blink-dot_2s_ease-in-out_infinite] rounded-full bg-up motion-reduce:animate-none" />
            live
          </span>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            ["Occupancy", "74%", "▲ 5.7%"],
            ["RevPAR", "฿1,073", "▲ 3.1%"],
            ["Alerts", "8", "2 ด่วน"],
          ].map(([l, v, d], i) => (
            <div key={l} className="rounded-lg bg-white/5 p-2">
              <div className="text-[9px] text-white/40">{l}</div>
              <div className="text-sm font-bold tabular-nums text-white">{v}</div>
              <div className={`text-[9px] tabular-nums ${i === 2 ? "text-down" : "text-up"}`}>
                {d}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 rounded-lg bg-white/5 p-2.5">
          <div className="text-[9px] text-white/40">รายได้รวม 7 วัน</div>
          <div className="mt-1.5 flex h-14 items-end gap-1.5">
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 origin-bottom animate-[grow-y_0.8s_ease-out_both] rounded-t-[3px] bg-brand/80 motion-reduce:animate-none"
                style={{ height: `${h}%`, animationDelay: `${300 + i * 90}ms` }}
              />
            ))}
          </div>
        </div>

        <div className="mt-2 grid grid-cols-5 gap-2">
          <div className="col-span-3 space-y-1.5 rounded-lg bg-white/5 p-2.5">
            <div className="text-[9px] text-white/40">แชทจองอัตโนมัติ</div>
            <div className="w-fit max-w-full rounded-lg rounded-bl-sm bg-white/10 px-2 py-1 text-[10px] text-white/80">
              มีห้องว่างเสาร์นี้ไหม
            </div>
            <div className="ml-auto w-fit max-w-full rounded-lg rounded-br-sm bg-brand px-2 py-1 text-[10px] font-medium text-brand-ink">
              จองสำเร็จ ✅ Deluxe คืนละ 1,800.-
            </div>
          </div>
          <div className="col-span-2 flex flex-col items-center justify-center rounded-lg bg-white/5 p-2">
            <div className="relative h-12 w-12">
              <svg viewBox="0 0 48 48" className="h-full w-full -rotate-90">
                <circle cx="24" cy="24" r="19" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
                <circle
                  cx="24"
                  cy="24"
                  r="19"
                  fill="none"
                  stroke="#1D9E75"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 19}
                  strokeDashoffset={2 * Math.PI * 19 * 0.15}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                85
              </div>
            </div>
            <div className="mt-1 text-[9px] text-white/50">Health · เกรด A</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex-1">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 text-white backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <span className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-brand-ink">
              R+
            </span>
            <span className="text-sm font-semibold tracking-tight">
              Hotel Ops Console
            </span>
          </span>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-sm font-semibold text-brand-ink transition-transform hover:scale-[1.03]"
          >
            เปิด Console <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-ink text-white">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -top-44 right-[-8%] h-[28rem] w-[28rem] rounded-full bg-brand/20 blur-3xl" />
            <div className="absolute bottom-[-30%] left-[-10%] h-96 w-96 rounded-full bg-[#7C3AED]/10 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.045]"
              style={{
                backgroundImage:
                  "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                backgroundSize: "44px 44px",
              }}
            />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 md:pt-20">
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p
                  {...rise(0)}
                  className={`${rise(0).className} mb-4 inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-medium text-brand`}
                >
                  <Sparkles size={13} aria-hidden /> Portfolio Project — AI
                  Workflow & Automation
                </p>
                <h1
                  {...rise(100)}
                  className={`${rise(100).className} text-3xl font-bold leading-tight tracking-tight md:text-5xl`}
                >
                  ระบบหลังบ้านสำหรับ
                  <span className="text-brand"> ทีมบริหารโรงแรม</span>
                  <br />
                  ที่ AI ทำงานซ้ำๆ แทนคนทั้งเส้น
                </h1>
                <p
                  {...rise(200)}
                  className={`${rise(200).className} mt-4 max-w-xl leading-relaxed text-white/70`}
                >
                  ดูแลลูกค้าหลายโรงแรมพร้อมกันโดยไม่ต้องไล่เปิดดูทีละแห่ง —
                  ระบบชี้เป้าว่าเช้านี้ต้องโฟกัสที่ไหน, แชทตอบและจองให้จริง,
                  จับจองซ้อนก่อนเกิดเรื่อง, รายงานเจ้าของเสร็จในคลิกเดียว
                </p>
                <div {...rise(300)} className={`${rise(300).className} mt-7 flex flex-wrap gap-3`}>
                  <Link
                    href="/portfolio"
                    className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-ink shadow-lift transition-transform hover:scale-[1.04]"
                  >
                    เปิดภาพรวมทุกโรงแรม <ArrowRight size={16} aria-hidden />
                  </Link>
                  <Link
                    href="/chat"
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    <MessageCircle size={15} aria-hidden /> ลองแชทจองห้อง
                  </Link>
                </div>

                {/* Stat strip */}
                <dl
                  {...rise(420)}
                  className={`${rise(420).className} mt-9 grid w-fit grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4`}
                >
                  {STATS.map((s) => (
                    <div key={s.label}>
                      <dt className="order-2 text-[11px] leading-snug text-white/50">
                        {s.label}
                      </dt>
                      <dd className="text-2xl font-bold tabular-nums tracking-tight text-brand">
                        {s.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div {...rise(250)} className={`${rise(250).className} hidden lg:block`}>
                <MockConsole />
              </div>
            </div>

            {/* Architecture flow */}
            <div className="mt-16 grid gap-3 md:grid-cols-4">
              {FLOW.map((s, i) => (
                <div key={s.tag} {...rise(500 + i * 100)} className={`${rise(0).className} relative`} style={{ animationDelay: `${500 + i * 100}ms` }}>
                  <div className="h-full rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:border-brand/40 hover:bg-white/[0.08]">
                    <div className="flex items-center justify-between">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/15 text-brand">
                        <s.icon size={18} aria-hidden />
                      </span>
                      <span className="text-[10px] font-semibold tracking-widest text-white/40">
                        {s.tag}
                      </span>
                    </div>
                    <div className="mt-3 text-sm font-semibold">{s.title}</div>
                    <div className="mt-1 text-xs leading-relaxed text-white/60">
                      {s.desc}
                    </div>
                  </div>
                  {i < FLOW.length - 1 && (
                    <ChevronRight
                      size={16}
                      aria-hidden
                      className="absolute -right-2.5 top-1/2 z-10 hidden -translate-y-1/2 text-brand md:block"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Service mapping */}
        <section className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-xl font-bold tracking-tight">
            ออกแบบตามสายงานจริงของทีมบริหารโรงแรม
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-mut">
            แต่ละโมดูลตอบงานหนึ่งสายของทีมที่ปรึกษา — revenue management,
            ตรวจสุขภาพโรงแรม, ดูแลชื่อเสียงแบรนด์ และเพิ่มประสิทธิภาพหลังบ้าน
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {SERVICES.map((m) => (
              <Link
                key={m.title}
                href={m.href}
                className="group flex flex-col rounded-2xl border border-ink/10 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-lift"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand-ink transition-transform group-hover:scale-110">
                    <m.icon size={19} aria-hidden />
                  </span>
                  <span>
                    <span className="block text-[10px] font-semibold uppercase tracking-widest text-mut">
                      {m.service}
                    </span>
                    <span className="font-semibold leading-tight">{m.title}</span>
                  </span>
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/70">
                  {m.desc}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-ink">
                  {m.cta}
                  <ArrowRight
                    size={13}
                    aria-hidden
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Engineering story */}
        <section className="border-t border-ink/10 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <h2 className="text-xl font-bold tracking-tight">
              ออกแบบเป็นระบบ ไม่ใช่แค่ต่อของให้ติด
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-ink/10 p-5">
                <Database size={18} className="text-brand-ink" aria-hidden />
                <div className="mt-2 font-semibold">
                  แยก 3 ชั้น: data / AI / transport
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/70">
                  ทุกโมดูลเรียกข้อมูลผ่าน{" "}
                  <code className="rounded bg-paper px-1 font-mono text-xs">
                    lib/db.ts
                  </code>{" "}
                  (local JSON store — CRUD persist จริง) และเรียกโมเดลผ่าน{" "}
                  <code className="rounded bg-paper px-1 font-mono text-xs">
                    lib/ai.ts
                  </code>{" "}
                  — สลับ DB หรือ LLM provider ได้ที่จุดเดียว
                </p>
              </div>
              <div className="rounded-2xl border border-ink/10 p-5">
                <ShieldAlert size={18} className="text-brand-ink" aria-hidden />
                <div className="mt-2 font-semibold">Data engineering จริง</div>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/70">
                  ไฟล์ 3 ฟอร์แมต (วันที่ ISO/DD-MM, คอลัมน์คนละชื่อ, ข้อมูลขาด) →
                  normalize เป็น schema เดียว, dedupe ด้วย source_ref,
                  ตรวจ overbooking ด้วย interval overlap
                </p>
              </div>
              <div className="rounded-2xl border border-ink/10 p-5">
                <Bot size={18} className="text-brand-ink" aria-hidden />
                <div className="mt-2 font-semibold">
                  AI ที่ไม่มโน — grounded ทุกคำตอบ
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/70">
                  ทุกจุดที่ใช้ LLM ป้อนข้อมูลจริงจากระบบ (ห้องว่างจริง, metrics
                  จริง, รีวิวจริง) และบังคับ JSON schema —
                  ไม่ปล่อยให้โมเดลเดาข้อมูลที่ไม่มี
                </p>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              {STACK.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-ink/15 bg-paper px-3 py-1 text-xs font-medium text-ink/70"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="px-4 pb-16 pt-4">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-ink p-10 text-white md:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/25 blur-3xl"
            />
            <div className="relative flex flex-wrap items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                  อยากเห็นของจริง — <span className="text-brand">เปิดเล่นได้เลย</span>
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/65">
                  ทุกปุ่มกดได้จริง ทุกข้อมูลแก้ได้จริง ทุกจุด AI เรียกโมเดลจริง
                  — ลองตั้งแต่รับโรงแรมลูกค้าใหม่ ยันสร้างรายงานส่งเจ้าของ
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/portfolio"
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-ink transition-transform hover:scale-[1.04]"
                >
                  เปิด Console <ArrowRight size={16} aria-hidden />
                </Link>
                <Link
                  href="/ops"
                  className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-medium transition-colors hover:bg-white/10"
                >
                  รัน ETL pipeline
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
