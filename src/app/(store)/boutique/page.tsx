import Link from "next/link";
import clsx from "clsx";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/ProductCard";
import { SortSelect } from "@/components/store/SortSelect";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  categorie?: string;
  q?: string;
  tri?: string;
  deals?: string;
}>;

export default async function BoutiquePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  const where: Prisma.ProductWhereInput = {};
  if (params.categorie) where.category = { slug: params.categorie };
  if (params.q) where.name = { contains: params.q };
  if (params.deals) where.compareAtPrice = { not: null };

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (params.tri === "price-asc") orderBy = { price: "asc" };
  if (params.tri === "price-desc") orderBy = { price: "desc" };
  if (params.tri === "new") orderBy = { createdAt: "desc" };

  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: { category: true },
  });

  const activeCategory = categories.find((c) => c.slug === params.categorie);

  return (
    <div>
      <div className="border-b border-line bg-paper">
        <div className="container-page py-14 lg:py-20">
          <nav className="mb-6 text-[13px] text-slate">
            <Link href="/" className="link-underline">Accueil</Link>
            <span className="mx-2">/</span>
            <span className="text-ink">Boutique</span>
            {activeCategory && (
              <>
                <span className="mx-2">/</span>
                <span className="text-ink">{activeCategory.name}</span>
              </>
            )}
          </nav>
          <h1 className="text-h1 text-ink">
            {params.deals ? "Nos offres" : activeCategory ? activeCategory.name : "Tous les iPhone"}
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate">
            Explorez notre sélection
            {params.q ? ` pour « ${params.q} »` : ""} — {products.length} produit
            {products.length > 1 ? "s" : ""} disponible{products.length > 1 ? "s" : ""}.
          </p>
        </div>
      </div>

      <div className="container-page py-10 lg:py-14">
        <div className="flex flex-col gap-6 border-b border-line pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto">
            <Link
              href="/boutique"
              className={clsx(
                "shrink-0 rounded-full border px-4 py-2 text-[13.5px] font-medium transition",
                !params.categorie && !params.deals
                  ? "border-ink bg-ink text-white"
                  : "border-line text-ink hover:border-ink"
              )}
            >
              Tous les produits
            </Link>
            <Link
              href="/boutique?deals=1"
              className={clsx(
                "shrink-0 rounded-full border px-4 py-2 text-[13.5px] font-medium transition",
                params.deals ? "border-ink bg-ink text-white" : "border-line text-ink hover:border-ink"
              )}
            >
              Offres
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/boutique?categorie=${cat.slug}`}
                className={clsx(
                  "shrink-0 rounded-full border px-4 py-2 text-[13.5px] font-medium transition",
                  params.categorie === cat.slug
                    ? "border-ink bg-ink text-white"
                    : "border-line text-ink hover:border-ink"
                )}
              >
                {cat.name}
              </Link>
            ))}
          </div>
          <SortSelect />
        </div>

        {products.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-dashed border-line p-16 text-center text-slate">
            Aucun produit ne correspond à votre recherche.
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-3 lg:gap-x-10 xl:grid-cols-4">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  name: p.name,
                  slug: p.slug,
                  price: p.price,
                  compareAtPrice: p.compareAtPrice,
                  color: p.color,
                  storage: p.storage,
                  stock: p.stock,
                  categoryName: p.category.name,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
