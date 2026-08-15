"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatFCFA } from "@/lib/format";
import { useCartStore } from "@/store/cart";

const SHIPPING_FEE = 2500;

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<"livraison" | "mobile-money" | "carte">("livraison");

  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clear = useCartStore((s) => s.clear);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && items.length === 0 && !submitting) router.replace("/panier");
  }, [mounted, items.length, submitting, router]);

  if (!mounted || items.length === 0) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.get("customerName"),
          customerEmail: formData.get("customerEmail"),
          customerPhone: formData.get("customerPhone"),
          address: formData.get("address"),
          city: formData.get("city"),
          paymentMethod: payment,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue");
        setSubmitting(false);
        return;
      }
      clear();
      router.push(`/commande/${data.reference}`);
    } catch {
      setError("Impossible de contacter le serveur");
      setSubmitting(false);
    }
  }

  const total = subtotal + SHIPPING_FEE;

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-navy">Finaliser la commande</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-lg border border-brand-border p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-navy">
              Informations de livraison
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-brand-navy">Nom complet</label>
                <input name="customerName" required className="w-full rounded-md border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-brand-navy">Email</label>
                <input type="email" name="customerEmail" required className="w-full rounded-md border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-brand-navy">Téléphone</label>
                <input type="tel" name="customerPhone" required placeholder="+221 77 000 00 00" className="w-full rounded-md border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-brand-navy">Adresse</label>
                <input name="address" required className="w-full rounded-md border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-brand-navy">Ville</label>
                <input name="city" required defaultValue="Dakar" className="w-full rounded-md border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-brand-border p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-navy">
              Mode de paiement
            </h2>
            <div className="space-y-2">
              {[
                { value: "livraison", label: "Paiement à la livraison" },
                { value: "mobile-money", label: "Mobile Money (Orange Money / Wave)" },
                { value: "carte", label: "Carte bancaire" },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-3 rounded-md border border-brand-border px-4 py-3 text-sm has-[:checked]:border-brand-blue has-[:checked]:bg-brand-blue-light"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={opt.value}
                    checked={payment === opt.value}
                    onChange={() => setPayment(opt.value as typeof payment)}
                    className="accent-brand-blue"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-brand-navy/50">
              Simulation de paiement à des fins de démonstration — aucune transaction réelle n&apos;est effectuée.
            </p>
          </div>
        </div>

        <div className="h-fit space-y-4 rounded-lg border border-brand-border bg-brand-gray p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-navy">Résumé</h2>
          <ul className="space-y-2 text-sm">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between text-brand-navy/80">
                <span className="line-clamp-1 pr-2">{item.name} × {item.quantity}</span>
                <span className="shrink-0 font-medium">{formatFCFA(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t border-brand-border pt-4 text-sm text-brand-navy/70">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span>{formatFCFA(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Livraison</span>
              <span>{formatFCFA(SHIPPING_FEE)}</span>
            </div>
          </div>
          <div className="flex justify-between border-t border-brand-border pt-4 text-base font-bold text-brand-navy">
            <span>Total</span>
            <span>{formatFCFA(total)}</span>
          </div>

          {error && <p className="text-sm font-medium text-brand-red">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="block w-full rounded-md bg-brand-navy py-3 text-center text-sm font-semibold text-white hover:bg-brand-blue disabled:opacity-60"
          >
            {submitting ? "Traitement..." : "Confirmer la commande"}
          </button>
          <Link href="/panier" className="block text-center text-xs font-semibold text-brand-blue hover:underline">
            ← Retour au panier
          </Link>
        </div>
      </form>
    </div>
  );
}
