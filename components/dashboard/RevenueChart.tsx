"use client";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TOOLTIP_STYLE } from "./OccupancyChart";

export function RevenueChart({
  data,
}: {
  data: { date: string; revenue: number }[];
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-card">
      <div className="flex items-baseline justify-between">
        <div className="text-sm font-semibold">รายได้รายวัน</div>
        <div className="text-[11px] text-mut">หน่วย: บาท</div>
      </div>
      <ResponsiveContainer width="100%" height={210}>
        <BarChart
          data={data}
          barCategoryGap="28%"
          margin={{ top: 16, right: 4, left: 0, bottom: 0 }}
        >
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
            tickLine={false}
            axisLine={false}
            fontSize={11}
            width={40}
            tick={{ fill: "#8A8880" }}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
            }
          />
          <Tooltip
            {...TOOLTIP_STYLE}
            formatter={(v) => [`${Number(v).toLocaleString()} บาท`, "รายได้"]}
            cursor={{ fill: "rgba(23,22,26,0.04)" }}
          />
          <Bar
            dataKey="revenue"
            fill="#D97706"
            radius={[4, 4, 0, 0]}
            maxBarSize={22}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
