import Link from "next/link";
import clsx from "clsx";
import { periodLabels, type Period } from "@/lib/period";

export function PeriodFilter({ active, basePath = "/dashboard" }: { active: Period; basePath?: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {(Object.keys(periodLabels) as Period[]).map((p) => (
        <Link
          key={p}
          href={`${basePath}?periode=${p}`}
          className={clsx(
            "rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition",
            active === p ? "bg-ink text-white" : "text-db-muted hover:bg-db-bg"
          )}
        >
          {periodLabels[p]}
        </Link>
      ))}
    </div>
  );
}
