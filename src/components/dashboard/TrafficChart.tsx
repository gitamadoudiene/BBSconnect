"use client";

import { Area, Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SeriesPoint } from "@/lib/analytics";

function TooltipBox({ active, payload, label }: { active?: boolean; payload?: { payload: SeriesPoint }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const p = payload[0]!.payload;
  return (
    <div className="rounded-[12px] bg-ink px-3 py-2 text-white">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-white/60">{label}</p>
      <p className="tabular mt-1 text-[14px] font-semibold">{p.visitors} visiteur{p.visitors > 1 ? "s" : ""}</p>
      <p className="font-mono text-[11px] text-white/60">
        {p.pageViews} pages vues · {p.orders} commande{p.orders > 1 ? "s" : ""}
      </p>
    </div>
  );
}

export function TrafficChart({ data, height = 280 }: { data: SeriesPoint[]; height?: number }) {
  const tick = { fontSize: 10.5, fill: "#6c6f75", fontFamily: "var(--font-geist-mono)" };
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e4e1da" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={tick} interval="preserveStartEnd" minTickGap={16} />
        <YAxis yAxisId="v" tickLine={false} axisLine={false} tick={tick} width={32} allowDecimals={false} />
        <YAxis yAxisId="o" orientation="right" hide allowDecimals={false} />
        <Tooltip content={<TooltipBox />} cursor={{ stroke: "#121315", strokeWidth: 1 }} />
        <Bar yAxisId="o" dataKey="orders" fill="#ea792c" radius={[4, 4, 0, 0]} maxBarSize={14} />
        <Area yAxisId="v" type="monotone" dataKey="visitors" stroke="#0077a6" strokeWidth={2} fill="#e3f3f8" fillOpacity={0.7} activeDot={{ r: 4, fill: "#0077a6", stroke: "#fff", strokeWidth: 2 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
