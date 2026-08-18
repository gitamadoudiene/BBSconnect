"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatFCFA } from "@/lib/format";

export type RevenuePoint = { label: string; revenue: number; orders: number };

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { payload: RevenuePoint }[]; label?: string }) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-db-border bg-white px-3 py-2 shadow-lg">
      <p className="text-[12px] font-medium text-db-muted">{label}</p>
      <p className="mt-1 text-[13px] font-semibold text-db-text">{formatFCFA(point.revenue)}</p>
      <p className="text-[11.5px] text-db-muted">{point.orders} commande{point.orders > 1 ? "s" : ""}</p>
    </div>
  );
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0b70e1" stopOpacity={0.22} />
            <stop offset="100%" stopColor="#0b70e1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "#6b7280" }}
          interval="preserveStartEnd"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: "#6b7280" }}
          tickFormatter={(v) => (v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#0b70e1"
          strokeWidth={2}
          fill="url(#revenueFill)"
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
