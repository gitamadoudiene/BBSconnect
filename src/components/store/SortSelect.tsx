"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

const options = [
  { value: "", label: "Pertinence" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "new", label: "Nouveautés" },
];

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("tri", value);
    else params.delete("tri");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <label className="relative shrink-0">
      <span className="sr-only">Trier par</span>
      <select
        defaultValue={searchParams.get("tri") ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        className="h-10 appearance-none rounded-xl border border-line-strong bg-white pl-3.5 pr-9 text-[14px] font-medium text-ink outline-none transition-colors hover:border-ink focus:border-accent"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
    </label>
  );
}
