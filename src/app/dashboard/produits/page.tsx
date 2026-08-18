import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ImageOff, Package, Plus, Search, XCircle } from "lucide-react";
import clsx from "clsx";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/format";
import { ProductRowActions } from "@/components/dashboard/ProductRowActions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  categorie?: string;
  stock?: string;
  statut?: string;
  error?: string;
  deleted?: string;
  created?: string;
  updated?: string;
  duplicated?: string;
  archived?: string;
}>;

const statusLabels: Record<string, string> = { DRAFT: "Brouillon", PUBLISHED: "Publié", ARCHIVED: "Archivé" };
const statusStyles: Record<string, string> = {
  DRAFT: "bg-db-bg text-db-muted",
  PUBLISHED: "bg-db-success-tint text-db-success",
  ARCHIVED: "bg-db-warning-tint text-db-warning",
};

export default async function DashboardProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const categories = await prisma.category.findMany({ orderBy: { position: "asc" } });

  const where: Prisma.ProductWhereInput = {};
  if (params.q) where.name = { contains: params.q };
  if (params.categorie) where.categoryId = params.categorie;
  if (params.statut) where.status = params.statut as Prisma.EnumProductStatusFilter["equals"];
  if (params.stock === "low") where.variants = { some: { stock: { gt: 0, lte: 5 } } };
  if (params.stock === "out") where.variants = { some: { stock: { lte: 0 } } };

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      variants: { orderBy: { position: "asc" }, include: { images: { orderBy: { position: "asc" } } } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const totalCount = await prisma.product.count();
  const hasFilters = Boolean(params.q || params.categorie || params.stock || params.statut);

  const banner =
    params.deleted ? { icon: CheckCircle2, text: "Produit supprimé avec succès.", tone: "success" as const } :
    params.created ? { icon: CheckCircle2, text: "Produit créé avec succès.", tone: "success" as const } :
    params.updated ? { icon: CheckCircle2, text: "Produit mis à jour avec succès.", tone: "success" as const } :
    params.duplicated ? { icon: CheckCircle2, text: "Produit dupliqué avec succès.", tone: "success" as const } :
    params.archived ? { icon: CheckCircle2, text: "Produit archivé.", tone: "success" as const } :
    params.error === "has-orders" ? { icon: XCircle, text: "Impossible de supprimer ce produit : il fait partie de commandes existantes.", tone: "danger" as const } :
    null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold text-db-text">Produits</h1>
          <p className="text-[13px] text-db-muted">{totalCount} produit{totalCount > 1 ? "s" : ""} au catalogue</p>
        </div>
        <Link
          href="/dashboard/produits/nouveau"
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-accent-deep"
        >
          <Plus className="h-4 w-4" /> Ajouter un produit
        </Link>
      </div>

      {banner && (
        <div
          className={clsx(
            "mb-4 flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-[13px]",
            banner.tone === "success" ? "border-db-success/20 bg-db-success-tint text-db-success" : "border-db-danger/20 bg-db-danger-tint text-db-danger"
          )}
        >
          <banner.icon className="h-4 w-4 shrink-0" />
          {banner.text}
        </div>
      )}

      <form className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-db-muted" />
          <input
            type="search"
            name="q"
            defaultValue={params.q}
            placeholder="Rechercher un produit…"
            className="w-64 rounded-lg border border-db-border py-2 pl-9 pr-3 text-[13px] outline-none focus:border-accent"
          />
        </div>
        <select
          name="categorie"
          defaultValue={params.categorie}
          className="rounded-lg border border-db-border px-3 py-2 text-[13px] text-db-text outline-none focus:border-accent"
        >
          <option value="">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          name="stock"
          defaultValue={params.stock}
          className="rounded-lg border border-db-border px-3 py-2 text-[13px] text-db-text outline-none focus:border-accent"
        >
          <option value="">Tout stock</option>
          <option value="low">Stock faible</option>
          <option value="out">Rupture</option>
        </select>
        <select
          name="statut"
          defaultValue={params.statut}
          className="rounded-lg border border-db-border px-3 py-2 text-[13px] text-db-text outline-none focus:border-accent"
        >
          <option value="">Tout statut</option>
          <option value="DRAFT">Brouillon</option>
          <option value="PUBLISHED">Publié</option>
          <option value="ARCHIVED">Archivé</option>
        </select>
        <button type="submit" className="rounded-lg border border-db-border px-3.5 py-2 text-[13px] font-medium text-db-text transition hover:border-ink">
          Filtrer
        </button>
        {hasFilters && (
          <Link href="/dashboard/produits" className="text-[12.5px] font-medium text-db-muted hover:text-db-text">
            Réinitialiser
          </Link>
        )}
      </form>

      <div className="overflow-hidden rounded-xl border border-db-border bg-db-card">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            {hasFilters ? (
              <>
                <Search className="mb-3 h-9 w-9 text-db-muted" strokeWidth={1.5} />
                <p className="text-[14px] font-medium text-db-text">Aucun produit ne correspond à ces filtres</p>
                <Link href="/dashboard/produits" className="mt-3 text-[13px] font-semibold text-accent hover:underline">
                  Réinitialiser les filtres
                </Link>
              </>
            ) : (
              <>
                <Package className="mb-3 h-9 w-9 text-db-muted" strokeWidth={1.5} />
                <p className="text-[14px] font-medium text-db-text">Votre catalogue est encore vide</p>
                <p className="mt-1 text-[13px] text-db-muted">Ajoutez votre premier produit pour commencer à vendre.</p>
                <Link
                  href="/dashboard/produits/nouveau"
                  className="mt-4 rounded-lg bg-accent px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-accent-deep"
                >
                  Ajouter mon premier produit
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-db-border bg-db-bg text-left text-[11px] uppercase tracking-wide text-db-muted">
                  <th className="p-3">Produit</th>
                  <th className="p-3">Catégorie</th>
                  <th className="p-3">Prix</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3">Modifié</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const prices = p.variants.map((v) => v.price);
                  const minPrice = Math.min(...prices);
                  const maxPrice = Math.max(...prices);
                  const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
                  const outOfStock = totalStock === 0;
                  const lowStock = !outOfStock && p.variants.some((v) => v.stock > 0 && v.stock <= 5);
                  const primaryImage =
                    p.variants[0]?.images.find((i) => i.type === "PRIMARY")?.url ?? p.variants[0]?.images[0]?.url;

                  return (
                    <tr key={p.id} className="border-b border-db-border/70 last:border-0 hover:bg-db-bg/50">
                      <td className="p-3">
                        <Link href={`/dashboard/produits/${p.id}`} className="flex items-center gap-3">
                          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-db-bg">
                            {primaryImage ? (
                              <Image src={primaryImage} alt={p.name} fill sizes="44px" className="object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ImageOff className="h-4 w-4 text-db-muted" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="line-clamp-1 font-medium text-db-text">{p.name}</p>
                            <p className="text-[11.5px] text-db-muted">{p.variants.length} variante{p.variants.length > 1 ? "s" : ""}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="p-3 text-db-muted">{p.category.name}</td>
                      <td className="p-3 font-medium text-db-text">
                        {minPrice === maxPrice ? formatFCFA(minPrice) : `${formatFCFA(minPrice)} – ${formatFCFA(maxPrice)}`}
                      </td>
                      <td className="p-3">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-1.5 text-[12.5px] font-medium",
                            outOfStock ? "text-db-danger" : lowStock ? "text-db-warning" : "text-db-text"
                          )}
                        >
                          <span className={clsx("h-1.5 w-1.5 rounded-full", outOfStock ? "bg-db-danger" : lowStock ? "bg-db-warning" : "bg-db-success")} />
                          {totalStock}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={clsx("rounded-full px-2.5 py-1 text-[11px] font-semibold", statusStyles[p.status])}>
                          {statusLabels[p.status]}
                        </span>
                      </td>
                      <td className="p-3 text-[12px] text-db-muted">
                        {new Date(p.updatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                      </td>
                      <td className="p-3 text-right">
                        <ProductRowActions id={p.id} slug={p.slug} archived={p.status === "ARCHIVED"} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
