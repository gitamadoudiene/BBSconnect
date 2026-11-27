"use client";

import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { ArrowRight, ChevronDown, MessageCircle, Package } from "lucide-react";
import { formatFCFA } from "@/lib/format";

export type MegaItem = { name: string; href: string; count: number; from: number | null };
export type MegaProduct = { name: string; href: string; from: number; image: string | null };
export type MegaColumn = {
  title: string;
  href?: string;
  items?: MegaItem[];
  products?: MegaProduct[];
  /** Shown when a brand column has nothing in stock yet. */
  emptyText?: string;
};
export type NavMenu = {
  key: string;
  label: string;
  href: string;
  allLabel: string;
  columns: MegaColumn[];
  feature: { eyebrow: string; title: string; href: string; image: string; tone: "orange" | "blue" | "peach"; from: number | null };
};

const featureTone = {
  orange: "bg-signal text-ink",
  blue: "bg-brand text-white",
  peach: "bg-signal-tint text-ink",
};

function Column({ col }: { col: MegaColumn }) {
  const empty = !col.items?.length && !col.products?.length;
  return (
    <div className="min-w-0">
      {col.href ? (
        <Link href={col.href} className="group flex items-center gap-1.5 text-[15px] font-bold tracking-[-0.02em] text-ink">
          {col.title}
          <ArrowRight className="h-3.5 w-3.5 text-slate transition-transform group-hover:translate-x-0.5 group-hover:text-ink" />
        </Link>
      ) : (
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-slate">{col.title}</p>
      )}

      {col.items && col.items.length > 0 && (
        <ul className="mt-3 space-y-0.5">
          {col.items.map((i) => (
            <li key={i.href}>
              <Link href={i.href} className="group -mx-2.5 block rounded-[10px] px-2.5 py-1.5 hover:bg-paper">
                <span className="block whitespace-nowrap text-[14px] text-ink-soft group-hover:text-ink">{i.name}</span>
                {i.from !== null && <span className="tabular block font-mono text-[10.5px] text-slate">dès {formatFCFA(i.from)}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {col.products && col.products.length > 0 && (
        <ul className="mt-3 space-y-1">
          {col.products.map((p) => (
            <li key={p.href}>
              <Link href={p.href} className="group -mx-2 flex items-center gap-3 rounded-[12px] p-2 hover:bg-paper">
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-paper group-hover:bg-white">
                  {p.image ? (
                    <Image src={p.image} alt="" fill sizes="44px" className="object-contain p-1" />
                  ) : (
                    <Package className="h-4 w-4 text-slate" strokeWidth={1.6} />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13.5px] font-medium text-ink">{p.name}</span>
                  <span className="tabular block font-mono text-[11px] text-slate">{formatFCFA(p.from)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {empty && col.emptyText && (
        <a
          href="https://wa.me/221788379919"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-start gap-2 rounded-[12px] bg-paper p-3 text-[12.5px] leading-snug text-slate hover:text-ink"
        >
          <MessageCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {col.emptyText}
        </a>
      )}
    </div>
  );
}

/** Full-width panel under the header bar. */
export function MegaPanel({ menu, onNavigate }: { menu: NavMenu; onNavigate: () => void }) {
  const f = menu.feature;
  return (
    <div className="absolute inset-x-0 top-full border-b border-line bg-white shadow-[0_24px_40px_-24px_rgba(18,19,21,0.25)]" onClick={(e) => (e.target as HTMLElement).closest("a") && onNavigate()}>
      <div className="container-page grid grid-cols-[1fr_230px] gap-8 py-8 xl:grid-cols-[1fr_300px] xl:gap-10">
        <div>
          <div className={clsx("grid gap-6 xl:gap-8", menu.columns.length >= 4 ? "grid-cols-4" : menu.columns.length === 3 ? "grid-cols-3" : "grid-cols-2")}>
            {menu.columns.map((c) => (
              <Column key={c.title} col={c} />
            ))}
          </div>
          <Link href={menu.href} className="group mt-8 inline-flex items-center gap-1.5 border-t border-line pt-4 text-[13.5px] font-semibold text-ink">
            <span className="link-underline">{menu.allLabel}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <Link href={f.href} className={clsx("group relative flex h-[240px] flex-col overflow-hidden rounded-[22px] p-5", featureTone[f.tone])}>
          <span className="relative z-10 font-mono text-[10.5px] uppercase tracking-[0.1em] opacity-75">{f.eyebrow}</span>
          <span className="relative z-10 mt-1.5 text-[22px] font-bold leading-tight tracking-[-0.035em]">{f.title}</span>
          {f.from !== null && <span className="tabular relative z-10 mt-1 font-mono text-[12px] opacity-80">dès {formatFCFA(f.from)}</span>}
          <span className="relative z-10 mt-auto inline-flex items-center gap-1.5 text-[13px] font-semibold">
            Découvrir <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
          <Image
            src={f.image}
            alt=""
            width={400}
            height={400}
            sizes="200px"
            className="pointer-events-none absolute -bottom-4 -right-6 h-[78%] w-auto object-contain drop-shadow-[0_16px_18px_rgba(0,0,0,0.25)] transition-transform duration-500 group-hover:-translate-y-1.5 group-hover:-rotate-2"
          />
        </Link>
      </div>
    </div>
  );
}

/** Mobile: one expandable block per menu. */
export function MobileMegaMenu({ menu, index }: { menu: NavMenu; index: number }) {
  return (
    <details className="group border-b border-line py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between [&::-webkit-details-marker]:hidden">
        <span className="text-[26px] font-bold tracking-[-0.035em] text-ink">{menu.label}</span>
        <span className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-slate">0{index + 1}</span>
          <ChevronDown className="h-5 w-5 text-slate transition-transform group-open:rotate-180" />
        </span>
      </summary>
      <div className="mt-4 space-y-5">
        {menu.columns.map((c) => (
          <div key={c.title}>
            {c.href ? (
              <Link href={c.href} className="text-[15px] font-bold text-ink">{c.title} →</Link>
            ) : (
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-slate">{c.title}</p>
            )}
            <div className="rail mt-2 flex gap-2 overflow-x-auto">
              {c.items?.map((i) => (
                <Link key={i.href} href={i.href} className="chip shrink-0">{i.name}</Link>
              ))}
              {c.products?.map((p) => (
                <Link key={p.href} href={p.href} className="chip shrink-0">{p.name}</Link>
              ))}
              {!c.items?.length && !c.products?.length && c.emptyText && (
                <span className="text-[13px] text-slate">Arrivage en cours</span>
              )}
            </div>
          </div>
        ))}
        <Link href={menu.href} className="btn btn-secondary btn-sm">
          {menu.allLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </details>
  );
}
