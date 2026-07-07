"use client";
import { useState } from "react";
import {
  CalendarClock,
  ChevronRight,
  GripVertical,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { Confirm, Field, Modal, inputCls } from "@/components/Modal";

type Task = {
  id: string;
  hotel_id: string | null;
  title: string;
  service: string;
  assignee: string;
  due: string;
  status: "todo" | "doing" | "done";
  recurring: "weekly" | "monthly" | null;
};

const COLS: { key: Task["status"]; label: string; tint: string }[] = [
  { key: "todo", label: "ต้องทำ", tint: "border-t-mut" },
  { key: "doing", label: "กำลังทำ", tint: "border-t-brand" },
  { key: "done", label: "เสร็จแล้ว", tint: "border-t-up" },
];
const NEXT: Record<Task["status"], Task["status"]> = {
  todo: "doing",
  doing: "done",
  done: "todo",
};
const SERVICE_CLS: Record<string, string> = {
  Revenue: "bg-brand/15 text-brand-ink",
  Marketing: "bg-[#7C3AED]/10 text-[#5B21B6]",
  Sales: "bg-[#0891B2]/10 text-[#155E75]",
  Reporting: "bg-ink/5 text-ink/60",
  Onboarding: "bg-up/10 text-up",
  "RevPlus+": "bg-down/10 text-down",
};

export default function TaskBoard({
  initial,
  hotelNames,
}: {
  initial: Task[];
  hotelNames: Record<string, string>;
}) {
  const [tasks, setTasks] = useState(initial);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<Task["status"] | null>(null);
  const [q, setQ] = useState("");
  const [fHotel, setFHotel] = useState("all");
  const [fWho, setFWho] = useState("all");
  const today = new Date().toISOString().slice(0, 10);

  const assignees = [...new Set(initial.map((t) => t.assignee))];
  const visible = tasks.filter(
    (t) =>
      (fHotel === "all" ||
        (fHotel === "none" ? !t.hotel_id : t.hotel_id === fHotel)) &&
      (fWho === "all" || t.assignee === fWho) &&
      (!q.trim() || t.title.includes(q.trim())),
  );

  const [form, setForm] = useState<Partial<Task> | null>(null); // null=ปิด, ไม่มี id=สร้างใหม่
  const [confirmDel, setConfirmDel] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);

  async function moveTo(id: string, status: Task["status"]) {
    const t = tasks.find((x) => x.id === id);
    if (!t || t.status === status) return;
    setTasks((ts) => ts.map((x) => (x.id === id ? { ...x, status } : x)));
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }).catch(() => {});
  }

  async function submitForm() {
    if (!form?.title?.trim() || !form.due || !form.assignee?.trim()) return;
    setSaving(true);
    try {
      const isEdit = !!form.id;
      const res = await fetch(isEdit ? `/api/tasks/${form.id}` : "/api/tasks", {
        method: isEdit ? "PATCH" : "POST",
        body: JSON.stringify({
          title: form.title,
          service: form.service ?? "Revenue",
          assignee: form.assignee,
          due: form.due,
          hotel_id: form.hotel_id || null,
          recurring: form.recurring || null,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const saved = await res.json();
      setTasks((ts) =>
        isEdit ? ts.map((x) => (x.id === saved.id ? saved : x)) : [...ts, saved],
      );
      setForm(null);
    } catch {
      // คง modal ไว้ให้ลองใหม่
    } finally {
      setSaving(false);
    }
  }

  async function remove(t: Task) {
    const res = await fetch(`/api/tasks/${t.id}`, { method: "DELETE" });
    if (res.ok) setTasks((ts) => ts.filter((x) => x.id !== t.id));
  }

  return (
    <>
      {/* Filter bar */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <label className="relative">
          <Search
            size={13}
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-mut"
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหางาน…"
            className="w-48 rounded-full border border-ink/15 bg-white py-1.5 pl-8 pr-3 text-xs outline-none transition-colors focus:border-brand"
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
          <option value="none">งานกลาง (ไม่ผูกโรงแรม)</option>
        </select>
        <select
          value={fWho}
          onChange={(e) => setFWho(e.target.value)}
          aria-label="กรองตามผู้รับผิดชอบ"
          className="cursor-pointer rounded-full border border-ink/15 bg-white px-3 py-1.5 text-xs"
        >
          <option value="all">ทุกคน</option>
          {assignees.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        {(q || fHotel !== "all" || fWho !== "all") && (
          <span className="text-xs tabular-nums text-mut">
            แสดง {visible.length}/{tasks.length} งาน ·{" "}
            <button
              onClick={() => {
                setQ("");
                setFHotel("all");
                setFWho("all");
              }}
              className="cursor-pointer text-brand-ink underline"
            >
              ล้างตัวกรอง
            </button>
          </span>
        )}
        <button
          onClick={() =>
            setForm({ due: new Date().toISOString().slice(0, 10), service: "Revenue" })
          }
          className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-brand-ink transition-transform hover:scale-[1.03]"
        >
          <Plus size={14} aria-hidden /> เพิ่มงาน
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
      {COLS.map((col) => {
        const list = visible.filter((t) => t.status === col.key);
        const isOver = overCol === col.key && dragId !== null;
        return (
          <section
            key={col.key}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              setOverCol(col.key);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node))
                setOverCol((c) => (c === col.key ? null : c));
            }}
            onDrop={(e) => {
              e.preventDefault();
              const id = dragId ?? e.dataTransfer.getData("text/plain");
              if (id) moveTo(id, col.key);
              setDragId(null);
              setOverCol(null);
            }}
            className={`rounded-2xl border border-t-4 bg-white p-3 shadow-card transition-colors ${col.tint} ${
              isOver ? "border-brand bg-brand/5" : "border-ink/10"
            }`}
          >
            <h2 className="flex items-center justify-between px-1 text-sm font-semibold">
              {col.label}
              <span className="rounded-full bg-paper px-2 py-0.5 text-xs tabular-nums text-mut">
                {list.length}
              </span>
            </h2>
            <div className="mt-2 min-h-24 space-y-2">
              {list.map((t) => {
                const overdue = t.status !== "done" && t.due < today;
                const dueToday = t.status !== "done" && t.due === today;
                return (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={(e) => {
                      setDragId(t.id);
                      e.dataTransfer.setData("text/plain", t.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverCol(null);
                    }}
                    className={`group cursor-grab rounded-xl border p-3 transition-all active:cursor-grabbing ${
                      dragId === t.id
                        ? "rotate-1 border-brand opacity-50 shadow-lift"
                        : overdue
                          ? "border-down/40 bg-down/5 hover:shadow-lift"
                          : "border-ink/10 bg-paper/60 hover:shadow-lift"
                    }`}
                  >
                    <div className="flex items-start gap-1.5">
                      <GripVertical
                        size={13}
                        aria-hidden
                        className="mt-0.5 shrink-0 text-ink/20 group-hover:text-ink/40"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-1">
                          <div className="text-sm font-medium leading-snug">
                            {t.title}
                          </div>
                          <span className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => setForm(t)}
                              aria-label="แก้ไขงาน"
                              className="cursor-pointer rounded-md p-1 text-mut transition-colors hover:bg-white hover:text-ink"
                            >
                              <Pencil size={12} aria-hidden />
                            </button>
                            <button
                              onClick={() => setConfirmDel(t)}
                              aria-label="ลบงาน"
                              className="cursor-pointer rounded-md p-1 text-mut transition-colors hover:bg-down/10 hover:text-down"
                            >
                              <Trash2 size={12} aria-hidden />
                            </button>
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span
                            className={`rounded-full px-2 py-0.5 font-semibold ${SERVICE_CLS[t.service] ?? "bg-paper text-ink/60"}`}
                          >
                            {t.service}
                          </span>
                          {t.hotel_id && (
                            <span className="rounded-full border border-ink/15 px-2 py-0.5 text-ink/70">
                              {hotelNames[t.hotel_id] ?? t.hotel_id}
                            </span>
                          )}
                          {t.recurring && (
                            <span
                              className="inline-flex items-center gap-0.5 rounded-full bg-ink/5 px-2 py-0.5 text-ink/60"
                              title="งานประจำ ระบบสร้างรอบใหม่อัตโนมัติ"
                            >
                              <RefreshCw size={9} aria-hidden />
                              {t.recurring === "weekly" ? "รายสัปดาห์" : "รายเดือน"}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span
                            className={`inline-flex items-center gap-1 tabular-nums ${overdue ? "font-semibold text-down" : dueToday ? "font-semibold text-brand-ink" : "text-mut"}`}
                          >
                            <CalendarClock size={11} aria-hidden />
                            {overdue ? "เลยกำหนด · " : dueToday ? "วันนี้ · " : ""}
                            {t.due.slice(5)}
                          </span>
                          <span className="text-mut">{t.assignee}</span>
                        </div>
                        <button
                          onClick={() => moveTo(t.id, NEXT[t.status])}
                          className="mt-2 inline-flex cursor-pointer items-center gap-1 rounded-full border border-ink/15 px-2.5 py-1 text-[11px] font-medium text-ink/70 transition-colors hover:border-brand hover:bg-brand/10 hover:text-brand-ink md:hidden"
                        >
                          ไป &quot;{COLS.find((c) => c.key === NEXT[t.status])?.label}&quot;
                          <ChevronRight size={11} aria-hidden />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {list.length === 0 && (
                <p
                  className={`rounded-xl border border-dashed p-4 text-center text-xs transition-colors ${isOver ? "border-brand text-brand-ink" : "border-ink/15 text-mut"}`}
                >
                  {isOver ? "วางที่นี่" : "ลากงานมาวางได้"}
                </p>
              )}
            </div>
          </section>
        );
      })}
      </div>

      {/* ฟอร์มเพิ่ม/แก้งาน */}
      <Modal
        open={form !== null}
        onClose={() => setForm(null)}
        title={form?.id ? "แก้ไขงาน" : "เพิ่มงานใหม่"}
      >
        <div className="space-y-3">
          <Field label="ชื่องาน *">
            <input
              className={inputCls}
              value={form?.title ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="เช่น รีวิวราคาสุดสัปดาห์…"
              autoFocus
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="โรงแรม">
              <select
                className={inputCls}
                value={form?.hotel_id ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, hotel_id: e.target.value || null }))
                }
              >
                <option value="">งานกลาง (ทุกโรงแรม)</option>
                {Object.entries(hotelNames).map(([id, n]) => (
                  <option key={id} value={id}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="สายงาน">
              <select
                className={inputCls}
                value={form?.service ?? "Revenue"}
                onChange={(e) => setForm((f) => ({ ...f, service: e.target.value }))}
              >
                {Object.keys(SERVICE_CLS).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="ผู้รับผิดชอบ *">
              <input
                className={inputCls}
                list="task-assignees"
                value={form?.assignee ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, assignee: e.target.value }))
                }
                placeholder="ชื่อคนในทีม"
              />
              <datalist id="task-assignees">
                {assignees.map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
            </Field>
            <Field label="ครบกำหนด *">
              <input
                type="date"
                className={inputCls}
                value={form?.due ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, due: e.target.value }))}
              />
            </Field>
          </div>
          <Field label="งานประจำ">
            <select
              className={inputCls}
              value={form?.recurring ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  recurring: (e.target.value || null) as Task["recurring"],
                }))
              }
            >
              <option value="">ครั้งเดียว</option>
              <option value="weekly">ทุกสัปดาห์</option>
              <option value="monthly">ทุกเดือน</option>
            </select>
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setForm(null)}
              className="cursor-pointer rounded-full border border-ink/15 px-4 py-2 text-sm font-medium text-ink/70 transition-colors hover:bg-paper"
            >
              ยกเลิก
            </button>
            <button
              onClick={submitForm}
              disabled={saving || !form?.title?.trim() || !form?.due || !form?.assignee?.trim()}
              className="cursor-pointer rounded-full bg-brand px-5 py-2 text-sm font-semibold text-brand-ink transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {saving ? "กำลังบันทึก…" : form?.id ? "บันทึกการแก้ไข" : "เพิ่มงาน"}
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
        title="ลบงานนี้?"
        detail={`"${confirmDel?.title}" จะถูกลบถาวรและกู้คืนไม่ได้`}
        confirmLabel="ลบงาน"
      />
    </>
  );
}
