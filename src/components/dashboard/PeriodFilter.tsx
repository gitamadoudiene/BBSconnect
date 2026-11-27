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
            "pill",
            active === p && "pill-active"
          )}
        >
          {periodLabels[p]}
        </Link>
      ))}
    </div>
  );
}
