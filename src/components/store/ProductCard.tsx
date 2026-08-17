"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import clsx from "clsx";
import { formatFCFA } from "@/lib/format";
import { useWishlistStore } from "@/store/wishlist";
import type { ProductCardData } from "@/lib/catalog";

export type { ProductCardData };

export function ProductCard({ product }: { product: ProductCardData }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.has(product.id));

  const variant = product.variants[activeIndex] ?? product.variants[0];
  if (!variant) return null;

  const discount =
    variant.compareAtPrice && variant.compareAtPrice > variant.price
      ? Math.round(100 - (variant.price / variant.compareAtPrice) * 100)
      : null;

  const subtitle = [variant.storage, variant.colorName].filter(Boolean).join(" · ");
  const href = `/boutique/${product.slug}${
    product.variants.length > 1 ? `?variante=${variant.id}` : ""
  }`;

  return (
    <div className="group flex flex-col">
      <div
        className="relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <button
          onClick={() => toggleWishlist(product.id)}
          aria-label="Ajouter aux favoris"
          className="glass absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-ink transition hover:scale-105"
        >
          <Heart className={clsx("h-4 w-4", inWishlist ? "fill-sale text-sale" : "text-ink")} />
        </button>

        {discount && (
          <span className="glass absolute left-3 top-3 z-10 rounded-full px-2.5 py-1 text-[11px] font-semibold text-sale">
            -{discount}%
          </span>
        )}

        <Link
          href={href}
          className="glass-sheen block overflow-hidden rounded-2xl bg-mist transition-transform duration-500 ease-out group-hover:-translate-y-1"
        >
          <div className="relative aspect-[4/5]">
            {variant.image && (
              <Image
                src={variant.image}
                alt={`${product.name} — ${variant.colorName}`}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className={clsx(
                  "object-cover transition-opacity duration-500 ease-out",
                  hovered && variant.hoverImage ? "opacity-0" : "opacity-100"
                )}
              />
            )}
            {variant.hoverImage && (
              <Image
                src={variant.hoverImage}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className={clsx(
                  "object-cover transition-opacity duration-500 ease-out",
                  hovered ? "opacity-100" : "opacity-0"
                )}
              />
            )}
          </div>
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-1 pt-4">
        <Link href={href} className="line-clamp-1 text-[15px] font-semibold text-ink">
          {product.name}
        </Link>
        {subtitle && <span className="text-[13px] text-slate">{subtitle}</span>}

        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-[17px] font-semibold text-ink">{formatFCFA(variant.price)}</span>
          {variant.compareAtPrice && (
            <span className="text-[13px] text-slate line-through">{formatFCFA(variant.compareAtPrice)}</span>
          )}
        </div>

        {variant.stock <= 0 ? (
          <span className="text-[12px] font-medium text-sale">Rupture de stock</span>
        ) : variant.stock <= 5 ? (
          <span className="text-[12px] font-medium text-slate">Plus que {variant.stock} en stock</span>
        ) : null}

        {product.variants.length > 1 && (
          <div className="mt-2 flex items-center gap-1.5">
            {product.variants.map((v, i) => (
              <button
                key={v.id}
                onClick={() => setActiveIndex(i)}
                aria-label={v.colorName}
                title={v.colorName}
                className={clsx(
                  "h-4 w-4 shrink-0 rounded-full ring-1 ring-offset-1 transition",
                  i === activeIndex ? "ring-ink" : "ring-transparent hover:ring-line"
                )}
                style={{ backgroundColor: v.colorHex }}
              />
            ))}
          </div>
        )}

        <Link
          href={href}
          className="group/cta mt-2.5 flex items-center gap-1.5 text-[13.5px] font-semibold text-ink"
        >
          Découvrir
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
