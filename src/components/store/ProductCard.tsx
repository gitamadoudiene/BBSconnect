"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, Heart } from "lucide-react";
import clsx from "clsx";
import { PhoneMock } from "@/components/ui/PhoneMock";
import { ProductStage } from "@/components/ui/ProductStage";
import { formatFCFA } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  color: string;
  storage?: string | null;
  stock: number;
  categoryName?: string;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.has(product.id));

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(100 - (product.price / product.compareAtPrice) * 100)
      : null;

  const subtitle = [product.storage, product.categoryName].filter(Boolean).join(" · ");

  function handleAdd() {
    if (product.stock <= 0) return;
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      color: product.color,
      storage: product.storage,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  return (
    <div className="group flex flex-col">
      <div className="relative">
        <button
          onClick={() => toggleWishlist(product.id)}
          aria-label="Ajouter aux favoris"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-ink shadow-sm backdrop-blur transition hover:scale-105"
        >
          <Heart className={clsx("h-4 w-4", inWishlist ? "fill-sale text-sale" : "text-ink")} />
        </button>

        {discount && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-sale shadow-sm backdrop-blur">
            -{discount}%
          </span>
        )}

        <Link href={`/boutique/${product.slug}`} className="hover-zoom block" tabIndex={-1}>
          <ProductStage className="aspect-[4/5] rounded-2xl">
            <div className="zoom-target h-full w-full">
              <PhoneMock color={product.color} variant="back" />
            </div>
          </ProductStage>
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-1 pt-4">
        <Link href={`/boutique/${product.slug}`} className="line-clamp-1 text-[15px] font-semibold text-ink">
          {product.name}
        </Link>
        {subtitle && <span className="text-[13px] text-slate">{subtitle}</span>}

        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-[17px] font-semibold text-ink">{formatFCFA(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-[13px] text-slate line-through">{formatFCFA(product.compareAtPrice)}</span>
          )}
        </div>

        {product.stock <= 0 ? (
          <span className="text-[12px] font-medium text-sale">Rupture de stock</span>
        ) : product.stock <= 5 ? (
          <span className="text-[12px] font-medium text-slate">Plus que {product.stock} en stock</span>
        ) : null}

        <button
          disabled={product.stock <= 0}
          onClick={handleAdd}
          className="group/cta mt-2 flex items-center gap-1.5 text-[13.5px] font-semibold text-ink disabled:cursor-not-allowed disabled:text-slate"
        >
          {added ? (
            <>
              <Check className="h-3.5 w-3.5" /> Ajouté au panier
            </>
          ) : (
            <>
              Ajouter au panier
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:translate-x-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
