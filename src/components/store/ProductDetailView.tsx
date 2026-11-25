"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck, ShieldCheck, Truck, Wallet } from "lucide-react";
import clsx from "clsx";
import { ProductGallery } from "./ProductGallery";
import { ProductDetailActions } from "./ProductDetailActions";
import { formatFCFA } from "@/lib/format";
import type { ProductWithVariants } from "@/lib/catalog";

const guarantees = [
  { icon: Truck, label: "Livraison", value: "24 h à Dakar" },
  { icon: Wallet, label: "Paiement", value: "À la livraison ou Mobile Money" },
  { icon: ShieldCheck, label: "Garantie", value: "Défauts de fabrication" },
  { icon: BadgeCheck, label: "Origine", value: "Produit authentique" },
];

export function ProductDetailView({ product }: { product: ProductWithVariants }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialVariantId = searchParams.get("variante");

  const variants = product.variants;
  const [selectedId, setSelectedId] = useState(
    () => variants.find((v) => v.id === initialVariantId)?.id ?? variants[0]?.id
  );

  const colors = useMemo(() => {
    const seen = new Map<string, { name: string; hex: string }>();
    for (const v of variants) if (!seen.has(v.colorName)) seen.set(v.colorName, { name: v.colorName, hex: v.colorHex });
    return Array.from(seen.values());
  }, [variants]);

  const storages = useMemo(() => {
    const seen = new Set<string>();
    for (const v of variants) if (v.storage) seen.add(v.storage);
    return Array.from(seen);
  }, [variants]);

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];

  function selectVariant(matcher: (v: (typeof variants)[number]) => boolean) {
    const match = variants.find(matcher);
    if (!match) return;
    setSelectedId(match.id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("variante", match.id);
    router.replace(`/boutique/${product.slug}?${params.toString()}`, { scroll: false });
  }

  function pickColor(colorName: string) {
    selectVariant(
      (v) => v.colorName === colorName && (!selected?.storage || v.storage === selected.storage)
    );
    if (!variants.some((v) => v.colorName === colorName && v.storage === selected?.storage)) {
      selectVariant((v) => v.colorName === colorName);
    }
  }

  function pickStorage(storage: string) {
    selectVariant((v) => v.storage === storage && v.colorName === selected?.colorName);
    if (!variants.some((v) => v.storage === storage && v.colorName === selected?.colorName)) {
      selectVariant((v) => v.storage === storage);
    }
  }

  if (!selected) return null;

  const images = selected.images.map((img) => ({ id: img.id, url: img.url, alt: img.alt }));
  const specLines = product.specs.split("\n").filter(Boolean);
  const discount =
    selected.compareAtPrice && selected.compareAtPrice > selected.price
      ? Math.round(100 - (selected.price / selected.compareAtPrice) * 100)
      : null;

  /** Price of a storage option — in the selected colour when it exists, else the cheapest. */
  function priceFor(storage: string) {
    const sameColor = variants.find((v) => v.storage === storage && v.colorName === selected!.colorName);
    const cheapest = variants.filter((v) => v.storage === storage).sort((a, b) => a.price - b.price)[0];
    return (sameColor ?? cheapest)?.price;
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_440px] lg:gap-16">
      <ProductGallery images={images} productName={product.name} color={selected.colorHex} />

      <div className="lg:sticky lg:top-32 lg:self-start">
        <p className="text-eyebrow text-slate">
          {product.brand} · {product.category.name}
        </p>
        <h1 className="mt-3 text-[clamp(2rem,1.6vw+1.4rem,2.75rem)] font-bold leading-[1.02] tracking-[-0.04em] text-ink">
          {product.name}
        </h1>

        <div className="mt-5 flex flex-wrap items-baseline gap-3">
          <span className="tabular text-[28px] font-bold tracking-[-0.03em] text-ink">{formatFCFA(selected.price)}</span>
          {discount && (
            <>
              <span className="tabular text-[15px] text-slate line-through">{formatFCFA(selected.compareAtPrice!)}</span>
              <span className="rounded-full bg-signal px-2.5 py-1 font-mono text-[11px] font-medium text-ink">−{discount} %</span>
            </>
          )}
        </div>

        <p className="mt-5 text-[15.5px] leading-relaxed text-ink-soft">{product.description}</p>

        {colors.length > 0 && (
          <fieldset className="mt-8">
            <legend className="mb-3 flex w-full justify-between text-[14px] font-semibold text-ink">
              Couleur <span className="font-normal text-slate">{selected.colorName}</span>
            </legend>
            <div className="flex flex-wrap gap-3">
              {colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => pickColor(c.name)}
                  aria-label={c.name}
                  aria-pressed={selected.colorName === c.name}
                  title={c.name}
                  className={clsx(
                    "h-9 w-9 rounded-full border border-black/10 outline-offset-[3px] transition",
                    selected.colorName === c.name
                      ? "outline outline-2 outline-ink"
                      : "hover:outline hover:outline-1 hover:outline-line-strong"
                  )}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </fieldset>
        )}

        {storages.length > 0 && (
          <fieldset className="mt-8">
            <legend className="mb-3 text-[14px] font-semibold text-ink">Stockage</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {storages.map((s) => {
                const p = priceFor(s);
                const on = selected.storage === s;
                return (
                  <button
                    key={s}
                    onClick={() => pickStorage(s)}
                    aria-pressed={on}
                    className={clsx(
                      "flex flex-col items-start rounded-[14px] border px-4 py-3 text-left transition-colors",
                      on ? "border-ink bg-ink text-white" : "border-line-strong text-ink hover:border-ink"
                    )}
                  >
                    <span className="text-[15px] font-semibold">{s}</span>
                    {p !== undefined && (
                      <span className={clsx("tabular mt-0.5 font-mono text-[11.5px]", on ? "text-white/65" : "text-slate")}>
                        {formatFCFA(p)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        <p className="mt-8 flex items-center gap-2 font-mono text-[12.5px]">
          <span className={clsx("h-2 w-2 rounded-full", selected.stock > 0 ? "bg-success" : "bg-signal-deep")} />
          {selected.stock > 0 ? (
            <span className="text-ink">En stock{selected.stock <= 5 ? ` — plus que ${selected.stock}` : ""}</span>
          ) : (
            <span className="text-signal-deep">Épuisé — contactez-nous pour un réassort</span>
          )}
        </p>

        <div className="mt-5">
          <ProductDetailActions
            productId={product.id}
            variantId={selected.id}
            productName={product.name}
            productSlug={product.slug}
            price={selected.price}
            colorName={selected.colorName}
            colorHex={selected.colorHex}
            storage={selected.storage}
            stock={selected.stock}
            image={images[0]?.url}
          />
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[20px] border border-line bg-line">
          {guarantees.map((g) => (
            <div key={g.label} className="bg-white p-4">
              <dt className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.08em] text-slate">
                <g.icon className="h-4 w-4 text-accent" strokeWidth={1.8} />
                {g.label}
              </dt>
              <dd className="mt-1 text-[13.5px] font-medium text-ink">{g.value}</dd>
            </div>
          ))}
        </dl>

        {specLines.length > 0 && (
          <section className="mt-10">
            <h2 className="text-eyebrow text-slate">Fiche technique</h2>
            <dl className="mt-3 border-t border-ink">
              {specLines.map((line) => {
                const [label, ...rest] = line.split(":");
                const value = rest.join(":").trim();
                return (
                  <div key={line} className="grid grid-cols-[120px_1fr] gap-4 border-b border-line py-3 text-[14px]">
                    <dt className="font-mono text-[12px] text-slate">{value ? label.trim() : "—"}</dt>
                    <dd className="text-ink">{value || label.trim()}</dd>
                  </div>
                );
              })}
            </dl>
            <p className="mt-3 font-mono text-[11px] text-slate">Réf. {selected.sku}</p>
          </section>
        )}
      </div>
    </div>
  );
}
