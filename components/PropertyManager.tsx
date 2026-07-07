"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  Minus,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Confirm, Field, Modal, inputCls } from "@/components/Modal";

const SERVICES = [
  "Online Revenue Management",
  "Marketing Communication",
  "Project Planning",
  "Sales Offline",
  "RevPlus+",
];
const OTA = ["Booking.com", "Agoda", "Expedia"];
const MANAGERS = ["SiteMinder", "HotelLink", "ยังไม่เชื่อม"];

type RoomType = { type: string; count: number; base_price: number };
type FormData = {
  id?: string;
  name: string;
  location: string;
  segment: string;
  contract_until: string;
  channel_manager: string;
  services: string[];
  channels: string[];
  room_types: RoomType[];
  contact: { name: string; role: string; phone: string };
};

const empty = (): FormData => ({
  name: "",
  location: "",
  segment: "",
  contract_until: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
  channel_manager: "ยังไม่เชื่อม",
  services: ["Online Revenue Management"],
  channels: ["Booking.com"],
  room_types: [{ type: "Standard", count: 8, base_price: 1500 }],
  contact: { name: "", role: "เจ้าของ", phone: "" },
});

function PropertyForm({
  initial,
  onClose,
}: {
  initial: FormData;
  onClose: () => void;
}) {
  const router = useRouter();
  const [f, setF] = useState<FormData>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!f.id;

  const toggle = (key: "services" | "channels", v: string) =>
    setF((x) => ({
      ...x,
      [key]: x[key].includes(v) ? x[key].filter((s) => s !== v) : [...x[key], v],
    }));

  const setRoom = (i: number, patch: Partial<RoomType>) =>
    setF((x) => ({
      ...x,
      room_types: x.room_types.map((rt, j) => (j === i ? { ...rt, ...patch } : rt)),
    }));

  const valid =
    f.name.trim() &&
    f.location.trim() &&
    f.segment.trim() &&
    f.contract_until &&
    f.room_types.length > 0 &&
    f.room_types.every((rt) => rt.type.trim() && rt.count > 0 && rt.base_price > 0);

  async function submit() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(
        isEdit ? `/api/properties/${f.id}` : "/api/properties",
        {
          method: isEdit ? "PATCH" : "POST",
          body: JSON.stringify({
            name: f.name,
            location: f.location,
            segment: f.segment,
            contract_until: f.contract_until,
            channel_manager: f.channel_manager,
            services: f.services,
            channels: f.channels,
            room_types: f.room_types,
            ...(isEdit
              ? {
                  contacts: f.contact.name
                    ? [{ ...f.contact, line: "-" }]
                    : [],
                }
              : { contact: f.contact }),
          }),
        },
      );
      if (!res.ok) {
        setError((await res.json()).error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      onClose();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-3">
        <Field label="ชื่อโรงแรม *">
          <input
            className={inputCls}
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            placeholder="เช่น Mountain View Resort"
            autoFocus
          />
        </Field>
        <Field label="ทำเล *">
          <input
            className={inputCls}
            value={f.location}
            onChange={(e) => setF({ ...f, location: e.target.value })}
            placeholder="เช่น เชียงราย"
          />
        </Field>
        <Field label="ประเภท/จุดขาย *">
          <input
            className={inputCls}
            value={f.segment}
            onChange={(e) => setF({ ...f, segment: e.target.value })}
            placeholder="เช่น Resort วิวภูเขา"
          />
        </Field>
        <Field label="สัญญาถึง *">
          <input
            type="date"
            className={inputCls}
            value={f.contract_until}
            onChange={(e) => setF({ ...f, contract_until: e.target.value })}
          />
        </Field>
      </div>

      <Field label="ประเภทห้อง (ระบบจะสร้างห้อง + ราคา OTA ให้อัตโนมัติ) *">
        <div className="space-y-2">
          {f.room_types.map((rt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className={inputCls}
                value={rt.type}
                onChange={(e) => setRoom(i, { type: e.target.value })}
                placeholder="ชื่อประเภท"
              />
              <input
                type="number"
                min={1}
                className={`${inputCls} w-20 shrink-0`}
                value={rt.count || ""}
                onChange={(e) => setRoom(i, { count: Number(e.target.value) })}
                placeholder="ห้อง"
                aria-label="จำนวนห้อง"
              />
              <input
                type="number"
                min={1}
                className={`${inputCls} w-28 shrink-0`}
                value={rt.base_price || ""}
                onChange={(e) => setRoom(i, { base_price: Number(e.target.value) })}
                placeholder="฿/คืน"
                aria-label="ราคาต่อคืน"
              />
              <button
                onClick={() =>
                  setF((x) => ({
                    ...x,
                    room_types: x.room_types.filter((_, j) => j !== i),
                  }))
                }
                disabled={f.room_types.length === 1}
                aria-label="ลบประเภทห้องนี้"
                className="cursor-pointer rounded-md p-1.5 text-mut transition-colors hover:bg-down/10 hover:text-down disabled:opacity-30"
              >
                <Minus size={14} aria-hidden />
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              setF((x) => ({
                ...x,
                room_types: [...x.room_types, { type: "", count: 1, base_price: 1000 }],
              }))
            }
            className="inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-brand-ink hover:underline"
          >
            <Plus size={12} aria-hidden /> เพิ่มประเภทห้อง
          </button>
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="บริการตามสัญญา">
          <div className="space-y-1">
            {SERVICES.map((s) => (
              <label key={s} className="flex cursor-pointer items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={f.services.includes(s)}
                  onChange={() => toggle("services", s)}
                  className="accent-[#F5B301]"
                />
                {s}
              </label>
            ))}
          </div>
        </Field>
        <div className="space-y-3">
          <Field label="ช่องทางขาย (Direct มีเสมอ)">
            <div className="space-y-1">
              {OTA.map((c) => (
                <label key={c} className="flex cursor-pointer items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={f.channels.includes(c)}
                    onChange={() => toggle("channels", c)}
                    className="accent-[#F5B301]"
                  />
                  {c}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Channel manager">
            <select
              className={inputCls}
              value={f.channel_manager}
              onChange={(e) => setF({ ...f, channel_manager: e.target.value })}
            >
              {MANAGERS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      <Field label="ผู้ติดต่อหลัก">
        <div className="grid grid-cols-3 gap-2">
          <input
            className={inputCls}
            value={f.contact.name}
            onChange={(e) => setF({ ...f, contact: { ...f.contact, name: e.target.value } })}
            placeholder="ชื่อ"
          />
          <input
            className={inputCls}
            value={f.contact.role}
            onChange={(e) => setF({ ...f, contact: { ...f.contact, role: e.target.value } })}
            placeholder="ตำแหน่ง"
          />
          <input
            className={inputCls}
            value={f.contact.phone}
            onChange={(e) => setF({ ...f, contact: { ...f.contact, phone: e.target.value } })}
            placeholder="เบอร์โทร"
          />
        </div>
      </Field>

      {error && <p className="text-xs text-down">{error}</p>}
      {isEdit && (
        <p className="rounded-lg bg-paper p-2.5 text-[11px] leading-relaxed text-mut">
          หมายเหตุ: ถ้าแก้ประเภทห้อง ระบบจะสร้างห้องและราคา OTA ชุดใหม่ให้
          (การจองเดิมคงไว้เป็นประวัติ)
        </p>
      )}
      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onClose}
          className="cursor-pointer rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-paper"
        >
          ยกเลิก
        </button>
        <button
          onClick={submit}
          disabled={saving || !valid}
          className="cursor-pointer rounded-full bg-brand px-5 py-2 text-sm font-semibold text-brand-ink transition-transform hover:scale-[1.02] disabled:opacity-50"
        >
          {saving ? "กำลังบันทึก…" : isEdit ? "บันทึกการแก้ไข" : "เพิ่มโรงแรมลูกค้า"}
        </button>
      </div>
    </div>
  );
}

export function AddPropertyButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-brand-ink transition-transform hover:scale-[1.03]"
      >
        <Plus size={14} aria-hidden /> เพิ่มโรงแรมลูกค้า
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="รับโรงแรมลูกค้าใหม่">
        {open && <PropertyForm initial={empty()} onClose={() => setOpen(false)} />}
      </Modal>
    </>
  );
}

export function PropertyActions({ property }: { property: any }) {
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const [del, setDel] = useState(false);
  const [delError, setDelError] = useState<string | null>(null);

  return (
    <span
      className="flex shrink-0 gap-0.5"
      onClick={(e) => e.preventDefault()} // กัน <details> toggle ตอนกดปุ่ม
    >
      <button
        onClick={() => setEdit(true)}
        aria-label={`แก้ไข ${property.name}`}
        className="cursor-pointer rounded-md p-1.5 text-mut transition-colors hover:bg-paper hover:text-ink"
      >
        <Pencil size={13} aria-hidden />
      </button>
      <button
        onClick={() => setDel(true)}
        aria-label={`ลบ ${property.name}`}
        className="cursor-pointer rounded-md p-1.5 text-mut transition-colors hover:bg-down/10 hover:text-down"
      >
        <Trash2 size={13} aria-hidden />
      </button>

      <Modal open={edit} onClose={() => setEdit(false)} title={`แก้ไข — ${property.name}`}>
        {edit && (
          <PropertyForm
            initial={{
              id: property.id,
              name: property.name,
              location: property.location,
              segment: property.segment,
              contract_until: property.contract_until,
              channel_manager: property.channel_manager,
              services: property.services ?? [],
              channels: (property.channels ?? []).filter((c: string) => c !== "Direct"),
              room_types: property.room_types ?? [],
              contact: {
                name: property.contacts?.[0]?.name ?? "",
                role: property.contacts?.[0]?.role ?? "เจ้าของ",
                phone: property.contacts?.[0]?.phone ?? "",
              },
            }}
            onClose={() => setEdit(false)}
          />
        )}
      </Modal>

      <Confirm
        open={del}
        onClose={() => {
          setDel(false);
          setDelError(null);
        }}
        onConfirm={async () => {
          const res = await fetch(`/api/properties/${property.id}`, {
            method: "DELETE",
          });
          if (!res.ok) {
            setDelError((await res.json()).error ?? "ลบไม่สำเร็จ");
            return;
          }
          router.refresh();
        }}
        title={`ลบ ${property.name} ออกจากระบบ?`}
        detail={
          delError ??
          `ข้อมูลทั้งหมดของโรงแรมนี้จะถูกลบถาวร: ห้องพัก, การจอง, รีวิว, metrics, ราคา OTA, งาน และแคมเปญ — ดีลใน CRM จะถูกปลดออกจากโรงแรมแต่ไม่หาย ใช้เมื่อสิ้นสุดสัญญาเท่านั้น`
        }
        confirmLabel="ลบโรงแรม"
      />
    </span>
  );
}

// เช็กลิสต์ onboarding — ติ๊กแล้ว persist ทันที
export function OnboardingChecklist({
  propertyId,
  steps,
}: {
  propertyId: string;
  steps: { label: string; done: boolean }[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(steps);

  async function toggleStep(i: number) {
    const next = items.map((s, j) => (j === i ? { ...s, done: !s.done } : s));
    setItems(next);
    await fetch(`/api/properties/${propertyId}`, {
      method: "PATCH",
      body: JSON.stringify({ onboarding: next }),
    }).catch(() => {});
    router.refresh();
  }

  const doneCount = items.filter((s) => s.done).length;
  return (
    <div>
      <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-paper">
        <div
          className="h-full rounded-full bg-up transition-all"
          style={{ width: `${(doneCount / items.length) * 100}%` }}
        />
      </div>
      <ul className="space-y-1.5">
        {items.map((s, i) => (
          <li key={s.label}>
            <button
              onClick={() => toggleStep(i)}
              className="flex cursor-pointer items-start gap-2 text-left text-sm"
            >
              {s.done ? (
                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-up" aria-hidden />
              ) : (
                <Circle size={15} className="mt-0.5 shrink-0 text-ink/25" aria-hidden />
              )}
              <span className={s.done ? "text-ink/50 line-through" : ""}>{s.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
