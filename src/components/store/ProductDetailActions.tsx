"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import clsx from "clsx";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";

type Props = {
  productId: string;
  variantId: string;
  productName: string;
  productSlug: string;
  price: number;
  colorName: string;
  colorHex: string;
  storage?: string | null;
  stock: number;
  image?: string;
};

export function ProductDetailActions({
  productId,
  variantId,
  productName,
  productSlug,
  price,
  colorName,
  colorHex,
  storage,
  stock,
  image,
}: Props) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const inWishlist = useWishlistStore((s) => s.has(productId));

  useEffect(() => setQty(1), [variantId]);

  function handleAdd() {
    addItem({ variantId, productName, productSlug, price, colorName, colorHex, storage, image }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function handleBuyNow() {
    addItem({ variantId, productName, productSlug, price, colorName, colorHex, storage, image }, qty);
    router.push("/panier");
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex items-center rounded-[14px] border border-line-strong">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-12 w-11 items-center justify-center text-ink transition-colors hover:text-accent"
            aria-label="Diminuer la quantité"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="tabular w-8 text-center font-mono text-[14px] font-medium">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(stock, q + 1))}
            className="flex h-12 w-11 items-center justify-center text-ink transition-colors hover:text-accent"
            aria-label="Augmenter la quantité"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={() => toggleWishlist(productId)}
          className="flex h-12 w-12 items-center justify-center rounded-[14px] border border-line-strong transition-colors hover:border-ink"
          aria-label="Ajouter aux favoris"
        >
          <Heart className={clsx("h-4 w-4", inWishlist ? "fill-signal text-signal-deep" : "text-ink")} />
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          disabled={stock <= 0}
          onClick={handleAdd}
          className="btn btn-accent h-[52px] flex-1"
        >
          <ShoppingCart className="h-4 w-4" />
          {added ? "Ajouté !" : "Ajouter au panier"}
        </button>
        <button
          disabled={stock <= 0}
          onClick={handleBuyNow}
          className="btn btn-primary h-[52px] flex-1"
        >
          Acheter maintenant
        </button>
      </div>
    </div>
  );
}
