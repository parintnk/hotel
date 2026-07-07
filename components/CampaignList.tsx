"use client";
import { useState } from "react";
import {
  CheckCircle2,
  Pencil,
  Plus,
  Radio,
  Search,
  Trash2,
} from "lucide-react";
import { Confirm, Field, Modal, inputCls } from "@/components/Modal";

type Campaign = {
  id: string;
  hotel_id: string;
  title: string;
  channel: string;
  date: string;
  status: string;
  budget: number;
  result: string | null;
};

const CH_CLS: Record<string, string> = {
  Facebook: "bg-[#1877F2]/10 text-[#1e5bb8]",
  Instagram: "bg-[#DB2777]/10 text-[#9d1f5c]",
  TikTok: "bg-ink/10 text-ink",
  Agoda: "bg-[#7C3AED]/10 text-[#5B21B6]",
  "Booking.com": "bg-[#0891B2]/10 text-[#155E75]",
  Google: "bg-[#0891B2]/10 text-[#155E75]",
  Email: "bg-brand/15 text-brand-ink",
};

const ALL_CHANNELS = [
  "Facebook",
  "Instagram",
  "TikTok",
  "Agoda",
  "Booking.com",
  "Google",
  "Email",
];

export default function CampaignList({
  campaigns: initial,
  hotelNames,
}: {
  campaigns: Campaign[];
  hotelNames: Record<string, string>;
}) {
  const [campaigns, setCampaigns] = useState(initial);
  const [q, setQ] = useState("");
  const [fChannel, setFChannel] = useState("all");
  const [fHotel, setFHotel] = useState("all");
  const [hideDone, setHideDone] = useState(false);
  const [form, setForm] = useState<Partial<Campaign> | null>(null);
  const [confirmDel, setConfirmDel] = useState<Campaign | null>(null);
  const [saving, setSaving] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  async function submitForm() {
    if (!form?.title?.trim() || !form.date || !form.hotel_id) return;
    setSaving(true);
    try {
      const isEdit = !!form.id;
      const res = await fetch(
        isEdit ? `/api/campaigns/${form.id}` : "/api/campaigns",
        {
          method: isEdit ? "PATCH" : "POST",
          body: JSON.stringify({
            title: form.title,
            hotel_id: form.hotel_id,
            channel: form.channel ?? "Facebook",
            date: form.date,
            budget: Number(form.budget ?? 0),
            ...(isEdit && {
              status: form.status,
              result: form.result?.trim() || null,
            }),
          }),
        },
      );
      if (!res.ok) throw new Error(String(res.status));
      const saved = await res.json();
      setCampaigns((cs) =>
        isEdit ? cs.map((x) => (x.id === saved.id ? saved : x)) : [...cs, saved],
      );
      setForm(null);
    } catch {
      // คง modal ไว้ให้ลองใหม่
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: Campaign) {
    const res = await fetch(`/api/campaigns/${c.id}`, { method: "DELETE" });
    if (res.ok) setCampaigns((cs) => cs.filter((x) => x.id !== c.id));
  }

  const channels = [...new Set(campaigns.map((c) => c.channel))];
  const filtered = campaigns
    .filter(
      (c) =>
        (fChannel === "all" || c.channel === fChannel) &&
        (fHotel === "all" || c.hotel_id === fHotel) &&
        (!hideDone || c.status !== "done") &&
        (!q.trim() || c.title.includes(q.trim())),
    )
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <section className="mt-4 rounded-2xl border border-ink/10 bg-white p-4 shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="mr-auto text-sm font-semibold">
          ตารางแคมเปญ{" "}
          <span className="font-normal tabular-nums text-mut">
            ({filtered.length}/{campaigns.length})
          </span>
        </h2>
        <label className="relative">
          <Search
            size={13}
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mut"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาแคมเปญ…"
            className="w-40 rounded-full border border-ink/15 bg-white py-1.5 pl-8 pr-3 text-xs outline-none transition-colors focus:border-brand"
          />
        </label>
        <select
          value={fHotel}
          onChange={(e) => setFHotel(e.target.value)}
          aria-label="กรองตามโรงแรม"
          className="cursor-pointer rounded-full border border-ink/15 bg-white px-3 py-1.5 text-xs"
        >
          <option value="all">ทุกโรงแรม</option>
          {Object.entries(hotelNames).map(([id, n]) => (
            <option key={id} value={id}>
              {n}
            </option>
          ))}
        </select>
        <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-ink/70">
          <input
            type="checkbox"
            checked={hideDone}
            onChange={(e) => setHideDone(e.target.checked)}
            className="accent-[#F5B301]"
          />
          ซ่อนที่จบแล้ว
        </label>
        <button
          onClick={() =>
            setForm({
              date: new Date().toISOString().slice(0, 10),
              channel: "Facebook",
              hotel_id: Object.keys(hotelNames)[0],
            })
          }
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-brand-ink transition-transform hover:scale-[1.03]"
        >
          <Plus size={14} aria-hidden /> เพิ่มแคมเปญ
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        <button
          onClick={() => setFChannel("all")}
          className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${fChannel === "all" ? "bg-ink text-white" : "border border-ink/15 bg-white text-ink/60 hover:border-ink/30"}`}
        >
          ทุกช่องทาง
        </button>
        {channels.map((ch) => (
          <button
            key={ch}
            onClick={() => setFChannel(ch)}
            className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${fChannel === ch ? "bg-ink text-white" : "border border-ink/15 bg-white text-ink/60 hover:border-ink/30"}`}
          >
            {ch}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        {filtered.map((c) => {
          const isToday = c.date === today;
          const past = c.date < today;
          return (
            <div
              key={c.id}
              className={`flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors hover:bg-paper/50 ${isToday ? "border-brand bg-brand/5" : "border-ink/10"} ${past && c.status === "done" ? "opacity-70" : ""}`}
            >
              <span
                className={`w-14 shrink-0 text-center text-xs font-semibold tabular-nums ${isToday ? "text-brand-ink" : "text-mut"}`}
              >
                {isToday ? "วันนี้" : c.date.slice(5)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium leading-snug">
                  {c.title}
                </span>
                <span className="text-xs text-mut">
                  {hotelNames[c.hotel_id] ?? c.hotel_id}
                </span>
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${CH_CLS[c.channel] ?? "bg-paper text-ink/60"}`}
              >
                {c.channel}
              </span>
              {c.budget > 0 && (
                <span className="text-xs tabular-nums text-mut">
                  {c.budget.toLocaleString()} ฿
                </span>
              )}
              {c.status === "live" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-up/10 px-2 py-0.5 text-[10px] font-semibold text-up">
                  <Radio size={9} aria-hidden /> กำลังรัน
                </span>
              )}
              {c.status === "done" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-semibold text-ink/50">
                  <CheckCircle2 size={9} aria-hidden /> จบแล้ว
                </span>
              )}
              {c.result && (
                <span className="text-xs font-medium text-up">{c.result}</span>
              )}
              <span className="flex gap-0.5">
                <button
                  onClick={() => setForm(c)}
                  aria-label="แก้ไขแคมเปญ"
                  className="cursor-pointer rounded-md p-1 text-mut transition-colors hover:bg-paper hover:text-ink"
                >
                  <Pencil size={12} aria-hidden />
                </button>
                <button
                  onClick={() => setConfirmDel(c)}
                  aria-label="ลบแคมเปญ"
                  className="cursor-pointer rounded-md p-1 text-mut transition-colors hover:bg-down/10 hover:text-down"
                >
                  <Trash2 size={12} aria-hidden />
                </button>
              </span>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-dashed border-ink/20 p-8 text-center text-sm text-mut">
            ไม่พบแคมเปญตามเงื่อนไข
          </div>
        )}
      </div>

      {/* ฟอร์มเพิ่ม/แก้แคมเปญ */}
      <Modal
        open={form !== null}
        onClose={() => setForm(null)}
        title={form?.id ? "แก้ไขแคมเปญ" : "เพิ่มแคมเปญใหม่"}
      >
        <div className="space-y-3">
          <Field label="ชื่อแคมเปญ *">
            <input
              className={inputCls}
              value={form?.title ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="เช่น โปรหน้าฝน Sea View -25%"
              autoFocus
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="โรงแรม *">
              <select
                className={inputCls}
                value={form?.hotel_id ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, hotel_id: e.target.value }))
                }
              >
                {Object.entries(hotelNames).map(([id, n]) => (
                  <option key={id} value={id}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="ช่องทาง">
              <select
                className={inputCls}
                value={form?.channel ?? "Facebook"}
                onChange={(e) =>
                  setForm((f) => ({ ...f, channel: e.target.value }))
                }
              >
                {ALL_CHANNELS.map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="วันที่รัน *">
              <input
                type="date"
                className={inputCls}
                value={form?.date ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </Field>
            <Field label="งบ (฿)">
              <input
                type="number"
                min={0}
                className={inputCls}
                value={form?.budget ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, budget: Number(e.target.value) }))
                }
                placeholder="0"
              />
            </Field>
          </div>
          {form?.id && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="สถานะ">
                <select
                  className={inputCls}
                  value={form?.status ?? "planned"}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value }))
                  }
                >
                  <option value="planned">วางแผน</option>
                  <option value="live">กำลังรัน</option>
                  <option value="done">จบแล้ว</option>
                </select>
              </Field>
              <Field label="ผลลัพธ์ (บันทึกหลังจบ)">
                <input
                  className={inputCls}
                  value={form?.result ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, result: e.target.value }))
                  }
                  placeholder="เช่น reach 45k · จอง 12 คืน"
                />
              </Field>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setForm(null)}
              className="cursor-pointer rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-paper"
            >
              ยกเลิก
            </button>
            <button
              onClick={submitForm}
              disabled={saving || !form?.title?.trim() || !form?.date || !form?.hotel_id}
              className="cursor-pointer rounded-full bg-brand px-5 py-2 text-sm font-semibold text-brand-ink transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {saving ? "กำลังบันทึก…" : form?.id ? "บันทึกการแก้ไข" : "เพิ่มแคมเปญ"}
            </button>
          </div>
        </div>
      </Modal>

      {/* ยืนยันลบ */}
      <Confirm
        open={confirmDel !== null}
        onClose={() => setConfirmDel(null)}
        onConfirm={async () => {
          if (confirmDel) await remove(confirmDel);
        }}
        title="ลบแคมเปญนี้?"
        detail={`"${confirmDel?.title}" จะถูกลบถาวรพร้อมผลลัพธ์ที่บันทึกไว้`}
        confirmLabel="ลบแคมเปญ"
      />
    </section>
  );
}
