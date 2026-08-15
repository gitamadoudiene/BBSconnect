"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

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
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      defaultValue={searchParams.get("tri") ?? ""}
      onChange={(e) => handleChange(e.target.value)}
      className="shrink-0 rounded-full border border-line bg-white px-4 py-2 text-[13.5px] font-medium text-ink outline-none transition focus:border-ink"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
