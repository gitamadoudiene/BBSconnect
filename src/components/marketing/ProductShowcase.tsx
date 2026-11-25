"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { ProductCard } from "@/components/store/ProductCard";
import type { ProductCardData } from "@/lib/catalog";

export type ShowcaseItem = { card: ProductCardData; universe?: string };

const tabs = [
  { key: "all", label: "Tout", match: () => true, href: "/boutique" },
  { key: "apple", label: "Apple", match: (i: ShowcaseItem) => i.card.brand?.toLowerCase() === "apple", href: "/boutique?marque=apple" },
  { key: "samsung", label: "Samsung", match: (i: ShowcaseItem) => i.card.brand?.toLowerCase() === "samsung", href: "/boutique?marque=samsung" },
  { key: "smartphones", label: "Smartphones", match: (i: ShowcaseItem) => i.universe === "smartphones", href: "/boutique?categorie=smartphones" },
  {
    key: "tech",
    label: "Audio · Gaming · Montres",
    match: (i: ShowcaseItem) => ["audio", "gaming", "montres", "tablettes", "ordinateurs"].includes(i.universe ?? ""),
    href: "/boutique",
  },
] as const;

export function ProductShowcase({ items }: { items: ShowcaseItem[] }) {
  const [active, setActive] = useState<(typeof tabs)[number]["key"]>("all");
  const tab = tabs.find((t) => t.key === active) ?? tabs[0];
  const visible = useMemo(() => items.filter((i) => tab.match(i)).slice(0, 8), [items, tab]);

  return (
    <section className="section-space bg-white">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-eyebrow text-slate">Sélection du moment</p>
            <h2 className="mt-4 text-[clamp(2rem,3.4vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-ink">
              Les incontournables.
            </h2>
          </div>
          <Link href={tab.href} className="link-underline flex items-center gap-1.5 text-sm font-semibold text-ink">
            Voir tout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rail mt-9 flex gap-2 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className={clsx(
                "relative shrink-0 rounded-full px-5 py-2.5 text-[13.5px] font-semibold transition-colors",
                active === t.key ? "text-white" : "text-ink hover:bg-mist"
              )}
            >
              {active === t.key && (
                <motion.span
                  layoutId="showcase-pill"
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>

        <motion.div layout className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-8">
          <AnimatePresence mode="popLayout">
            {visible.map((item, i) => (
              <motion.div
                key={item.card.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.45, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProductCard product={item.card} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {visible.length === 0 && (
          <p className="mt-12 rounded-2xl border border-dashed border-line p-12 text-center text-slate">
            Aucun produit dans cette sélection pour le moment.
          </p>
        )}
      </div>
    </section>
  );
}
