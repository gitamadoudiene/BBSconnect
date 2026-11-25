import Link from "next/link";
import clsx from "clsx";
import { SlidersHorizontal, X } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  BUDGETS,
  brandFilter,
  categoryFilter,
  fromPrice,
  parsePriceRange,
  productWithVariantsInclude,
  storefrontFilter,
  toProductCardData,
} from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";
import { SortSelect } from "@/components/store/SortSelect";

export const dynamic = "force-dynamic";

type Params = {
  categorie?: string;
  marque?: string;
  prix?: string;
  q?: string;
  tri?: string;
  deals?: string;
};

const KEYS = ["categorie", "marque", "prix", "q", "tri", "deals"] as const;

export default async function BoutiquePage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const price = parsePriceRange(params.prix);

  const [universes, brandRows] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null, active: true },
      orderBy: { position: "asc" },
      include: { children: { where: { active: true }, orderBy: { position: "asc" } } },
    }),
    prisma.product.findMany({
      where: storefrontFilter,
      distinct: ["brand"],
      select: { brand: true },
      orderBy: { brand: "asc" },
    }),
  ]);
  const brands = brandRows.map((b) => b.brand);

  const filters: Prisma.ProductWhereInput[] = [storefrontFilter, { variants: { some: {} } }];
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

  const raw = await prisma.product.findMany({
    where: { AND: filters },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    include: productWithVariantsInclude,
  });

  const products = raw
    .map((p) => ({ product: p, price: fromPrice(p) }))
    // Budget is matched on the entry price of the model.
    .filter(({ price: pr }) => !price || (pr >= price.min && (price.max === null || pr < price.max)))
    .sort((a, b) => {
      if (params.tri === "price-asc") return a.price - b.price;
      if (params.tri === "price-desc") return b.price - a.price;
      if (params.tri === "new") return b.product.createdAt.getTime() - a.product.createdAt.getTime();
      return 0;
    });

  const allCategories = universes.flatMap((u) => [u, ...u.children]);
  const activeCategory = allCategories.find((c) => c.slug === params.categorie);
  const activeUniverse =
    universes.find((u) => u.slug === params.categorie) ??
    universes.find((u) => u.children.some((c) => c.slug === params.categorie));
  const seriesSource = activeUniverse ?? universes.find((u) => u.slug === "smartphones");
  const activeBrand = brands.find((b) => b.toLowerCase() === params.marque?.toLowerCase());
  const activeBudget = BUDGETS.find((b) => b.key === params.prix);

  /** URL with the current filters, some keys overridden (undefined removes). */
  function hrefWith(overrides: Partial<Record<(typeof KEYS)[number], string | undefined>>) {
    const next = new URLSearchParams();
    for (const k of KEYS) {
      const v = k in overrides ? overrides[k] : params[k];
      if (v) next.set(k, v);
    }
    const qs = next.toString();
    return qs ? `/boutique?${qs}` : "/boutique";
  }

  const brandTitles: Record<string, string> = { Apple: "iPhone", Samsung: "Samsung Galaxy", Google: "Google Pixel" };
  const isSeries = !!activeCategory && activeCategory.parentId !== null;
  const title = params.deals
    ? "Offres du moment"
    : params.q
      ? `« ${params.q} »`
      : isSeries
        ? activeCategory!.name
        : activeBrand
          ? (brandTitles[activeBrand] ?? activeBrand)
          : (activeCategory?.name ?? "Tous nos produits");

  const activeFilters = [
    activeCategory && { label: activeCategory.name, href: hrefWith({ categorie: undefined }) },
    activeBrand && { label: activeBrand, href: hrefWith({ marque: undefined }) },
    activeBudget && { label: activeBudget.label, href: hrefWith({ prix: undefined }) },
    params.deals && { label: "Offres", href: hrefWith({ deals: undefined }) },
    params.q && { label: `« ${params.q} »`, href: hrefWith({ q: undefined }) },
  ].filter(Boolean) as { label: string; href: string }[];

  const filterPanel = (
    <div className="space-y-8">
      <FilterGroup title="Univers">
        <FilterLink href={hrefWith({ categorie: undefined })} active={!params.categorie}>
          Tout
        </FilterLink>
        {universes.map((u) => (
          <FilterLink key={u.id} href={hrefWith({ categorie: u.slug })} active={activeUniverse?.id === u.id && params.categorie === u.slug}>
            {u.name}
          </FilterLink>
        ))}
      </FilterGroup>

      {seriesSource && seriesSource.children.length > 0 && (
        <FilterGroup title="Gamme">
          {seriesSource.children.map((c) => (
            <FilterLink
              key={c.id}
              href={hrefWith({ categorie: params.categorie === c.slug ? seriesSource.slug : c.slug })}
              active={params.categorie === c.slug}
            >
              {c.name}
            </FilterLink>
          ))}
        </FilterGroup>
      )}

      {brands.length > 1 && (
        <FilterGroup title="Marque">
          {brands.map((b) => (
            <FilterLink
              key={b}
              href={hrefWith({ marque: activeBrand === b ? undefined : b.toLowerCase() })}
              active={activeBrand === b}
            >
              {b}
            </FilterLink>
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Budget (F CFA)">
        {BUDGETS.map((b) => (
          <FilterLink
            key={b.key}
            href={hrefWith({ prix: activeBudget?.key === b.key ? undefined : b.key })}
            active={activeBudget?.key === b.key}
          >
            {b.label}
          </FilterLink>
        ))}
      </FilterGroup>

      <FilterGroup title="Prix barrés">
        <FilterLink href={hrefWith({ deals: params.deals ? undefined : "1" })} active={!!params.deals}>
          Offres uniquement
        </FilterLink>
      </FilterGroup>
    </div>
  );

  return (
    <div>
      <div className="border-b border-line">
        <div className="container-page pb-8 pt-8 lg:pb-12 lg:pt-12">
          <nav aria-label="Fil d'Ariane" className="font-mono text-[11.5px] text-slate">
            <Link href="/" className="hover:text-ink">
              Accueil
            </Link>
            <span className="mx-2">/</span>
            <Link href="/boutique" className="hover:text-ink">
              Boutique
            </Link>
            {activeCategory && (
              <>
                <span className="mx-2">/</span>
                <span className="text-ink">{activeCategory.name}</span>
              </>
            )}
          </nav>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <h1 className="text-h1 text-ink">{title}</h1>
            <p className="tabular font-mono text-[12.5px] text-slate">
              {products.length} modèle{products.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="container-page grid grid-cols-1 gap-10 py-8 lg:grid-cols-[220px_1fr] lg:gap-14 lg:py-12">
        {/* Desktop filters */}
        <aside className="hidden lg:block" aria-label="Filtres">
          <div className="sticky top-32">{filterPanel}</div>
        </aside>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Mobile filters */}
            <details className="group lg:hidden">
              <summary className="btn btn-secondary btn-sm cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <SlidersHorizontal className="h-4 w-4" /> Filtres
                {activeFilters.length > 0 && (
                  <span className="tabular font-mono text-[11px] text-slate">{activeFilters.length}</span>
                )}
              </summary>
              <div className="mt-4 rounded-[20px] border border-line p-5">{filterPanel}</div>
            </details>

            <div className="rail flex flex-1 gap-2 overflow-x-auto">
              {activeFilters.map((f) => (
                <Link key={f.label} href={f.href} className="chip chip-active" aria-label={`Retirer le filtre ${f.label}`}>
                  {f.label} <X className="h-3.5 w-3.5" />
                </Link>
              ))}
              {activeFilters.length > 1 && (
                <Link href="/boutique" className="chip">
                  Tout effacer
                </Link>
              )}
            </div>

            <SortSelect />
          </div>

          {products.length === 0 ? (
            <div className="mt-8 rounded-[24px] border border-dashed border-line-strong p-12 text-center">
              <p className="text-[17px] font-semibold text-ink">Aucun modèle ne correspond.</p>
              <p className="mt-2 text-[14.5px] text-slate">
                Retirez un filtre, ou demandez-nous directement : nous trouvons souvent le modèle.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/boutique" className="btn btn-secondary btn-sm">
                  Voir tout le catalogue
                </Link>
                <a href="https://wa.me/221788379919" target="_blank" rel="noopener noreferrer" className="btn btn-accent btn-sm">
                  Demander sur WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6 xl:grid-cols-3 2xl:grid-cols-4">
              {products.map(({ product }, i) => (
                <ProductCard key={product.id} product={toProductCardData(product)} priority={i < 3} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-slate">{title}</p>
      <ul className="mt-3 space-y-0.5">{children}</ul>
    </div>
  );
}

function FilterLink({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "true" : undefined}
        className={clsx(
          "flex items-center justify-between rounded-lg py-1.5 text-[14.5px] transition-colors",
          active ? "font-semibold text-ink" : "text-ink-soft hover:text-ink"
        )}
      >
        {children}
        {active && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
      </Link>
    </li>
  );
}
