"use client";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export const TOOLTIP_STYLE = {
  contentStyle: {
    borderRadius: 12,
    border: "1px solid rgba(23,22,26,0.08)",
    boxShadow: "0 8px 24px -6px rgba(23,22,26,0.18)",
    fontSize: 12,
    padding: "8px 12px",
  },
  labelStyle: { color: "#8A8880", fontSize: 11, marginBottom: 2 },
} as const;

export function OccupancyChart({
  data,
  days,
}: {
  data: { date: string; occupancy: number }[];
  days?: number;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-card">
      <div className="flex items-baseline justify-between">
        <div className="text-sm font-semibold">
          อัตราเข้าพัก {days ?? data.length} วัน
        </div>
        <div className="text-[11px] text-mut">หน่วย: % ของห้องทั้งหมด</div>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <AreaChart data={data} margin={{ top: 16, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="occ" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F5B301" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#F5B301" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#ECEBE4" strokeWidth={1} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            fontSize={11}
            tick={{ fill: "#8A8880" }}
            interval="preserveStartEnd"
          />
          <YAxis
            unit="%"
            tickLine={false}
            axisLine={false}
            fontSize={11}
            width={34}
            tick={{ fill: "#8A8880" }}
            domain={[0, 100]}
          />
          <Tooltip
            {...TOOLTIP_STYLE}
            formatter={(v) => [`${v}%`, "เข้าพัก"]}
            cursor={{ stroke: "#D97706", strokeDasharray: "3 3" }}
          />
          {/* เส้นใช้ amber เข้ม (#D97706) ให้ contrast ≥3:1 บนพื้นขาว — fill เป็นเหลืองแบรนด์ */}
          <Area
            type="monotone"
            dataKey="occupancy"
            stroke="#D97706"
            strokeWidth={2}
            fill="url(#occ)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
