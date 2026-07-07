"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Confirm } from "@/components/Modal";

export default function ResetData() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-xs text-white/50 transition-colors hover:text-white"
      >
        <RotateCcw size={12} aria-hidden /> รีเซ็ตข้อมูลเดโม
      </button>
      <Confirm
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={async () => {
          await fetch("/api/admin/reset", { method: "POST" });
          router.refresh();
        }}
        title="รีเซ็ตข้อมูลเดโมทั้งหมด?"
        detail="ทุกอย่างที่เพิ่ม/แก้/ลบไว้จะหายหมด และข้อมูลจะถูก seed ใหม่เป็นวันปัจจุบัน — ใช้เมื่อข้อมูลเดโมเริ่มเก่าหรืออยากเริ่มใหม่"
        confirmLabel="รีเซ็ตทั้งหมด"
      />
    </>
  );
}
