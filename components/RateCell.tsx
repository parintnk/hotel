"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, Modal, inputCls } from "@/components/Modal";

type Rate = {
  hotel_id: string;
  room_type: string;
  channel: string;
  price: number;
  promo: string | null;
};

// เซลล์ราคาในตาราง channels — คลิกเพื่อแก้ราคา/โปรของ OTA นั้นตรงๆ
export default function RateCell({
  rate,
  isLeak,
  hotelName,
}: {
  rate: Rate;
  isLeak: boolean;
  hotelName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState(String(rate.price));
  const [promo, setPromo] = useState(rate.promo ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function saveRate() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/rates", {
        method: "PATCH",
        body: JSON.stringify({
          hotel_id: rate.hotel_id,
          room_type: rate.room_type,
          channel: rate.channel,
          price: Number(price),
          promo,
        }),
      });
      if (!res.ok) {
        setError((await res.json()).error ?? "บันทึกไม่สำเร็จ");
        return;
      }
      setOpen(false);
      router.refresh(); // ให้ server คำนวณ parity ใหม่
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setPrice(String(rate.price));
          setPromo(rate.promo ?? "");
          setOpen(true);
        }}
        title="คลิกเพื่อแก้ราคา"
        className="-mx-1 cursor-pointer rounded-md px-1 py-0.5 text-right tabular-nums transition-colors hover:bg-brand/10"
      >
        <span className={isLeak ? "font-semibold text-down" : ""}>
          {rate.price.toLocaleString()}
        </span>
        {rate.promo && (
          <span
            className={`block text-[10px] leading-tight ${isLeak ? "text-down/80" : "text-mut"}`}
          >
            {rate.promo}
          </span>
        )}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`แก้ราคา — ${rate.room_type} · ${rate.channel}`}
      >
        <p className="text-xs text-mut">
          {hotelName} · การแก้ราคาจะถูกตรวจ rate parity ใหม่ทันที
        </p>
        <div className="mt-3 space-y-3">
          <Field label="ราคาต่อคืน (฿) *">
            <input
              type="number"
              min={1}
              className={inputCls}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              autoFocus
            />
          </Field>
          <Field label="โปรโมชั่น (เว้นว่าง = ไม่มีโปร)">
            <input
              className={inputCls}
              value={promo}
              onChange={(e) => setPromo(e.target.value)}
              placeholder="เช่น Flash Sale -12%"
            />
          </Field>
          {error && <p className="text-xs text-down">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setOpen(false)}
              className="cursor-pointer rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-paper"
            >
              ยกเลิก
            </button>
            <button
              onClick={saveRate}
              disabled={saving || !price || Number(price) <= 0}
              className="cursor-pointer rounded-full bg-brand px-5 py-2 text-sm font-semibold text-brand-ink transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {saving ? "กำลังบันทึก…" : "บันทึกราคา"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
