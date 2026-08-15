"use client";

import { useActionState } from "react";
import type { ProductFormState } from "@/actions/products";

type Category = { id: string; name: string };

type DefaultValues = {
  name?: string;
  sku?: string;
  categoryId?: string;
  price?: number;
  compareAtPrice?: number | null;
  stock?: number;
  color?: string;
  storage?: string | null;
  description?: string;
  specs?: string;
  featured?: boolean;
};

export function ProductForm({
  categories,
  action,
  defaultValues,
  submitLabel,
}: {
  categories: Category[];
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  defaultValues?: DefaultValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-6">
      <div className="rounded-lg border border-brand-border bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-navy">
          Informations générales
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-brand-navy">Nom du produit</label>
            <input
              name="name"
              required
              defaultValue={defaultValues?.name}
              className="w-full rounded-md border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-navy">SKU</label>
            <input
              name="sku"
              required
              defaultValue={defaultValues?.sku}
              className="w-full rounded-md border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-navy">Catégorie</label>
            <select
              name="categoryId"
              required
              defaultValue={defaultValues?.categoryId}
              className="w-full rounded-md border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue"
            >
              <option value="" disabled>
                Choisir une catégorie
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-navy">Stockage (optionnel)</label>
            <input
              name="storage"
              placeholder="ex: 128 Go"
              defaultValue={defaultValues?.storage ?? ""}
              className="w-full rounded-md border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-navy">Couleur</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                name="color"
                defaultValue={defaultValues?.color ?? "#1d1d1f"}
                className="h-10 w-14 cursor-pointer rounded-md border border-brand-border"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-brand-border bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-navy">
          Prix et stock
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-navy">Prix (FCFA)</label>
            <input
              type="number"
              name="price"
              min={0}
              required
              defaultValue={defaultValues?.price}
              className="w-full rounded-md border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-navy">Prix barré (optionnel)</label>
            <input
              type="number"
              name="compareAtPrice"
              min={0}
              defaultValue={defaultValues?.compareAtPrice ?? ""}
              className="w-full rounded-md border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-navy">Stock</label>
            <input
              type="number"
              name="stock"
              min={0}
              required
              defaultValue={defaultValues?.stock}
              className="w-full rounded-md border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
          </div>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-brand-navy">
          <input type="checkbox" name="featured" defaultChecked={defaultValues?.featured} className="accent-brand-blue" />
          Mettre en avant sur la page d&apos;accueil
        </label>
      </div>

      <div className="rounded-lg border border-brand-border bg-white p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-navy">
          Description et caractéristiques
        </h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-navy">Description</label>
            <textarea
              name="description"
              required
              rows={3}
              defaultValue={defaultValues?.description}
              className="w-full rounded-md border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-navy">
              Caractéristiques techniques (une par ligne, format &quot;Label: valeur&quot;)
            </label>
            <textarea
              name="specs"
              required
              rows={5}
              placeholder={"Écran : 6,1 pouces\nPuce : A18\nStockage : 128 Go"}
              defaultValue={defaultValues?.specs}
              className="w-full rounded-md border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue"
            />
          </div>
        </div>
      </div>

      {state?.error && (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-brand-red">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand-navy px-6 py-3 text-sm font-semibold text-white hover:bg-brand-blue disabled:opacity-60"
      >
        {pending ? "Enregistrement..." : submitLabel}
      </button>
    </form>
  );
}
