import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, ImageOff, Package, Plus, Search, XCircle } from "lucide-react";
import clsx from "clsx";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/format";
import { ProductRowActions } from "@/components/dashboard/ProductRowActions";
import { EmptyState, Notice, PageHeader } from "@/components/dashboard/ui";

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
  DRAFT: "bg-paper text-slate",
  PUBLISHED: "bg-db-success-tint text-db-success",
  ARCHIVED: "bg-signal-tint text-signal-deep",
};

export default async function DashboardProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const categories = await prisma.category.findMany({ orderBy: { position: "asc" } });

  const where: Prisma.ProductWhereInput = {};
  if (params.q) where.OR = [{ name: { contains: params.q, mode: "insensitive" } }, { brand: { contains: params.q, mode: "insensitive" } }];
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
      <PageHeader
        eyebrow="Catalogue"
        title={params.stock === "low" ? "Stock faible" : "Produits"}
        description={
          params.stock === "low"
            ? "Les produits dont au moins une variante passe sous 5 unités."
            : `${totalCount} produit${totalCount > 1 ? "s" : ""} au catalogue · téléphones et accessoires`
        }
      >
        <Link href="/dashboard/produits/nouveau" className="btn btn-primary btn-sm">
          <Plus className="h-4 w-4" /> Ajouter un produit
        </Link>
      </PageHeader>

      {banner && <Notice tone={banner.tone}>{banner.text}</Notice>}

      <form className="mb-4 flex flex-wrap items-center gap-2" role="search">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input
            type="search"
            name="q"
            defaultValue={params.q}
            placeholder="Rechercher un produit…"
            aria-label="Rechercher un produit"
            className="field field-sm w-64 pl-10"
          />
        </div>
        <select
          name="categorie"
          defaultValue={params.categorie}
          className="field field-sm w-auto"
        >
          <option value="">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          name="stock"
          defaultValue={params.stock}
          className="field field-sm w-auto"
        >
          <option value="">Tout stock</option>
          <option value="low">Stock faible</option>
          <option value="out">Rupture</option>
        </select>
        <select
          name="statut"
          defaultValue={params.statut}
          className="field field-sm w-auto"
        >
          <option value="">Tout statut</option>
          <option value="DRAFT">Brouillon</option>
          <option value="PUBLISHED">Publié</option>
          <option value="ARCHIVED">Archivé</option>
        </select>
        <button type="submit" className="btn btn-secondary btn-sm">
          Filtrer
        </button>
        {hasFilters && (
          <Link href="/dashboard/produits" className="text-[13px] font-medium text-slate underline-offset-4 hover:text-ink hover:underline">
            Réinitialiser
          </Link>
        )}
      </form>

      <div className="overflow-hidden db-card">
        {products.length === 0 ? (
          hasFilters ? (
            <EmptyState
              icon={Search}
              title="Aucun produit ne correspond à ces filtres"
              action={<Link href="/dashboard/produits" className="btn btn-secondary btn-sm">Réinitialiser les filtres</Link>}
            />
          ) : (
            <EmptyState
              icon={Package}
              title="Votre catalogue est encore vide"
              text="Ajoutez votre premier téléphone pour commencer à vendre."
              action={<Link href="/dashboard/produits/nouveau" className="btn btn-primary btn-sm"><Plus className="h-4 w-4" /> Ajouter un produit</Link>}
            />
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line bg-paper/60 text-left">
                  <th className="db-th px-4 py-3">Produit</th>
                  <th className="db-th px-4 py-3">Catégorie</th>
                  <th className="db-th px-4 py-3">Prix</th>
                  <th className="db-th px-4 py-3">Stock</th>
                  <th className="db-th px-4 py-3">Statut</th>
                  <th className="db-th px-4 py-3">Modifié</th>
                  <th className="db-th px-4 py-3 text-right">Actions</th>
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
                    <tr key={p.id} className="border-b border-line last:border-0 hover:bg-paper/50">
                      <td className="px-4 py-3.5">
                        <Link href={`/dashboard/produits/${p.id}`} className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[12px] bg-paper">
                            {primaryImage ? (
                              <Image src={primaryImage} alt={p.name} fill sizes="48px" className="object-contain p-1" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ImageOff className="h-4 w-4 text-db-muted" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="line-clamp-1 font-semibold tracking-[-0.01em] text-ink">{p.name}</p>
                            <p className="font-mono text-[11px] text-slate">{p.brand} · {p.variants.length} variante{p.variants.length > 1 ? "s" : ""}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-db-muted">{p.category.name}</td>
                      <td className="tabular whitespace-nowrap px-4 py-3.5 font-medium text-ink">
                        {minPrice === maxPrice ? formatFCFA(minPrice) : `${formatFCFA(minPrice)} – ${formatFCFA(maxPrice)}`}
                      </td>
                      <td className="px-4 py-3.5">
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
                      <td className="px-4 py-3.5">
                        <span className={clsx("badge", statusStyles[p.status])}>
                          {statusLabels[p.status]}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[11.5px] text-slate">
                        {new Date(p.updatedAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                      </td>
                      <td className="px-4 py-3.5 text-right">
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
