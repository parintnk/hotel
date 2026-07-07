"use client";
import { useState } from "react";
import {
  BellRing,
  Check,
  Copy,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Trash2,
  Trophy,
} from "lucide-react";
import { Confirm, Field, Modal, inputCls } from "@/components/Modal";

type Lead = {
  id: string;
  company: string;
  type: string;
  hotel_id: string | null;
  value: number;
  stage: string;
  next_follow: string;
  owner: string;
};

const STAGES = [
  { key: "contact", label: "ติดต่อแรก", tint: "border-t-mut" },
  { key: "nego", label: "เจรจา", tint: "border-t-[#0891B2]" },
  { key: "proposal", label: "ส่งข้อเสนอ", tint: "border-t-brand" },
  { key: "won", label: "ปิดได้", tint: "border-t-up" },
];
const TYPE_CLS: Record<string, string> = {
  Corporate: "bg-[#0891B2]/10 text-[#155E75]",
  "Travel agent": "bg-[#7C3AED]/10 text-[#5B21B6]",
  Event: "bg-[#DB2777]/10 text-[#9d1f5c]",
  "OTA deal": "bg-brand/15 text-brand-ink",
};

const baht = (n: number) => (n ? n.toLocaleString() + " ฿" : "—");

export default function CrmBoard({
  initial,
  hotelNames,
}: {
  initial: Lead[];
  hotelNames: Record<string, string>;
}) {
  const [leads, setLeads] = useState(initial);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overZone, setOverZone] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [drafting, setDrafting] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState<Partial<Lead> | null>(null);
  const [confirmDel, setConfirmDel] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);

  async function moveTo(id: string, stage: string) {
    const l = leads.find((x) => x.id === id);
    if (!l || l.stage === stage) return;
    setLeads((ls) => ls.map((x) => (x.id === id ? { ...x, stage } : x)));
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ stage }),
    }).catch(() => {});
  }

  async function submitForm() {
    if (!form?.company?.trim() || !form.owner?.trim() || !form.next_follow) return;
    setSaving(true);
    try {
      const isEdit = !!form.id;
      const res = await fetch(isEdit ? `/api/leads/${form.id}` : "/api/leads", {
        method: isEdit ? "PATCH" : "POST",
        body: JSON.stringify({
          company: form.company,
          type: form.type ?? "Corporate",
          owner: form.owner,
          next_follow: form.next_follow,
          value: Number(form.value ?? 0),
          hotel_id: form.hotel_id || null,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const saved = await res.json();
      setLeads((ls) =>
        isEdit ? ls.map((x) => (x.id === saved.id ? saved : x)) : [...ls, saved],
      );
      setForm(null);
    } catch {
      // คง modal ไว้ให้ลองใหม่
    } finally {
      setSaving(false);
    }
  }

  async function remove(l: Lead) {
    const res = await fetch(`/api/leads/${l.id}`, { method: "DELETE" });
    if (res.ok) setLeads((ls) => ls.filter((x) => x.id !== l.id));
  }

  async function draftFollowup(l: Lead) {
    setDrafting(l.id);
    try {
      const res = await fetch("/api/leads/followup", {
        method: "POST",
        body: JSON.stringify({ lead: l }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const { message } = await res.json();
      setDrafts((d) => ({ ...d, [l.id]: message }));
    } catch {
      setDrafts((d) => ({ ...d, [l.id]: "ร่างไม่สำเร็จ — ลองใหม่อีกครั้ง" }));
    } finally {
      setDrafting(null);
    }
  }

  async function copyDraft(id: string) {
    await navigator.clipboard.writeText(drafts[id] ?? "");
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const [q, setQ] = useState("");
  const [fOwner, setFOwner] = useState("all");
  const [fType, setFType] = useState("all");
  const owners = [...new Set(initial.map((l) => l.owner))];
  const types = [...new Set(initial.map((l) => l.type))];
  const visible = leads.filter(
    (l) =>
      (fOwner === "all" || l.owner === fOwner) &&
      (fType === "all" || l.type === fType) &&
      (!q.trim() || l.company.includes(q.trim())),
  );

  const active = visible.filter((l) => l.stage !== "won" && l.stage !== "lost");
  const won = visible.filter((l) => l.stage === "won");
  const lost = visible.filter((l) => l.stage === "lost");
  const followups = active
    .filter((l) => l.next_follow <= today)
    .sort((a, b) => a.next_follow.localeCompare(b.next_follow));
  const pipelineValue = active.reduce((s, l) => s + l.value, 0);
  const wonValue = won.reduce((s, l) => s + l.value, 0);
  const winRate =
    won.length + lost.length
      ? Math.round((won.length / (won.length + lost.length)) * 100)
      : null;

  const zoneProps = (zone: string) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setOverZone(zone);
    },
    onDragLeave: (e: React.DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node))
        setOverZone((z) => (z === zone ? null : z));
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      const id = dragId ?? e.dataTransfer.getData("text/plain");
      if (id) moveTo(id, zone);
      setDragId(null);
      setOverZone(null);
    },
  });

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
            placeholder="ค้นหาบริษัท/ดีล…"
            className="w-48 rounded-full border border-ink/15 bg-white py-1.5 pl-8 pr-3 text-xs outline-none transition-colors focus:border-brand"
          />
        </label>
        <select
          value={fOwner}
          onChange={(e) => setFOwner(e.target.value)}
          aria-label="กรองตามเจ้าของดีล"
          className="cursor-pointer rounded-full border border-ink/15 bg-white px-3 py-1.5 text-xs"
        >
          <option value="all">ทุกคน</option>
          {owners.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <select
          value={fType}
          onChange={(e) => setFType(e.target.value)}
          aria-label="กรองตามประเภทดีล"
          className="cursor-pointer rounded-full border border-ink/15 bg-white px-3 py-1.5 text-xs"
        >
          <option value="all">ทุกประเภท</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        {(q || fOwner !== "all" || fType !== "all") && (
          <span className="text-xs tabular-nums text-mut">
            แสดง {visible.length}/{leads.length} ดีล ·{" "}
            <button
              onClick={() => {
                setQ("");
                setFOwner("all");
                setFType("all");
              }}
              className="cursor-pointer text-brand-ink underline"
            >
              ล้างตัวกรอง
            </button>
          </span>
        )}
        <button
          onClick={() =>
            setForm({
              next_follow: new Date().toISOString().slice(0, 10),
              type: "Corporate",
            })
          }
          className="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-brand-ink transition-transform hover:scale-[1.03]"
        >
          <Plus size={14} aria-hidden /> เพิ่มดีล
        </button>
      </div>

      {/* KPI strip — อัปเดตสดตอนลากการ์ด/กรอง */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-ink/10 bg-ink p-4 text-white shadow-card">
          <div className="text-xs font-medium text-white/60">มูลค่า pipeline ที่วิ่งอยู่</div>
          <div className="mt-1 text-2xl font-bold tabular-nums tracking-tight">
            {pipelineValue.toLocaleString()}
            <span className="ml-1 text-sm font-normal text-white/50">฿</span>
          </div>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-card">
          <div className="text-xs font-medium text-mut">ปิดได้แล้ว</div>
          <div className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-up">
            {wonValue.toLocaleString()}
            <span className="ml-1 text-sm font-normal text-mut">฿</span>
          </div>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-card">
          <div className="text-xs font-medium text-mut">Win rate</div>
          <div className="mt-1 text-2xl font-bold tabular-nums tracking-tight">
            {winRate === null ? "—" : `${winRate}%`}
          </div>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-card">
          <div className="text-xs font-medium text-mut">ต้องตามวันนี้</div>
          <div
            className={`mt-1 text-2xl font-bold tabular-nums tracking-tight ${followups.length ? "text-down" : ""}`}
          >
            {followups.length}
            <span className="ml-1 text-sm font-normal text-mut">ราย</span>
          </div>
        </div>
      </div>

      {/* Follow-up วันนี้ + AI ร่างข้อความ */}
      {followups.length > 0 && (
        <section className="mt-4 rounded-2xl border border-brand/50 bg-[#FFFBEB] p-4 shadow-card">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-[#8A6D00]">
            <BellRing size={15} aria-hidden /> ต้องตามวันนี้ — อย่าปล่อยให้เย็น
          </h2>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {followups.map((l) => (
              <div key={l.id} className="rounded-xl border border-ink/10 bg-white p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">{l.company}</span>
                  {l.next_follow < today && (
                    <span className="rounded-full bg-down/10 px-2 py-0.5 text-[10px] font-semibold text-down">
                      เลยกำหนด
                    </span>
                  )}
                  <span className="ml-auto text-xs tabular-nums text-mut">
                    {baht(l.value)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-mut">
                  {l.hotel_id ? hotelNames[l.hotel_id] : "ทุกโรงแรม"} · {l.owner} ·{" "}
                  {STAGES.find((s) => s.key === l.stage)?.label}
                </div>
                {drafts[l.id] ? (
                  <div className="mt-2 rounded-lg bg-paper p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-brand-ink">
                        ข้อความที่ AI ร่างให้
                      </span>
                      <button
                        onClick={() => copyDraft(l.id)}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-ink/15 px-2 py-0.5 text-[11px] text-ink/70 transition-colors hover:bg-white"
                      >
                        {copied === l.id ? <Check size={11} aria-hidden /> : <Copy size={11} aria-hidden />}
                        {copied === l.id ? "คัดลอกแล้ว" : "คัดลอก"}
                      </button>
                    </div>
                    <p className="mt-1 whitespace-pre-line text-xs leading-relaxed text-ink/80">
                      {drafts[l.id]}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => draftFollowup(l)}
                    disabled={drafting !== null}
                    className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-brand bg-brand/10 px-3 py-1 text-[11px] font-semibold text-brand-ink transition-colors hover:bg-brand/20 disabled:opacity-60"
                  >
                    {drafting === l.id ? (
                      <Loader2 size={11} className="animate-spin" aria-hidden />
                    ) : (
                      <Sparkles size={11} aria-hidden />
                    )}
                    {drafting === l.id ? "AI กำลังร่าง…" : "ให้ AI ร่างข้อความตาม"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pipeline board — ลากข้าม stage ได้ */}
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STAGES.map((st) => {
          const list = visible.filter((l) => l.stage === st.key);
          const sum = list.reduce((s, l) => s + l.value, 0);
          const isOver = overZone === st.key && dragId !== null;
          return (
            <section
              key={st.key}
              {...zoneProps(st.key)}
              className={`rounded-2xl border border-t-4 p-3 shadow-card transition-colors ${st.tint} ${
                isOver
                  ? "border-brand bg-brand/5"
                  : st.key === "won"
                    ? "border-ink/10 bg-up/[0.04]"
                    : "border-ink/10 bg-white"
              }`}
            >
              <h2 className="flex items-center justify-between px-1 text-sm font-semibold">
                <span className="inline-flex items-center gap-1.5">
                  {st.key === "won" && <Trophy size={13} className="text-up" aria-hidden />}
                  {st.label}
                </span>
                <span className="rounded-full bg-paper px-2 py-0.5 text-xs tabular-nums text-mut">
                  {list.length}
                </span>
              </h2>
              <div className="mt-0.5 px-1 text-[11px] tabular-nums text-mut">
                {sum ? sum.toLocaleString() + " ฿" : "ยังไม่มีมูลค่า"}
              </div>
              <div className="mt-2 min-h-24 space-y-2">
                {list.map((l) => {
                  const overdue = l.next_follow < today;
                  return (
                    <div
                      key={l.id}
                      draggable
                      onDragStart={(e) => {
                        setDragId(l.id);
                        e.dataTransfer.setData("text/plain", l.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverZone(null);
                      }}
                      className={`group cursor-grab rounded-xl border p-3 transition-all active:cursor-grabbing ${
                        dragId === l.id
                          ? "rotate-1 border-brand opacity-50 shadow-lift"
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
                            <div className="text-sm font-semibold leading-snug">
                              {l.company}
                            </div>
                            <span className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={() => setForm(l)}
                                aria-label="แก้ไขดีล"
                                className="cursor-pointer rounded-md p-1 text-mut transition-colors hover:bg-white hover:text-ink"
                              >
                                <Pencil size={12} aria-hidden />
                              </button>
                              <button
                                onClick={() => setConfirmDel(l)}
                                aria-label="ลบดีล"
                                className="cursor-pointer rounded-md p-1 text-mut transition-colors hover:bg-down/10 hover:text-down"
                              >
                                <Trash2 size={12} aria-hidden />
                              </button>
                            </span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TYPE_CLS[l.type] ?? "bg-paper text-ink/60"}`}
                            >
                              {l.type}
                            </span>
                            <span className="text-[11px] text-mut">
                              {l.hotel_id ? hotelNames[l.hotel_id] : "ทุกโรงแรม"}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm font-bold tabular-nums tracking-tight">
                              {baht(l.value)}
                            </span>
                            <span
                              className="flex h-5 w-5 items-center justify-center rounded-full bg-ink/5 text-[9px] font-bold text-ink/60"
                              title={l.owner}
                            >
                              {l.owner.replace(/^(คุณ|พี่|ทีม)\s*/, "").charAt(0)}
                            </span>
                          </div>
                          {st.key !== "won" && (
                            <div
                              className={`mt-1 text-[11px] tabular-nums ${overdue ? "font-semibold text-down" : "text-mut"}`}
                            >
                              ตาม{overdue ? " (เลยกำหนด)" : ""} · {l.next_follow.slice(5)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {list.length === 0 && (
                  <p
                    className={`rounded-xl border border-dashed p-4 text-center text-xs transition-colors ${isOver ? "border-brand text-brand-ink" : "border-ink/15 text-mut"}`}
                  >
                    {isOver ? "วางที่นี่" : "ลาก lead มาวางได้"}
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Lost zone */}
      <div
        {...zoneProps("lost")}
        className={`mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-dashed p-3 transition-colors ${
          overZone === "lost" && dragId
            ? "border-down bg-down/5"
            : "border-ink/15 bg-paper/50"
        }`}
      >
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-mut">
          <Trash2 size={13} aria-hidden />
          {overZone === "lost" && dragId ? "ปล่อยเพื่อทำเครื่องหมาย 'หลุด'" : `หลุด (${lost.length})`}
        </span>
        {lost.map((l) => (
          <span
            key={l.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-ink/10 bg-white px-2.5 py-1 text-[11px] text-ink/50"
          >
            <span className="line-through">{l.company}</span>
            <button
              onClick={() => moveTo(l.id, "contact")}
              title="กู้คืนกลับ pipeline"
              className="inline-flex cursor-pointer items-center gap-0.5 text-brand-ink/70 hover:text-brand-ink"
            >
              <RotateCcw size={10} aria-hidden /> กู้คืน
            </button>
            <button
              onClick={() => setConfirmDel(l)}
              aria-label={`ลบ ${l.company} ถาวร`}
              className="cursor-pointer text-mut hover:text-down"
            >
              <Trash2 size={10} aria-hidden />
            </button>
          </span>
        ))}
      </div>

      {/* ฟอร์มเพิ่ม/แก้ดีล */}
      <Modal
        open={form !== null}
        onClose={() => setForm(null)}
        title={form?.id ? "แก้ไขดีล" : "เพิ่มดีลใหม่"}
      >
        <div className="space-y-3">
          <Field label="บริษัท / ชื่อดีล *">
            <input
              className={inputCls}
              value={form?.company ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              placeholder="เช่น บจก.ไทยทราเวล กรุ๊ป"
              autoFocus
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="ประเภทดีล">
              <select
                className={inputCls}
                value={form?.type ?? "Corporate"}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              >
                {["Corporate", "Travel agent", "Event", "OTA deal"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="โรงแรมที่เกี่ยวข้อง">
              <select
                className={inputCls}
                value={form?.hotel_id ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, hotel_id: e.target.value || null }))
                }
              >
                <option value="">ทุกโรงแรม</option>
                {Object.entries(hotelNames).map(([id, n]) => (
                  <option key={id} value={id}>
                    {n}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="มูลค่าโดยประมาณ (฿)">
              <input
                type="number"
                min={0}
                className={inputCls}
                value={form?.value ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, value: Number(e.target.value) }))
                }
                placeholder="0"
              />
            </Field>
            <Field label="นัดตามครั้งถัดไป *">
              <input
                type="date"
                className={inputCls}
                value={form?.next_follow ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, next_follow: e.target.value }))
                }
              />
            </Field>
          </div>
          <Field label="เจ้าของดีล *">
            <input
              className={inputCls}
              list="lead-owners"
              value={form?.owner ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
              placeholder="ชื่อคนในทีม"
            />
            <datalist id="lead-owners">
              {owners.map((o) => (
                <option key={o} value={o} />
              ))}
            </datalist>
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
              disabled={
                saving ||
                !form?.company?.trim() ||
                !form?.owner?.trim() ||
                !form?.next_follow
              }
              className="cursor-pointer rounded-full bg-brand px-5 py-2 text-sm font-semibold text-brand-ink transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {saving ? "กำลังบันทึก…" : form?.id ? "บันทึกการแก้ไข" : "เพิ่มดีล"}
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
        title="ลบดีลนี้?"
        detail={`"${confirmDel?.company}" จะถูกลบถาวรพร้อมประวัติ — ถ้าแค่ดีลไม่สำเร็จ ให้ลากไปช่อง "หลุด" แทน`}
        confirmLabel="ลบดีล"
      />
    </>
  );
}
