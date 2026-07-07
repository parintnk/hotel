import Spark from "@/components/Spark";

export function KpiCard({
  label,
  value,
  unit,
  delta,
  spark,
}: {
  label: string;
  value: string;
  unit?: string;
  delta?: number;
  spark?: number[];
}) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-card">
      <div className="text-xs font-medium text-mut">{label}</div>
      <div className="mt-1 flex items-end justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tabular-nums tracking-tight">
              {value}
            </span>
            {unit && <span className="text-sm text-mut">{unit}</span>}
          </div>
          {delta !== undefined && (
            <div
              className={`mt-1 text-[11px] font-medium ${up ? "text-up" : "text-down"}`}
            >
              {up ? "▲" : "▼"} {Math.abs(delta)}% จากสัปดาห์ก่อน
            </div>
          )}
        </div>
        {spark && <Spark points={spark} width={84} height={34} />}
      </div>
    </div>
  );
}
