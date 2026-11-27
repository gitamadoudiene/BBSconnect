import Link from "next/link";

/** Ranked horizontal bars — pages, sources, devices… */
export function BarList({
  rows,
  unit,
  empty = "Pas encore de données sur cette période.",
}: {
  rows: { label: string; value: number; href?: string; mono?: boolean }[];
  unit?: string;
  empty?: string;
}) {
  if (rows.length === 0) return <p className="rounded-[14px] bg-paper px-4 py-6 text-center text-[13px] text-slate">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-1.5">
      {rows.map((r) => {
        const label = (
          <span className={r.mono ? "truncate font-mono text-[12px]" : "truncate"} title={r.label}>
            {r.label}
          </span>
        );
        return (
          <li key={r.label} className="relative overflow-hidden rounded-[10px]">
            <span className="absolute inset-y-0 left-0 rounded-[10px] bg-accent-tint" style={{ width: `${(r.value / max) * 100}%` }} />
            <span className="relative flex items-center justify-between gap-3 px-3 py-2 text-[13.5px] text-ink">
              {r.href ? (
                <Link href={r.href} target="_blank" className="min-w-0 truncate hover:underline">
                  {label}
                </Link>
              ) : (
                label
              )}
              <span className="tabular shrink-0 font-mono text-[12px] text-slate">
                {r.value}
                {unit ? ` ${unit}` : ""}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
