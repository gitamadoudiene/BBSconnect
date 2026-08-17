"use client";

import { useActionState, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { ProductFormState } from "@/actions/products";

type Category = { id: string; name: string };

type VariantRow = {
  key: string;
  id?: string;
  sku: string;
  colorName: string;
  colorHex: string;
  storage: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  imagesText: string;
};

type DefaultVariant = {
  id: string;
  sku: string;
  colorName: string;
  colorHex: string;
  storage: string | null;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  images: { url: string }[];
};

type DefaultValues = {
  name?: string;
  categoryId?: string;
  description?: string;
  specs?: string;
  featured?: boolean;
  variants?: DefaultVariant[];
};

let keyCounter = 0;
function newKey() {
  keyCounter += 1;
  return `new-${keyCounter}`;
}

function emptyVariant(): VariantRow {
  return {
    key: newKey(),
    sku: "",
    colorName: "",
    colorHex: "#1d1d1f",
    storage: "",
    price: "",
    compareAtPrice: "",
    stock: "0",
    imagesText: "",
  };
}

function fromDefault(v: DefaultVariant): VariantRow {
  return {
    key: v.id,
    id: v.id,
    sku: v.sku,
    colorName: v.colorName,
    colorHex: v.colorHex,
    storage: v.storage ?? "",
    price: String(v.price),
    compareAtPrice: v.compareAtPrice != null ? String(v.compareAtPrice) : "",
    stock: String(v.stock),
    imagesText: v.images.map((i) => i.url).join("\n"),
  };
}

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
  const [variants, setVariants] = useState<VariantRow[]>(() =>
    defaultValues?.variants && defaultValues.variants.length > 0
      ? defaultValues.variants.map(fromDefault)
      : [emptyVariant()]
  );

  const variantsJson = useMemo(
    () =>
      JSON.stringify(
        variants.map((v) => ({
          id: v.id,
          sku: v.sku,
          colorName: v.colorName,
          colorHex: v.colorHex,
          storage: v.storage || undefined,
          price: Number(v.price) || 0,
          compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
          stock: Number(v.stock) || 0,
          images: v.imagesText
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        }))
      ),
    [variants]
  );

  function updateVariant(key: string, patch: Partial<VariantRow>) {
    setVariants((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function addVariant() {
    setVariants((rows) => [...rows, emptyVariant()]);
  }

  function removeVariant(key: string) {
    setVariants((rows) => (rows.length > 1 ? rows.filter((r) => r.key !== key) : rows));
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="variants" value={variantsJson} />

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
          <label className="flex items-center gap-2 self-end text-sm text-brand-navy">
            <input type="checkbox" name="featured" defaultChecked={defaultValues?.featured} className="accent-brand-blue" />
            Mettre en avant sur la page d&apos;accueil
          </label>
        </div>
      </div>

      <div className="rounded-lg border border-brand-border bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-navy">
            Variantes (couleur / stockage)
          </h2>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-1.5 rounded-md border border-brand-border px-3 py-1.5 text-xs font-semibold text-brand-navy hover:border-brand-blue hover:text-brand-blue"
          >
            <Plus className="h-3.5 w-3.5" /> Ajouter une variante
          </button>
        </div>

        <div className="space-y-5">
          {variants.map((v, i) => (
            <div key={v.key} className="rounded-md border border-brand-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-brand-navy/50">Variante {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeVariant(v.key)}
                  disabled={variants.length === 1}
                  className="text-brand-navy/40 hover:text-brand-red disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Supprimer la variante"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="mb-1 block text-xs font-medium text-brand-navy">SKU</label>
                  <input
                    required
                    value={v.sku}
                    onChange={(e) => updateVariant(v.key, { sku: e.target.value })}
                    className="w-full rounded-md border border-brand-border px-2.5 py-1.5 text-sm outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-brand-navy">Couleur</label>
                  <input
                    required
                    placeholder="ex: Bleu intense"
                    value={v.colorName}
                    onChange={(e) => updateVariant(v.key, { colorName: e.target.value })}
                    className="w-full rounded-md border border-brand-border px-2.5 py-1.5 text-sm outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-brand-navy">Teinte</label>
                  <input
                    type="color"
                    value={v.colorHex}
                    onChange={(e) => updateVariant(v.key, { colorHex: e.target.value })}
                    className="h-9 w-full cursor-pointer rounded-md border border-brand-border"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-brand-navy">Stockage</label>
                  <input
                    placeholder="ex: 256 Go"
                    value={v.storage}
                    onChange={(e) => updateVariant(v.key, { storage: e.target.value })}
                    className="w-full rounded-md border border-brand-border px-2.5 py-1.5 text-sm outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-brand-navy">Prix (FCFA)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={v.price}
                    onChange={(e) => updateVariant(v.key, { price: e.target.value })}
                    className="w-full rounded-md border border-brand-border px-2.5 py-1.5 text-sm outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-brand-navy">Prix barré</label>
                  <input
                    type="number"
                    min={0}
                    value={v.compareAtPrice}
                    onChange={(e) => updateVariant(v.key, { compareAtPrice: e.target.value })}
                    className="w-full rounded-md border border-brand-border px-2.5 py-1.5 text-sm outline-none focus:border-brand-blue"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-brand-navy">Stock</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={v.stock}
                    onChange={(e) => updateVariant(v.key, { stock: e.target.value })}
                    className="w-full rounded-md border border-brand-border px-2.5 py-1.5 text-sm outline-none focus:border-brand-blue"
                  />
                </div>
                <div className="col-span-2 sm:col-span-4">
                  <label className="mb-1 block text-xs font-medium text-brand-navy">
                    Images (une URL par ligne — la première est l&apos;image principale)
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={v.imagesText}
                    onChange={(e) => updateVariant(v.key, { imagesText: e.target.value })}
                    placeholder={"https://...\nhttps://..."}
                    className="w-full rounded-md border border-brand-border px-2.5 py-1.5 text-sm outline-none focus:border-brand-blue"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
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
              placeholder={"Écran : 6,1 pouces\nPuce : A18\nAppareil photo : Double 48 Mpx"}
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
