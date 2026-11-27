"use client";

import { useActionState, useMemo, useState } from "react";
import clsx from "clsx";
import { ArrowDown, ArrowUp, Check, Search, X } from "lucide-react";
import type { CollectionFormState } from "@/actions/collections";
import { formatFCFA } from "@/lib/format";

export type PickableProduct = { id: string; name: string; brand: string; category: string; price: number | null; image: string | null; status: string };

export function CollectionForm({
  products,
  action,
  submitLabel,
  defaults = {},
}: {
  products: PickableProduct[];
  action: (state: CollectionFormState, formData: FormData) => Promise<CollectionFormState>;
  submitLabel: string;
  defaults?: { name?: string; slug?: string; description?: string | null; active?: boolean; onHome?: boolean; productIds?: string[] };
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [selected, setSelected] = useState<string[]>(defaults.productIds ?? []);
  const [q, setQ] = useState("");
  const byId = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter((p) => !term || `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(term));
  }, [products, q]);

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const move = (i: number, d: -1 | 1) =>
    setSelected((s) => {
      const j = i + d;
      if (j < 0 || j >= s.length) return s;
      const next = [...s];
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr]">
      <input type="hidden" name="productIds" value={JSON.stringify(selected)} />

      <div className="space-y-4">
        <section className="db-card space-y-4 p-6 lg:p-8">
          <h2 className="db-eyebrow">Informations</h2>
          <div>
            <label htmlFor="name" className="field-label">Nom *</label>
            <input id="name" name="name" required maxLength={80} defaultValue={defaults.name} placeholder="Spécial rentrée" className="field field-sm" />
          </div>
          <div>
            <label htmlFor="description" className="field-label">Description</label>
            <textarea id="description" name="description" rows={3} maxLength={300} defaultValue={defaults.description ?? ""} className="field field-sm" />
          </div>
          <div>
            <label htmlFor="slug" className="field-label">Adresse (slug)</label>
            <input id="slug" name="slug" defaultValue={defaults.slug} placeholder="généré depuis le nom" className="field field-sm font-mono text-[12.5px]" />
          </div>
          <label className="flex items-center gap-3 text-[14px] text-ink">
            <input type="checkbox" name="active" defaultChecked={defaults.active ?? true} className="h-4 w-4 accent-[var(--ink)]" />
            Collection active (visible dans la boutique)
          </label>
          <label className="flex items-center gap-3 text-[14px] text-ink">
            <input type="checkbox" name="onHome" defaultChecked={defaults.onHome ?? false} className="h-4 w-4 accent-[var(--ink)]" />
            Afficher sur la page d&apos;accueil
          </label>
        </section>

        <section className="db-card p-6 lg:p-8">
          <h2 className="db-eyebrow mb-4">Ordre d&apos;affichage ({selected.length})</h2>
          {selected.length === 0 ? (
            <p className="rounded-[14px] bg-paper px-4 py-6 text-center text-[13.5px] text-slate">Cochez des produits dans la liste.</p>
          ) : (
            <ol className="space-y-2">
              {selected.map((id, i) => {
                const p = byId.get(id);
                if (!p) return null;
                return (
                  <li key={id} className="flex items-center gap-3 rounded-[14px] border border-line px-3 py-2">
                    <span className="w-5 font-mono text-[11px] text-slate">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-ink">{p.name}</span>
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Monter" className="flex h-7 w-7 items-center justify-center rounded-full text-slate hover:bg-paper disabled:opacity-30">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === selected.length - 1} aria-label="Descendre" className="flex h-7 w-7 items-center justify-center rounded-full text-slate hover:bg-paper disabled:opacity-30">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => toggle(id)} aria-label="Retirer" className="flex h-7 w-7 items-center justify-center rounded-full text-slate hover:bg-db-danger-tint hover:text-db-danger">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
          {state?.error && <p role="alert" className="mt-4 rounded-[12px] bg-db-danger-tint px-3.5 py-2.5 text-[13.5px] font-medium text-db-danger">{state.error}</p>}
          <button type="submit" disabled={pending} className="btn btn-primary mt-5 w-full">
            {pending ? "Enregistrement…" : submitLabel}
          </button>
        </section>
      </div>

      <section className="db-card flex max-h-[860px] flex-col overflow-hidden">
        <div className="border-b border-line p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Chercher un produit, une marque…" aria-label="Chercher un produit" className="field field-sm pl-10" />
          </div>
        </div>
        <ul className="flex-1 divide-y divide-line overflow-y-auto">
          {results.map((p) => {
            const on = selected.includes(p.id);
            return (
              <li key={p.id}>
                <button type="button" onClick={() => toggle(p.id)} aria-pressed={on} className={clsx("flex w-full items-center gap-3 px-4 py-3 text-left transition-colors", on ? "bg-accent-tint/60" : "hover:bg-paper/60")}>
                  <span className={clsx("flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border", on ? "border-ink bg-ink text-white" : "border-line-strong")}>
                    {on && <Check className="h-3.5 w-3.5" />}
                  </span>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-paper">
                    {p.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className="h-full w-full object-contain p-1" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold tracking-[-0.01em] text-ink">{p.name}</span>
                    <span className="block truncate font-mono text-[11px] text-slate">
                      {p.brand} · {p.category}
                      {p.status !== "PUBLISHED" && " · non publié"}
                    </span>
                  </span>
                  <span className="tabular shrink-0 text-[13px] font-medium text-ink">{p.price !== null ? formatFCFA(p.price) : "—"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </form>
  );
}
