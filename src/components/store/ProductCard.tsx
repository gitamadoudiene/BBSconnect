"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import clsx from "clsx";
import { formatFCFA } from "@/lib/format";
import { useWishlistStore } from "@/store/wishlist";
import { PhoneSilhouette } from "@/components/ui/PhoneSilhouette";
import type { ProductCardData } from "@/lib/catalog";

export type { ProductCardData };

export function ProductCard({ product, priority }: { product: ProductCardData; priority?: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.has(product.id));

  const variant = product.variants[activeIndex] ?? product.variants[0];
  if (!variant) return null;

  const discount =
    variant.compareAtPrice && variant.compareAtPrice > variant.price
      ? Math.round(100 - (variant.price / variant.compareAtPrice) * 100)
      : null;

  const storages = Array.from(new Set(product.variants.map((v) => v.storage).filter(Boolean)));
  const colorCount = new Set(product.variants.map((v) => v.colorName)).size;
  const meta = [
    storages.length > 1 ? `${storages[0]} – ${storages[storages.length - 1]}` : storages[0],
    colorCount > 1 ? `${colorCount} coloris` : variant.colorName,
  ]
    .filter(Boolean)
    .join(" · ");

  const href = `/boutique/${product.slug}${product.variants.length > 1 ? `?variante=${variant.id}` : ""}`;

  return (
    <article className="group relative flex flex-col">
      <div className="relative">
        <Link
          href={href}
          className="relative block aspect-[4/5] overflow-hidden rounded-[24px] bg-paper"
          aria-label={product.name}
        >
          {variant.image ? (
            <>
              <Image
                src={variant.image}
                alt={`${product.name}, ${variant.colorName}`}
                fill
                priority={priority}
                sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw"
                className={clsx(
                  "object-cover transition-opacity duration-300",
                  variant.hoverImage && "group-hover:opacity-0"
                )}
              />
              {variant.hoverImage && (
                <Image
                  src={variant.hoverImage}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw"
                  className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <PhoneSilhouette color={variant.colorHex} label="Photo à venir" />
          )}
        </Link>

        {discount && (
          <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-signal px-2.5 py-1 font-mono text-[11px] font-medium text-ink">
            −{discount} %
          </span>
        )}

        <button
          onClick={() => toggleWishlist(product.id)}
          aria-label={inWishlist ? "Retirer des favoris" : "Ajouter aux favoris"}
          aria-pressed={inWishlist}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink transition-colors hover:bg-paper"
        >
          <Heart className={clsx("h-4 w-4", inWishlist && "fill-signal text-signal-deep")} />
        </button>
      </div>

      <div className="flex flex-1 flex-col pt-4">
        {product.brand && (
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-slate">{product.brand}</span>
        )}
        <Link href={href} className="mt-1 text-[16px] font-semibold leading-snug tracking-[-0.02em] text-ink">
          {product.name}
        </Link>
        {meta && <span className="mt-1 font-mono text-[12px] text-slate">{meta}</span>}

        <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="tabular whitespace-nowrap text-[17px] font-semibold tracking-[-0.02em] text-ink">
            {formatFCFA(variant.price)}
          </span>
          {variant.compareAtPrice && variant.compareAtPrice > variant.price && (
            <span className="tabular whitespace-nowrap text-[13px] text-slate line-through">
              {formatFCFA(variant.compareAtPrice)}
            </span>
          )}
        </div>

        <div className="mt-3 flex min-h-[18px] items-center justify-between gap-2">
          {product.variants.length > 1 ? (
            <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Couleur">
              {product.variants.slice(0, 6).map((v, i) => (
                <button
                  key={v.id}
                  onClick={() => setActiveIndex(i)}
                  role="radio"
                  aria-checked={i === activeIndex}
                  aria-label={[v.colorName, v.storage].filter(Boolean).join(", ")}
                  title={[v.colorName, v.storage].filter(Boolean).join(" · ")}
                  className={clsx(
                    "h-[18px] w-[18px] rounded-full border border-black/10 outline-offset-2 transition",
                    i === activeIndex ? "outline outline-[1.5px] outline-ink" : "hover:outline hover:outline-1 hover:outline-line-strong"
                  )}
                  style={{ backgroundColor: v.colorHex }}
                />
              ))}
            </div>
          ) : (
            <span />
          )}
          {variant.stock <= 0 ? (
            <span className="font-mono text-[11px] text-signal-deep">Épuisé</span>
          ) : variant.stock <= 5 ? (
            <span className="font-mono text-[11px] text-signal-deep">Plus que {variant.stock}</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
