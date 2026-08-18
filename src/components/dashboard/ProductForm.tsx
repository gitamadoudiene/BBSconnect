"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import clsx from "clsx";
import type { ProductFormState } from "@/actions/products";
import { ImageUploader, type UploaderImage } from "./ImageUploader";

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
  images: UploaderImage[];
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
  images: { url: string; type: string }[];
};

type DefaultValues = {
  name?: string;
  slug?: string;
  categoryId?: string;
  description?: string;
  specs?: string;
  featured?: boolean;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  tags?: string;
  seoTitle?: string;
  seoDescription?: string;
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
    images: [],
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
    images: v.images.map((i) => ({ key: i.url, url: i.url, isPrimary: i.type === "PRIMARY" })),
  };
}

export function ProductForm({
  categories,
  action,
  defaultValues,
  submitLabel,
  productSlug,
}: {
  categories: Category[];
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  defaultValues?: DefaultValues;
  submitLabel: string;
  /** Existing slug, used to link to the live storefront preview. Undefined for a brand-new product. */
  productSlug?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [variants, setVariants] = useState<VariantRow[]>(() =>
    defaultValues?.variants && defaultValues.variants.length > 0
      ? defaultValues.variants.map(fromDefault)
      : [emptyVariant()]
  );
  const [seoOpen, setSeoOpen] = useState(false);

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
          images: v.images.map((i) => ({ url: i.url, isPrimary: i.isPrimary })),
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

  const missingImages = variants.filter((v) => v.images.length === 0).length;

  return (
    <form action={formAction} className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
      <input type="hidden" name="variants" value={variantsJson} />

      <div className="space-y-6">
        <div className="rounded-xl border border-db-border bg-db-card p-6">
          <h2 className="mb-4 text-[13px] font-semibold text-db-text">Informations générales</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-[13px] font-medium text-db-text">Nom du produit *</label>
              <input
                name="name"
                required
                placeholder="ex : iPhone 17 Pro"
                defaultValue={defaultValues?.name}
                className="w-full rounded-lg border border-db-border px-3 py-2 text-[13.5px] outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-[13px] font-medium text-db-text">Description</label>
              <textarea
                name="description"
                required
                rows={3}
                placeholder="Description commerciale affichée sur la fiche produit"
                defaultValue={defaultValues?.description}
                className="w-full rounded-lg border border-db-border px-3 py-2 text-[13.5px] outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-[13px] font-medium text-db-text">
                Caractéristiques techniques (une par ligne, format &quot;Label : valeur&quot;)
              </label>
              <textarea
                name="specs"
                required
                rows={5}
                placeholder={"Écran : 6,1 pouces\nPuce : A18\nAppareil photo : Double 48 Mpx"}
                defaultValue={defaultValues?.specs}
                className="w-full rounded-lg border border-db-border px-3 py-2 text-[13.5px] outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-db-border bg-db-card p-6">
          <h2 className="mb-4 text-[13px] font-semibold text-db-text">Organisation</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[13px] font-medium text-db-text">Catégorie *</label>
              <select
                name="categoryId"
                required
                defaultValue={defaultValues?.categoryId}
                className="w-full rounded-lg border border-db-border px-3 py-2 text-[13.5px] outline-none focus:border-accent"
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
              <label className="mb-1 block text-[13px] font-medium text-db-text">Tags</label>
              <input
                name="tags"
                placeholder="ex : nouveauté, populaire"
                defaultValue={defaultValues?.tags}
                className="w-full rounded-lg border border-db-border px-3 py-2 text-[13.5px] outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-db-border bg-db-card p-6">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-db-text">Variantes</h2>
            <button
              type="button"
              onClick={addVariant}
              className="flex items-center gap-1.5 rounded-lg border border-db-border px-3 py-1.5 text-[12px] font-semibold text-db-text transition hover:border-accent hover:text-accent"
            >
              <Plus className="h-3.5 w-3.5" /> Ajouter une variante
            </button>
          </div>
          <p className="mb-4 text-[12.5px] text-db-muted">
            Chaque couleur / capacité a son propre SKU, prix, stock et ses propres photos.
          </p>

          <div className="space-y-5">
            {variants.map((v, i) => (
              <div key={v.key} className="rounded-lg border border-db-border p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-db-muted">
                    Variante {i + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeVariant(v.key)}
                    disabled={variants.length === 1}
                    className="text-db-muted hover:text-db-danger disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Supprimer la variante"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="mb-1 block text-[11.5px] font-medium text-db-text">SKU</label>
                    <input
                      required
                      value={v.sku}
                      onChange={(e) => updateVariant(v.key, { sku: e.target.value })}
                      className="w-full rounded-lg border border-db-border px-2.5 py-1.5 text-[13px] outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11.5px] font-medium text-db-text">Couleur</label>
                    <input
                      required
                      placeholder="ex : Bleu intense"
                      value={v.colorName}
                      onChange={(e) => updateVariant(v.key, { colorName: e.target.value })}
                      className="w-full rounded-lg border border-db-border px-2.5 py-1.5 text-[13px] outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11.5px] font-medium text-db-text">Teinte</label>
                    <input
                      type="color"
                      value={v.colorHex}
                      onChange={(e) => updateVariant(v.key, { colorHex: e.target.value })}
                      className="h-9 w-full cursor-pointer rounded-lg border border-db-border"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11.5px] font-medium text-db-text">Stockage</label>
                    <input
                      placeholder="ex : 256 Go"
                      value={v.storage}
                      onChange={(e) => updateVariant(v.key, { storage: e.target.value })}
                      className="w-full rounded-lg border border-db-border px-2.5 py-1.5 text-[13px] outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11.5px] font-medium text-db-text">Prix (FCFA) *</label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={v.price}
                      onChange={(e) => updateVariant(v.key, { price: e.target.value })}
                      className="w-full rounded-lg border border-db-border px-2.5 py-1.5 text-[13px] outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11.5px] font-medium text-db-text">Prix avant réduction</label>
                    <input
                      type="number"
                      min={0}
                      value={v.compareAtPrice}
                      onChange={(e) => updateVariant(v.key, { compareAtPrice: e.target.value })}
                      className="w-full rounded-lg border border-db-border px-2.5 py-1.5 text-[13px] outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11.5px] font-medium text-db-text">Stock *</label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={v.stock}
                      onChange={(e) => updateVariant(v.key, { stock: e.target.value })}
                      className="w-full rounded-lg border border-db-border px-2.5 py-1.5 text-[13px] outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div className="mt-4 border-t border-db-border pt-4">
                  <ImageUploader
                    images={v.images}
                    onChange={(images) => updateVariant(v.key, { images })}
                    label="Photos de cette variante"
                    hint="La première photo ajoutée devient l'image principale — vous pouvez en changer à tout moment."
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-db-border bg-db-card">
          <button
            type="button"
            onClick={() => setSeoOpen((v) => !v)}
            className="flex w-full items-center justify-between p-6 text-left"
          >
            <div>
              <h2 className="text-[13px] font-semibold text-db-text">SEO &amp; visibilité</h2>
              <p className="mt-0.5 text-[12px] text-db-muted">Titre et description pour les moteurs de recherche</p>
            </div>
            <ChevronDown className={clsx("h-4 w-4 text-db-muted transition-transform", seoOpen && "rotate-180")} />
          </button>
          {seoOpen && (
            <div className="space-y-4 border-t border-db-border p-6 pt-5">
              <div>
                <label className="mb-1 block text-[13px] font-medium text-db-text">Meta title</label>
                <input
                  name="seoTitle"
                  placeholder={defaultValues?.name || "Titre affiché dans les résultats de recherche"}
                  defaultValue={defaultValues?.seoTitle}
                  className="w-full rounded-lg border border-db-border px-3 py-2 text-[13.5px] outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-[13px] font-medium text-db-text">Meta description</label>
                <textarea
                  name="seoDescription"
                  rows={2}
                  placeholder="Résumé affiché sous le titre dans les résultats de recherche"
                  defaultValue={defaultValues?.seoDescription}
                  className="w-full rounded-lg border border-db-border px-3 py-2 text-[13.5px] outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-[13px] font-medium text-db-text">Slug (URL)</label>
                <input
                  name="slug"
                  placeholder="généré automatiquement à partir du nom si laissé vide"
                  defaultValue={defaultValues?.slug}
                  className="w-full rounded-lg border border-db-border px-3 py-2 text-[13.5px] outline-none focus:border-accent"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-xl border border-db-border bg-db-card p-5">
          <h3 className="mb-3 text-[13px] font-semibold text-db-text">Publication</h3>

          <label className="mb-1 block text-[12px] font-medium text-db-muted">Statut</label>
          <select
            name="status"
            defaultValue={defaultValues?.status ?? "PUBLISHED"}
            className="mb-4 w-full rounded-lg border border-db-border px-3 py-2 text-[13px] outline-none focus:border-accent"
          >
            <option value="DRAFT">Brouillon</option>
            <option value="PUBLISHED">Publié</option>
            <option value="ARCHIVED">Archivé</option>
          </select>

          <label className="flex items-center gap-2 text-[13px] text-db-text">
            <input type="checkbox" name="featured" defaultChecked={defaultValues?.featured} className="accent-accent" />
            Mettre en avant sur la homepage
          </label>

          {missingImages > 0 && (
            <p className="mt-3 rounded-lg bg-db-warning-tint px-3 py-2 text-[12px] text-db-warning">
              {missingImages} variante{missingImages > 1 ? "s" : ""} sans photo.
            </p>
          )}

          {state?.error && (
            <p className="mt-3 rounded-lg border border-db-danger/20 bg-db-danger-tint px-3 py-2 text-[12.5px] text-db-danger">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-4 w-full rounded-lg bg-accent py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-accent-deep disabled:opacity-60"
          >
            {pending ? "Enregistrement…" : submitLabel}
          </button>

          {productSlug && (
            <Link
              href={`/boutique/${productSlug}`}
              target="_blank"
              className="mt-2 block w-full rounded-lg border border-db-border py-2.5 text-center text-[13px] font-medium text-db-text transition hover:border-ink"
            >
              Aperçu sur la boutique ↗
            </Link>
          )}
        </div>
      </div>
    </form>
  );
}
