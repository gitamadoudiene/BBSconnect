"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { PhoneMock } from "@/components/ui/PhoneMock";
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
        <ShoppingBag className="mb-4 h-14 w-14 text-brand-navy/20" />
        <h1 className="text-xl font-bold text-brand-navy">Votre panier est vide</h1>
        <p className="mt-2 text-sm text-brand-navy/60">
          Parcourez la boutique pour trouver l&apos;iPhone qu&apos;il vous faut.
        </p>
        <Link
          href="/boutique"
          className="mt-6 rounded-md bg-brand-blue px-6 py-3 text-sm font-semibold text-white hover:bg-brand-blue-dark"
        >
          Voir la boutique
        </Link>
      </div>
    );
  }

  const total = subtotal + SHIPPING_FEE;

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-navy">Mon panier</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-4 rounded-lg border border-brand-border p-4"
            >
              <Link href={`/boutique/${item.slug}`} className="h-20 w-14 shrink-0 rounded bg-brand-gray p-2">
                <PhoneMock color={item.color} variant="back" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/boutique/${item.slug}`} className="line-clamp-1 text-sm font-semibold text-brand-navy hover:text-brand-blue">
                  {item.name}
                </Link>
                {item.storage && <p className="text-xs text-brand-navy/50">{item.storage}</p>}
                <p className="mt-1 text-sm font-bold text-brand-navy">{formatFCFA(item.price)}</p>
              </div>

              <div className="flex items-center rounded-md border border-brand-border">
                <button
                  onClick={() => setQuantity(item.productId, item.quantity - 1)}
                  className="flex h-9 w-9 items-center justify-center text-brand-navy hover:bg-brand-gray"
                  aria-label="Diminuer"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                <button
                  onClick={() => setQuantity(item.productId, item.quantity + 1)}
                  className="flex h-9 w-9 items-center justify-center text-brand-navy hover:bg-brand-gray"
                  aria-label="Augmenter"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="hidden w-28 text-right text-sm font-bold text-brand-navy sm:block">
                {formatFCFA(item.price * item.quantity)}
              </p>

              <button
                onClick={() => removeItem(item.productId)}
                aria-label="Retirer"
                className="text-brand-navy/40 hover:text-brand-red"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          <Link href="/boutique" className="inline-block text-sm font-semibold text-brand-blue hover:underline">
            ← Continuer mes achats
          </Link>
        </div>

        <div className="h-fit rounded-lg border border-brand-border bg-brand-gray p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-navy">
            Récapitulatif
          </h2>
          <div className="space-y-2 text-sm text-brand-navy/70">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span>{formatFCFA(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Livraison</span>
              <span>{formatFCFA(SHIPPING_FEE)}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-between border-t border-brand-border pt-4 text-base font-bold text-brand-navy">
            <span>Total</span>
            <span>{formatFCFA(total)}</span>
          </div>
          <Link
            href="/checkout"
            className="mt-6 block rounded-md bg-brand-navy py-3 text-center text-sm font-semibold text-white hover:bg-brand-blue"
          >
            Passer la commande
          </Link>
        </div>
      </div>
    </div>
  );
}
