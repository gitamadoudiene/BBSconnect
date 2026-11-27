"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatFCFA } from "@/lib/format";

export type RevenuePoint = { label: string; revenue: number; orders: number };

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { payload: RevenuePoint }[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-[12px] bg-ink px-3 py-2 text-white">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-white/60">{label}</p>
      <p className="tabular mt-1 text-[14px] font-semibold">{formatFCFA(point.revenue)}</p>
      <p className="font-mono text-[11px] text-white/60">{point.orders} commande{point.orders > 1 ? "s" : ""}</p>
    </div>
  );
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e4e1da" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10.5, fill: "#6c6f75", fontFamily: "var(--font-geist-mono)" }}
          interval="preserveStartEnd"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10.5, fill: "#6c6f75", fontFamily: "var(--font-geist-mono)" }}
          tickFormatter={(v) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#121315", strokeWidth: 1 }} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#0077a6"
          strokeWidth={2}
          fill="#e3f3f8"
          fillOpacity={0.7}
          activeDot={{ r: 4, fill: "#0077a6", stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
