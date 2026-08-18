"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { formatFCFA } from "@/lib/format";
import { useCartStore } from "@/store/cart";

const SHIPPING_FEE = 2500;

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="container-page flex flex-col items-center justify-center py-24 text-center">
        <ShoppingBag className="mb-4 h-14 w-14 text-slate/40" strokeWidth={1.25} />
        <h1 className="text-h3 text-ink">Votre panier est vide</h1>
        <p className="mt-2 text-sm text-slate">
          Parcourez la boutique pour trouver l&apos;iPhone qu&apos;il vous faut.
        </p>
        <Link href="/boutique" className="btn btn-primary mt-6">
          Voir la boutique
        </Link>
      </div>
    );
  }

  const total = subtotal + SHIPPING_FEE;

  return (
    <div className="container-page py-10 lg:py-14">
      <h1 className="text-h1 mb-8 text-ink">Mon panier</h1>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {items.map((item) => (
            <div key={item.variantId} className="flex items-center gap-4 border-b border-line pb-5">
              <Link
                href={`/boutique/${item.productSlug}`}
                className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-mist"
              >
                {item.image && (
                  <Image src={item.image} alt={item.productName} fill sizes="80px" className="object-cover" />
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/boutique/${item.productSlug}`}
                  className="line-clamp-1 text-[15px] font-semibold text-ink hover:text-accent"
                >
                  {item.productName}
                </Link>
                <p className="text-[13px] text-slate">
                  {[item.colorName, item.storage].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-1.5 text-[15px] font-semibold text-ink">{formatFCFA(item.price)}</p>
              </div>

              <div className="flex items-center rounded-full border border-line">
                <button
                  onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                  className="flex h-9 w-9 items-center justify-center text-ink transition hover:bg-mist"
                  aria-label="Diminuer"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                  className="flex h-9 w-9 items-center justify-center text-ink transition hover:bg-mist"
                  aria-label="Augmenter"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="hidden w-28 text-right text-[15px] font-semibold text-ink sm:block">
                {formatFCFA(item.price * item.quantity)}
              </p>

              <button
                onClick={() => removeItem(item.variantId)}
                aria-label="Retirer"
                className="text-slate transition hover:text-sale"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          <Link href="/boutique" className="link-underline inline-block text-sm font-semibold text-ink">
            ← Continuer mes achats
          </Link>
        </div>

        <div className="h-fit rounded-2xl bg-paper p-7">
          <h2 className="text-eyebrow mb-5 text-slate">Récapitulatif</h2>
          <div className="space-y-2.5 text-[14px] text-slate">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span className="text-ink">{formatFCFA(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Livraison</span>
              <span className="text-ink">{formatFCFA(SHIPPING_FEE)}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-line pt-4 text-[17px] font-semibold text-ink">
            <span>Total</span>
            <span>{formatFCFA(total)}</span>
          </div>
          <Link href="/checkout" className="btn btn-primary mt-6 w-full">
            Passer la commande
          </Link>
        </div>
      </div>
    </div>
  );
}
