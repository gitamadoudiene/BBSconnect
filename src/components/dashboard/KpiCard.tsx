import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import clsx from "clsx";

export function KpiCard({
  label,
  value,
  change,
  icon: Icon,
}: {
  label: string;
  value: string;
  change?: number | null;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-db-border bg-db-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-[12.5px] font-medium text-db-muted">{label}</p>
        <Icon className="h-4 w-4 text-db-muted" />
      </div>
      <p className="mt-2 text-[26px] font-semibold leading-none text-db-text">{value}</p>
      {change !== undefined && (
        <div className="mt-2.5">
          {change === null ? (
            <span className="text-[12px] text-db-muted">vs période précédente</span>
          ) : (
            <span
              className={clsx(
                "inline-flex items-center gap-1 text-[12.5px] font-medium",
                change > 0 ? "text-db-success" : change < 0 ? "text-db-danger" : "text-db-muted"
              )}
            >
              {change > 0 ? <ArrowUp className="h-3 w-3" /> : change < 0 ? <ArrowDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
              {Math.abs(change).toFixed(1)}%
              <span className="font-normal text-db-muted">vs période précédente</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
