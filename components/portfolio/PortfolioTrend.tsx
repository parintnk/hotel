"use client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TOOLTIP_STYLE } from "@/components/dashboard/OccupancyChart";

export default function PortfolioTrend({
  data,
}: {
  data: { date: string; revenue: number }[];
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-4 shadow-card">
      <div className="flex items-baseline justify-between">
        <div className="text-sm font-semibold">รายได้รวมทั้ง portfolio · 14 วัน</div>
        <div className="text-[11px] text-mut">ทุกโรงแรมรวมกัน · บาท</div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 14, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="port" x1="0" y1="0" x2="0" y2="1">
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
            tickLine={false}
            axisLine={false}
            fontSize={11}
            width={44}
            tick={{ fill: "#8A8880" }}
            tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}
          />
          <Tooltip
            {...TOOLTIP_STYLE}
            formatter={(v) => [`${Number(v).toLocaleString()} บาท`, "รายได้รวม"]}
            cursor={{ stroke: "#D97706", strokeDasharray: "3 3" }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#D97706"
            strokeWidth={2}
            fill="url(#port)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
