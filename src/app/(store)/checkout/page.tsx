"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { analyticsIds } from "@/lib/analytics-client";
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
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          analytics: analyticsIds() ?? undefined,
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
      <h1 className="text-h1 mb-8 text-ink">Finaliser la commande</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-eyebrow mb-4 text-slate">
              Informations de livraison
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="field-label">Nom complet</label>
                <input name="customerName" required className="field" />
              </div>
              <div>
                <label className="field-label">Email</label>
                <input type="email" name="customerEmail" required className="field" />
              </div>
              <div>
                <label className="field-label">Téléphone</label>
                <input type="tel" name="customerPhone" required placeholder="+221 77 000 00 00" className="field" />
              </div>
              <div className="sm:col-span-2">
                <label className="field-label">Adresse</label>
                <input name="address" required className="field" />
              </div>
              <div>
                <label className="field-label">Ville</label>
                <input name="city" required defaultValue="Dakar" className="field" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-eyebrow mb-4 text-slate">
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
                  className="flex cursor-pointer items-center gap-3 rounded-[14px] border border-line-strong px-4 py-3.5 text-[14.5px] transition-colors has-[:checked]:border-ink has-[:checked]:bg-paper"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={opt.value}
                    checked={payment === opt.value}
                    onChange={() => setPayment(opt.value as typeof payment)}
                    className="accent-[#0077a6]"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate">
              Simulation de paiement à des fins de démonstration — aucune transaction réelle n&apos;est effectuée.
            </p>
          </div>
        </div>

        <div className="card-paper h-fit space-y-4 p-6">
          <h2 className="text-eyebrow text-slate">Résumé</h2>
          <ul className="space-y-2 text-sm">
            {items.map((item) => (
              <li key={item.variantId} className="flex justify-between text-ink-soft">
                <span className="line-clamp-1 pr-2">{item.productName} × {item.quantity}</span>
                <span className="shrink-0 font-medium">{formatFCFA(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t border-line pt-4 text-sm text-ink-soft">
            <div className="flex justify-between">
              <span>Sous-total</span>
              <span>{formatFCFA(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Livraison</span>
              <span>{formatFCFA(SHIPPING_FEE)}</span>
            </div>
          </div>
          <div className="tabular flex justify-between border-t border-ink pt-4 text-[17px] font-bold text-ink">
            <span>Total</span>
            <span>{formatFCFA(total)}</span>
          </div>

          {error && <p className="text-sm font-medium text-signal-deep">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-accent w-full"
          >
            {submitting ? "Traitement..." : "Confirmer la commande"}
          </button>
          <Link href="/panier" className="block text-center text-xs font-semibold text-accent hover:underline">
            ← Retour au panier
          </Link>
        </div>
      </form>
    </div>
  );
}
