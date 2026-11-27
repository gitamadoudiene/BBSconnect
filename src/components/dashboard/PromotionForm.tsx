"use client";

import { useActionState, useMemo, useState } from "react";
import clsx from "clsx";
import { Check, Search } from "lucide-react";
import { createPromotionAction } from "@/actions/promotions";
import { formatFCFA } from "@/lib/format";
import { promoPrice } from "@/lib/promoPrice";
import type { PickableProduct } from "./CollectionForm";

const modes = [
  { id: "products", label: "Produits choisis" },
  { id: "brand", label: "Une marque" },
  { id: "category", label: "Une catégorie" },
  { id: "all", label: "Tout le catalogue" },
] as const;

export function PromotionForm({
  products,
  brands,
  categories,
}: {
  products: PickableProduct[];
  brands: string[];
  categories: { id: string; name: string; parent: string | null }[];
}) {
  const [state, formAction, pending] = useActionState(createPromotionAction, undefined);
  const [mode, setMode] = useState<(typeof modes)[number]["id"]>("products");
  const [percent, setPercent] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    return products.filter((p) => p.status !== "ARCHIVED" && (!t || `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(t)));
  }, [products, q]);
  const example = products.find((p) => selected.includes(p.id) && p.price) ?? products.find((p) => p.price);

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr]">
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="productIds" value={JSON.stringify(selected)} />

      <div className="space-y-4">
        <section className="db-card space-y-5 p-6 lg:p-8">
          <h2 className="db-eyebrow">Remise</h2>
          <div>
            <label htmlFor="name" className="field-label">Nom (interne) *</label>
            <input id="name" name="name" required maxLength={80} placeholder="Black Friday iPhone" className="field field-sm" />
          </div>
          <div>
            <div className="flex items-end justify-between">
              <label htmlFor="percent" className="field-label">Pourcentage</label>
              <span className="tabular text-[32px] font-bold leading-none tracking-[-0.05em] text-signal-deep">−{percent} %</span>
            </div>
            <input
              id="percent"
              name="percent"
              type="range"
              min={1}
              max={70}
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
              className="mt-3 w-full accent-[var(--signal)]"
            />
            {example?.price && (
              <p className="mt-2 font-mono text-[12px] text-slate">
                Ex. {example.name} : <span className="line-through">{formatFCFA(example.price)}</span> →{" "}
                <span className="font-semibold text-ink">{formatFCFA(promoPrice(example.price, percent))}</span>
              </p>
            )}
          </div>
          <div>
            <label htmlFor="endsAt" className="field-label">Fin automatique (optionnel)</label>
            <input id="endsAt" name="endsAt" type="datetime-local" className="field field-sm" />
            <p className="mt-1.5 text-[12.5px] text-slate">Heure de Dakar. À la fin, les anciens prix reviennent tout seuls.</p>
          </div>
          <label className="flex items-start gap-3 rounded-[14px] bg-paper p-3.5 text-[14px] text-ink">
            <input type="checkbox" name="startNow" defaultChecked className="mt-0.5 h-4 w-4 accent-[var(--ink)]" />
            <span>
              Lancer tout de suite
              <span className="block text-[12.5px] text-slate">Sinon elle reste en brouillon, à lancer plus tard.</span>
            </span>
          </label>
          {state?.error && <p role="alert" className="rounded-[12px] bg-db-danger-tint px-3.5 py-2.5 text-[13.5px] font-medium text-db-danger">{state.error}</p>}
          <button type="submit" disabled={pending} className="btn btn-primary w-full">
            {pending ? "Création…" : "Créer la promotion"}
          </button>
        </section>
      </div>

      <section className="db-card flex max-h-[820px] flex-col overflow-hidden">
        <div className="border-b border-line p-5">
          <h2 className="db-eyebrow mb-3">Sur quoi ?</h2>
          <div className="rail flex gap-2 overflow-x-auto">
            {modes.map((m) => (
              <button key={m.id} type="button" onClick={() => setMode(m.id)} className={clsx("pill", mode === m.id && "pill-active")}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {mode === "brand" && (
          <div className="p-5">
            <label htmlFor="brand" className="field-label">Marque</label>
            <select id="brand" name="brand" className="field field-sm" defaultValue="">
              <option value="" disabled>Choisir…</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        )}
        {mode === "category" && (
          <div className="p-5">
            <label htmlFor="categoryId" className="field-label">Catégorie (sous-catégories incluses)</label>
            <select id="categoryId" name="categoryId" className="field field-sm" defaultValue="">
              <option value="" disabled>Choisir…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.parent ? `${c.parent} › ${c.name}` : c.name}</option>
              ))}
            </select>
          </div>
        )}
        {mode === "all" && (
          <p className="m-5 rounded-[14px] bg-signal-tint p-4 text-[13.5px] text-signal-deep">
            Tous les produits non archivés seront remisés de {percent} %. Les variantes déjà dans une autre promotion en cours sont ignorées.
          </p>
        )}
        {mode === "products" && (
          <>
            <div className="border-b border-line p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher un produit…" aria-label="Chercher un produit" className="field field-sm pl-10" />
              </div>
              <p className="mt-2 font-mono text-[11.5px] text-slate">{selected.length} sélectionné{selected.length > 1 ? "s" : ""} · toutes leurs variantes sont remisées</p>
            </div>
            <ul className="flex-1 divide-y divide-line overflow-y-auto">
              {results.map((p) => {
                const on = selected.includes(p.id);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setSelected((s) => (on ? s.filter((x) => x !== p.id) : [...s, p.id]))}
                      className={clsx("flex w-full items-center gap-3 px-4 py-3 text-left", on ? "bg-signal-tint/60" : "hover:bg-paper/60")}
                    >
                      <span className={clsx("flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border", on ? "border-ink bg-ink text-white" : "border-line-strong")}>
                        {on && <Check className="h-3.5 w-3.5" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold text-ink">{p.name}</span>
                        <span className="block truncate font-mono text-[11px] text-slate">{p.brand} · {p.category}</span>
                      </span>
                      {p.price !== null && (
                        <span className="tabular shrink-0 text-right text-[12.5px]">
                          <span className="block text-slate line-through">{formatFCFA(p.price)}</span>
                          <span className="block font-semibold text-ink">{formatFCFA(promoPrice(p.price, percent))}</span>
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>
    </form>
  );
}
