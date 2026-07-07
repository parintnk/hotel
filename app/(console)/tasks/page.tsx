import * as db from "@/lib/db";
import TaskBoard from "@/components/TaskBoard";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const [tasks, props] = await Promise.all([db.getTasks(), db.getProperties()]);
  const hotelNames = Object.fromEntries(
    (props as any[]).map((p) => [p.id, p.name]),
  );
  const today = new Date().toISOString().slice(0, 10);
  const overdue = tasks.filter((t) => t.status !== "done" && t.due < today).length;
  const dueToday = tasks.filter((t) => t.status !== "done" && t.due === today).length;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mut">Agency · Workflow</p><h1 className="mt-0.5 text-xl font-bold tracking-tight">งานของทีม</h1>
          <p className="mt-1 max-w-2xl text-sm text-mut">
            งานต่อโรงแรมต่อบริการ — เห็นชัดว่าใครรับผิดชอบอะไร ไม่มีงานหลุดในแชท
            งานประจำ (รีวิวราคารายสัปดาห์, รายงานรายเดือน) ระบบสร้างรอบใหม่ให้อัตโนมัติ
          </p>
        </div>
        <span className="text-xs text-mut">
          <strong className={overdue ? "text-down" : ""}>{overdue} เลยกำหนด</strong> ·{" "}
          {dueToday} ครบกำหนดวันนี้
        </span>
      </div>
      <TaskBoard initial={tasks as any} hotelNames={hotelNames} />
    </main>
  );
}
