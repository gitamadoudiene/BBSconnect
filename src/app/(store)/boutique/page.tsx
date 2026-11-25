import Link from "next/link";
import clsx from "clsx";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  brandFilter,
  categoryFilter,
  fromPrice,
  productWithVariantsInclude,
  publishedFilter,
  toProductCardData,
} from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";
import { SortSelect } from "@/components/store/SortSelect";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  categorie?: string;
  marque?: string;
  q?: string;
  tri?: string;
  deals?: string;
}>;

export default async function BoutiquePage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const [universes, brandRows] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null, active: true },
      orderBy: { position: "asc" },
      include: { children: { where: { active: true }, orderBy: { position: "asc" } } },
    }),
    prisma.product.findMany({
      where: publishedFilter,
      distinct: ["brand"],
      select: { brand: true },
      orderBy: { brand: "asc" },
    }),
  ]);
  const brands = brandRows.map((b) => b.brand);

  const filters: Prisma.ProductWhereInput[] = [publishedFilter];
  if (params.categorie) filters.push(categoryFilter(params.categorie));
  if (params.marque) filters.push(brandFilter(params.marque));
  if (params.q) {
    filters.push({
      OR: [
        { name: { contains: params.q, mode: "insensitive" } },
        { brand: { contains: params.q, mode: "insensitive" } },
        { category: { name: { contains: params.q, mode: "insensitive" } } },
      ],
    });
  }
  if (params.deals) filters.push({ variants: { some: { compareAtPrice: { not: null } } } });
  const where: Prisma.ProductWhereInput = { AND: filters };

  const rawProducts = await prisma.product.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: productWithVariantsInclude,
  });

  const products = rawProducts
    .map((p) => ({ product: p, card: toProductCardData(p), price: fromPrice(p) }))
    .sort((a, b) => {
      if (params.tri === "price-asc") return a.price - b.price;
      if (params.tri === "price-desc") return b.price - a.price;
      return 0;
    });

  const allCategories = universes.flatMap((u) => [u, ...u.children]);
  const activeCategory = allCategories.find((c) => c.slug === params.categorie);
  const activeUniverse =
    universes.find((u) => u.slug === params.categorie) ??
    universes.find((u) => u.children.some((c) => c.slug === params.categorie));
  const activeBrand = brands.find((b) => b.toLowerCase() === params.marque?.toLowerCase());

  /** Builds a /boutique URL from the current filters with some keys overridden. */
  function hrefWith(overrides: Partial<Record<"categorie" | "marque" | "deals", string | undefined>>) {
    const next = new URLSearchParams();
    const merged = { categorie: params.categorie, marque: params.marque, deals: params.deals, tri: params.tri, ...overrides };
    for (const [k, v] of Object.entries(merged)) if (v) next.set(k, v);
    const qs = next.toString();
    return qs ? `/boutique?${qs}` : "/boutique";
  }

  const pill = (active: boolean) =>
    clsx(
      "shrink-0 rounded-full border px-4 py-2 text-[13.5px] font-medium transition",
      active ? "border-ink bg-ink text-white" : "border-line text-ink hover:border-ink"
    );

  const title = params.deals
    ? "Nos offres"
    : [activeBrand, activeCategory?.name].filter(Boolean).join(" · ") || "Toute la tech";

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
          <h1 className="text-[clamp(2.25rem,4vw,4rem)] font-extrabold leading-[1] tracking-[-0.035em] text-ink">
            {title}
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-slate">
            Explorez notre sélection
            {params.q ? ` pour « ${params.q} »` : ""} — {products.length} produit
            {products.length > 1 ? "s" : ""} disponible{products.length > 1 ? "s" : ""}.
          </p>
        </div>
      </div>

      <div className="container-page py-10 lg:py-14">
        <div className="flex flex-col gap-4 border-b border-line pb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="rail flex items-center gap-2 overflow-x-auto">
              <Link href={hrefWith({ categorie: undefined, deals: undefined })} className={pill(!params.categorie && !params.deals)}>
                Tout
              </Link>
              <Link href={hrefWith({ deals: params.deals ? undefined : "1" })} className={pill(!!params.deals)}>
                Offres
              </Link>
              {universes.map((u) => (
                <Link key={u.id} href={hrefWith({ categorie: u.slug })} className={pill(activeUniverse?.id === u.id)}>
                  {u.name}
                </Link>
              ))}
            </div>
            <SortSelect />
          </div>

          {activeUniverse && activeUniverse.children.length > 0 && (
            <div className="rail flex items-center gap-2 overflow-x-auto">
              <span className="mr-1 shrink-0 text-[12px] font-semibold uppercase tracking-wider text-slate">Gamme</span>
              {activeUniverse.children.map((c) => (
                <Link
                  key={c.id}
                  href={hrefWith({ categorie: params.categorie === c.slug ? activeUniverse.slug : c.slug })}
                  className={clsx(
                    "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition",
                    params.categorie === c.slug ? "bg-accent text-white" : "bg-mist text-ink hover:bg-line"
                  )}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          {brands.length > 1 && (
            <div className="rail flex items-center gap-2 overflow-x-auto">
              <span className="mr-1 shrink-0 text-[12px] font-semibold uppercase tracking-wider text-slate">Marque</span>
              {brands.map((b) => {
                const on = activeBrand === b;
                return (
                  <Link
                    key={b}
                    href={hrefWith({ marque: on ? undefined : b.toLowerCase() })}
                    className={clsx(
                      "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition",
                      on ? "bg-accent text-white" : "bg-mist text-ink hover:bg-line"
                    )}
                  >
                    {b}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {products.length === 0 ? (
          <div className="mt-16 rounded-2xl border border-dashed border-line p-16 text-center text-slate">
            Aucun produit ne correspond à votre recherche.
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-3 lg:gap-x-10 xl:grid-cols-4">
            {products.map(({ product, card }) => (
              <ProductCard key={product.id} product={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
