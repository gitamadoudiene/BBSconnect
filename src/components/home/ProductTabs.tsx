"use client";

import { useState } from "react";
import clsx from "clsx";
import { ProductCard } from "@/components/store/ProductCard";
import type { ProductCardData } from "@/lib/catalog";

export type TabbedProducts = { key: string; label: string; products: ProductCardData[] };

/** Brand tabs over a product grid. Tabs are a real tablist; switching is
 * instant — no transition between grids. */
export function ProductTabs({ tabs }: { tabs: TabbedProducts[] }) {
  const available = tabs.filter((t) => t.products.length > 0);
  const [active, setActive] = useState(available[0]?.key);
  const current = available.find((t) => t.key === active) ?? available[0];
  if (!current) return null;

  return (
    <div>
      <div role="tablist" aria-label="Filtrer par marque" className="rail flex gap-2 overflow-x-auto">
        {available.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={t.key === current.key}
            onClick={() => setActive(t.key)}
            className={clsx("chip", t.key === current.key && "chip-active")}
          >
            {t.label}
            <span className={clsx("font-mono text-[11px]", t.key === current.key ? "text-white/60" : "text-slate")}>
              {t.products.length}
            </span>
          </button>
        ))}
      </div>

      <div role="tabpanel" className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
        {current.products.slice(0, 8).map((p, i) => (
          <ProductCard key={p.id} product={p} priority={i < 4} />
        ))}
      </div>
    </div>
  );
}
