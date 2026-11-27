import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import clsx from "clsx";

export function KpiCard({
  label,
  value,
  change,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  change?: number | null;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  hint?: string;
}) {
  return (
    <div className="db-card flex min-h-[176px] flex-col p-6">
      <div className="flex items-start justify-between">
        <p className="db-eyebrow">{label}</p>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-tint text-accent">
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
        </span>
      </div>
      <p className="tabular mt-auto pt-6 text-[clamp(1.6rem,2.3vw,2.1rem)] font-bold leading-none tracking-[-0.045em] text-ink">
        {value}
      </p>
      <div className="mt-3 font-mono text-[11.5px] text-slate">
        {change === undefined || change === null ? (
          <span>{hint ?? "vs période précédente"}</span>
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <span
              className={clsx(
                "badge px-2 py-0.5",
                change > 0 ? "bg-db-success-tint text-db-success" : change < 0 ? "bg-db-danger-tint text-db-danger" : "bg-paper text-slate"
              )}
            >
              {change > 0 ? <ArrowUpRight className="h-3 w-3" /> : change < 0 ? <ArrowDownRight className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
              {Math.abs(change).toFixed(1)} %
            </span>
            vs période précédente
          </span>
        )}
      </div>
    </div>
  );
}
