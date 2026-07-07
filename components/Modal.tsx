"use client";
import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

export const inputCls =
  "w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-brand";

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs font-medium text-ink/70">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-4 backdrop-blur-[2px] sm:items-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-bold">{title}</h3>
          <button
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="cursor-pointer rounded-full p-1.5 text-mut transition-colors hover:bg-paper hover:text-ink"
          >
            <X size={16} aria-hidden />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

// ยืนยันก่อนทำสิ่งที่ย้อนกลับไม่ได้ — ปุ่มยืนยันสีแดงเสมอ
export function Confirm({
  open,
  onClose,
  onConfirm,
  title,
  detail,
  confirmLabel = "ลบ",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  detail: string;
  confirmLabel?: string;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal open={open} onClose={busy ? () => {} : onClose} title={title}>
      <p className="text-sm leading-relaxed text-ink/70">{detail}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onClose}
          disabled={busy}
          className="cursor-pointer rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-paper disabled:opacity-50"
        >
          ยกเลิก
        </button>
        <button
          onClick={async () => {
            setBusy(true);
            try {
              await onConfirm();
              onClose();
            } finally {
              setBusy(false);
            }
          }}
          disabled={busy}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-down px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {busy && <Loader2 size={13} className="animate-spin" aria-hidden />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
