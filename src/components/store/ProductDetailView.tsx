"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck, Lock, ShieldCheck, Truck } from "lucide-react";
import clsx from "clsx";
import { ProductGallery } from "./ProductGallery";
import { ProductDetailActions } from "./ProductDetailActions";
import { formatFCFA } from "@/lib/format";
import type { ProductWithVariants } from "@/lib/catalog";

const guarantees = [
  { icon: Truck, label: "Livraison rapide" },
  { icon: ShieldCheck, label: "Garantie disponible" },
  { icon: BadgeCheck, label: "Produit authentique" },
  { icon: Lock, label: "Paiement sécurisé" },
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

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_440px] lg:gap-16">
      <ProductGallery images={images} productName={product.name} />

      <div className="lg:sticky lg:top-28 lg:self-start">
        <span className="text-eyebrow text-accent">{product.category.name}</span>
        <h1 className="mt-3 text-ink" style={{ fontSize: "clamp(1.75rem, 1.2vw + 1.4rem, 2.5rem)", fontWeight: 600, lineHeight: 1.1 }}>
          {product.name}
        </h1>
        <p className="mt-2 text-[13px] text-slate">SKU {selected.sku}</p>

        <div className="mt-6 flex items-baseline gap-3">
          <span className="text-[26px] font-semibold text-ink">{formatFCFA(selected.price)}</span>
          {selected.compareAtPrice && (
            <span className="text-base text-slate line-through">{formatFCFA(selected.compareAtPrice)}</span>
          )}
        </div>

        <p className="mt-5 text-[14.5px] leading-relaxed text-slate">{product.description}</p>

        {colors.length > 0 && (
          <div className="mt-6">
            <p className="mb-2.5 text-[13px] font-medium text-ink">
              Couleur <span className="text-slate">— {selected.colorName}</span>
            </p>
            <div className="flex flex-wrap gap-2.5">
              {colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => pickColor(c.name)}
                  aria-label={c.name}
                  title={c.name}
                  className={clsx(
                    "h-8 w-8 rounded-full ring-1 ring-offset-2 transition",
                    selected.colorName === c.name ? "ring-ink" : "ring-transparent hover:ring-line"
                  )}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
        )}

        {storages.length > 0 && (
          <div className="mt-6">
            <p className="mb-2.5 text-[13px] font-medium text-ink">Stockage</p>
            <div className="flex flex-wrap gap-2">
              {storages.map((s) => (
                <button
                  key={s}
                  onClick={() => pickStorage(s)}
                  className={clsx(
                    "rounded-full border px-4 py-2 text-[13px] font-medium transition",
                    selected.storage === s ? "border-ink bg-ink text-white" : "border-line text-ink hover:border-ink"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="mt-6 text-[13.5px]">
          <span className="text-slate">Disponibilité </span>
          <span className={selected.stock > 0 ? "font-medium text-ink" : "font-medium text-sale"}>
            {selected.stock > 0 ? `En stock (${selected.stock})` : "Rupture de stock"}
          </span>
        </p>

        <div className="mt-6">
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

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-line py-6">
          {guarantees.map((g) => (
            <div key={g.label} className="flex items-center gap-2.5 text-[13px] text-ink">
              <g.icon className="h-4 w-4 shrink-0 text-slate" strokeWidth={1.5} />
              {g.label}
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wide text-ink">
            Caractéristiques techniques
          </h2>
          <ul className="space-y-2.5 text-[13.5px] text-ink/80">
            {specLines.map((line) => {
              const [label, ...rest] = line.split(":");
              return (
                <li key={line} className="flex justify-between gap-4 border-b border-line/70 pb-2.5">
                  <span className="text-slate">{label}</span>
                  <span className="text-right font-medium text-ink">{rest.join(":").trim()}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
