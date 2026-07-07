"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";
import { Confirm } from "@/components/Modal";

export default function CancelBooking({
  id,
  guest,
}: {
  id: string;
  guest: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`ยกเลิกการจองของ ${guest}`}
        title="ยกเลิกการจอง"
        className="cursor-pointer rounded-md p-1 text-mut transition-colors hover:bg-down/10 hover:text-down"
      >
        <XCircle size={14} aria-hidden />
      </button>
      <Confirm
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={async () => {
          await fetch(`/api/bookings/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ status: "cancelled" }),
          });
          router.refresh();
        }}
        title="ยกเลิกการจองนี้?"
        detail={`การจองของ ${guest} จะถูกยกเลิก — ห้องจะกลับมาว่างให้จองใหม่ได้ทันที`}
        confirmLabel="ยกเลิกการจอง"
      />
    </>
  );
}
