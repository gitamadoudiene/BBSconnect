import Link from "next/link";
import clsx from "clsx";
import { Check, SlidersHorizontal, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { expirePromotions } from "@/lib/promotions";
import { BUDGETS, fromPrice, parsePriceRange, productWithVariantsInclude, storefrontFilter, toProductCardData } from "@/lib/catalog";
import { COLOR_FAMILIES, colorFamily, type ColorFamily } from "@/lib/colors";
import { ANDROID_BRANDS, seriesBrand } from "@/lib/navigation";
import { formatFCFA } from "@/lib/format";
import { ProductCard } from "@/components/store/ProductCard";
import { SortSelect } from "@/components/store/SortSelect";

export const dynamic = "force-dynamic";

const KEYS = ["categorie", "marque", "os", "prix", "min", "max", "couleur", "q", "tri", "deals", "collection"] as const;
type Key = (typeof KEYS)[number];
type Params = Partial<Record<Key, string>>;

const brandTitles: Record<string, string> = { Apple: "iPhone", Samsung: "Samsung Galaxy", Google: "Google Pixel" };

/** Accent- and case-insensitive text match. */
function norm(v: string) {
  return v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export default async function BoutiquePage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  await expirePromotions();

  const [universes, all] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null, active: true },
      orderBy: { position: "asc" },
      include: { children: { where: { active: true }, orderBy: { position: "asc" } } },
    }),
    prisma.product.findMany({
      where: { AND: [storefrontFilter], variants: { some: {} } },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      include: {
        ...productWithVariantsInclude,
        category: { include: { parent: { select: { slug: true } } } },
        collections: { select: { collection: { select: { slug: true, active: true } } } },
      },
    }),
  ]);
  type P = (typeof all)[number];

  const collection = params.collection
    ? await prisma.collection.findFirst({ where: { slug: params.collection, active: true }, select: { name: true } })
    : null;

  /* ---------------------------------------------------------- filters --- */
  const colours = (params.couleur ?? "").split(",").filter((c): c is ColorFamily => COLOR_FAMILIES.some((f) => f.id === c));
  const band = parsePriceRange(params.prix);
  const min = params.min ? Number(params.min.replace(/\D/g, "")) || null : (band?.min ?? null);
  const max = params.max ? Number(params.max.replace(/\D/g, "")) || null : (band?.max ?? null);
  const q = params.q ? norm(params.q) : "";

  const familiesOf = (p: P) => new Set(p.variants.map((v) => colorFamily(v.colorHex, v.colorName)));
  const isAndroid = (p: P) => p.brand.toLowerCase() !== "apple";
  const isPhone = (p: P) => p.category.slug === "smartphones" || p.category.parent?.slug === "smartphones";
  const priceOf = (p: P) => fromPrice(p);
  const hasDeal = (p: P) => p.variants.some((v) => v.compareAtPrice && v.compareAtPrice > v.price);

  // Each filter is a predicate; a facet's counts apply every filter except its own.
  const preds = {
    categorie: (p: P) => !params.categorie || p.category.slug === params.categorie || p.category.parent?.slug === params.categorie,
    marque: (p: P) => !params.marque || p.brand.toLowerCase() === params.marque.toLowerCase(),
    os: (p: P) => params.os !== "android" || isAndroid(p),
    prix: (p: P) => (min === null || priceOf(p) >= min) && (max === null || priceOf(p) <= max),
    couleur: (p: P) => colours.length === 0 || colours.some((c) => familiesOf(p).has(c)),
    q: (p: P) => !q || norm(`${p.name} ${p.brand} ${p.category.name}`).includes(q),
    deals: (p: P) => !params.deals || hasDeal(p),
    collection: (p: P) =>
      !params.collection || p.collections.some((c) => c.collection.active && c.collection.slug === params.collection),
  };
  type Facet = keyof typeof preds;
  const passes = (p: P, except?: Facet) => (Object.keys(preds) as Facet[]).every((k) => k === except || preds[k](p));
  const countWhere = (except: Facet, extra: (p: P) => boolean) => all.filter((p) => passes(p, except) && extra(p)).length;

  const products = all
    .filter((p) => passes(p))
    .sort((a, b) => {
      if (params.tri === "price-asc") return priceOf(a) - priceOf(b);
      if (params.tri === "price-desc") return priceOf(b) - priceOf(a);
      if (params.tri === "new") return b.createdAt.getTime() - a.createdAt.getTime();
      return 0;
    });

  /* ----------------------------------------------------------- context --- */
  const allCategories = universes.flatMap((u) => [u, ...u.children]);
  const activeCategory = allCategories.find((c) => c.slug === params.categorie);
  const activeUniverse =
    universes.find((u) => u.slug === params.categorie) ??
    universes.find((u) => u.children.some((c) => c.slug === params.categorie));
  const brands = [...new Set(all.filter((p) => passes(p, "marque")).map((p) => p.brand))].sort();
  const activeBrand = all.find((p) => p.brand.toLowerCase() === params.marque?.toLowerCase())?.brand ?? params.marque;
  const activeBand = BUDGETS.find((b) => b.key === params.prix);
  const customPrice = !!(params.min || params.max);

  function hrefWith(overrides: Partial<Record<Key, string | undefined>>) {
    const next = new URLSearchParams();
    for (const k of KEYS) {
      const v = k in overrides ? overrides[k] : params[k];
      if (v) next.set(k, v);
    }
    const qs = next.toString();
    return qs ? `/boutique?${qs}` : "/boutique";
  }
  const toggleColour = (c: ColorFamily) => {
    const set = colours.includes(c) ? colours.filter((x) => x !== c) : [...colours, c];
    return hrefWith({ couleur: set.length ? set.join(",") : undefined });
  };

  const isSeries = !!activeCategory && activeCategory.parentId !== null;
  const title = collection
    ? collection.name
    : params.deals
      ? "Offres du moment"
      : params.q && isSeries
        ? `${activeCategory!.name} ${params.q}`
        : params.q
          ? `« ${params.q} »`
          : isSeries
            ? activeCategory!.name
            : activeBrand && params.marque
              ? (brandTitles[activeBrand] ?? activeBrand)
              : params.os === "android"
                ? "Téléphones Android"
                : (activeCategory?.name ?? "Tous nos produits");

  const activeFilters = [
    activeCategory && { label: activeCategory.name, href: hrefWith({ categorie: undefined }) },
    params.os === "android" && { label: "Android", href: hrefWith({ os: undefined }) },
    params.marque && { label: activeBrand ?? params.marque, href: hrefWith({ marque: undefined }) },
    activeBand && !customPrice && { label: activeBand.label, href: hrefWith({ prix: undefined }) },
    customPrice && {
      label: `${params.min ? formatFCFA(Number(params.min)) : "0"} – ${params.max ? formatFCFA(Number(params.max)) : "…"}`,
      href: hrefWith({ min: undefined, max: undefined }),
    },
    ...colours.map((c) => ({ label: COLOR_FAMILIES.find((f) => f.id === c)!.label, href: toggleColour(c) })),
    params.deals && { label: "Offres", href: hrefWith({ deals: undefined }) },
    collection && { label: collection.name, href: hrefWith({ collection: undefined }) },
    params.q && { label: `« ${params.q} »`, href: hrefWith({ q: undefined }) },
  ].filter(Boolean) as { label: string; href: string }[];

  /* --------------------------------------------- sub-category groups --- */
  // Phones: ranges grouped by brand (iPhone first, then Android brands). Accessories: flat list.
  const phonesUniverse = universes.find((u) => u.slug === "smartphones");
  const accessoryUniverse = universes.find((u) => u.slug === "accessoires");
  const showPhones = !activeUniverse || activeUniverse.slug === "smartphones";
  const showAccessories = !activeUniverse || activeUniverse.slug === "accessoires";
  const rangeGroups: { title: string; parentSlug: string; items: { id: string; slug: string; name: string }[] }[] = [];
  if (showPhones && phonesUniverse) {
    const order = ["Apple", ...ANDROID_BRANDS] as string[];
    const rank = (b: string) => (order.includes(b) ? order.indexOf(b) : order.length);
    const byBrand = new Map<string, { id: string; slug: string; name: string }[]>();
    for (const c of phonesUniverse.children) {
      const b = seriesBrand(c) ?? "Autres";
      if (params.os === "android" && b === "Apple") continue;
      byBrand.set(b, [...(byBrand.get(b) ?? []), c]);
    }
    for (const [b, items] of [...byBrand].sort((x, y) => rank(x[0]) - rank(y[0]))) {
      rangeGroups.push({ title: b === "Apple" ? "iPhone" : (brandTitles[b] ?? b), parentSlug: phonesUniverse.slug, items });
    }
  }
  if (showAccessories && accessoryUniverse && accessoryUniverse.children.length) {
    rangeGroups.push({ title: "Accessoires", parentSlug: accessoryUniverse.slug, items: accessoryUniverse.children });
  }

  const filterPanel = (
    <div className="space-y-8">
      <FilterGroup title="Univers">
        <FilterLink href={hrefWith({ categorie: undefined, os: undefined })} active={!params.categorie && !params.os}>
          Tout
        </FilterLink>
        {universes.map((u) => (
          <FilterLink
            key={u.id}
            href={hrefWith({ categorie: u.slug, os: u.slug === "smartphones" ? params.os : undefined })}
            active={params.categorie === u.slug}
            count={countWhere("categorie", (p) => p.category.slug === u.slug || p.category.parent?.slug === u.slug)}
          >
            {u.name}
          </FilterLink>
        ))}
      </FilterGroup>

      {showPhones && (
        <FilterGroup title="Système">
          <FilterLink
            href={hrefWith({ marque: params.marque === "apple" ? undefined : "apple", os: undefined })}
            active={params.marque === "apple"}
            count={countWhere("marque", (p) => p.brand === "Apple" && isPhone(p) && preds.os(p))}
          >
            iPhone (iOS)
          </FilterLink>
          <FilterLink
            href={hrefWith({
              os: params.os === "android" ? undefined : "android",
              marque: params.marque === "apple" ? undefined : params.marque,
              categorie: params.categorie ?? "smartphones",
            })}
            active={params.os === "android"}
            count={countWhere("os", (p) => isAndroid(p) && isPhone(p))}
          >
            Android
          </FilterLink>
        </FilterGroup>
      )}

      {rangeGroups.length > 0 && (
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-slate">Sous-catégories</p>
          <div className="mt-3 space-y-4">
            {rangeGroups.map((g) => {
              const items = g.items
                .map((c) => ({ c, n: countWhere("categorie", (p) => p.category.slug === c.slug) }))
                .filter((x) => x.n > 0 || params.categorie === x.c.slug);
              if (items.length === 0) return null;
              return (
                <div key={g.title}>
                  <p className="text-[12.5px] font-semibold text-ink">{g.title}</p>
                  <ul className="mt-1 space-y-0.5 border-l border-line pl-3">
                    {items.map(({ c, n }) => (
                      <FilterLink
                        key={c.id}
                        href={hrefWith({ categorie: params.categorie === c.slug ? g.parentSlug : c.slug })}
                        active={params.categorie === c.slug}
                        count={n}
                      >
                        {c.name}
                      </FilterLink>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {brands.length > 1 && (
        <FilterGroup title="Marque">
          {brands.map((b) => (
            <FilterLink
              key={b}
              href={hrefWith({ marque: params.marque?.toLowerCase() === b.toLowerCase() ? undefined : b.toLowerCase() })}
              active={params.marque?.toLowerCase() === b.toLowerCase()}
              count={countWhere("marque", (p) => p.brand === b)}
            >
              {b}
            </FilterLink>
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Prix (F CFA)">
        {BUDGETS.map((b) => (
          <FilterLink
            key={b.key}
            href={hrefWith({ prix: activeBand?.key === b.key && !customPrice ? undefined : b.key, min: undefined, max: undefined })}
            active={activeBand?.key === b.key && !customPrice}
            count={countWhere("prix", (p) => priceOf(p) >= b.min && (b.max === null || priceOf(p) < b.max))}
          >
            {b.label}
          </FilterLink>
        ))}
        <li className="pt-2">
          <form action="/boutique" className="flex items-end gap-2">
            {KEYS.filter((k) => !["prix", "min", "max"].includes(k) && params[k]).map((k) => (
              <input key={k} type="hidden" name={k} value={params[k]} />
            ))}
            <label className="min-w-0 flex-1">
              <span className="sr-only">Prix minimum</span>
              <input name="min" inputMode="numeric" defaultValue={params.min} placeholder="Min" className="field h-9 rounded-[10px] px-2.5 text-[13px]" />
            </label>
            <label className="min-w-0 flex-1">
              <span className="sr-only">Prix maximum</span>
              <input name="max" inputMode="numeric" defaultValue={params.max} placeholder="Max" className="field h-9 rounded-[10px] px-2.5 text-[13px]" />
            </label>
            <button className="btn btn-primary h-9 shrink-0 rounded-[10px] px-3 text-[13px]" aria-label="Appliquer le prix">
              OK
            </button>
          </form>
        </li>
      </FilterGroup>

      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-slate">Couleur</p>
        <ul className="mt-3 grid grid-cols-5 gap-2">
          {COLOR_FAMILIES.map((f) => {
            const n = countWhere("couleur", (p) => familiesOf(p).has(f.id));
            const on = colours.includes(f.id);
            if (n === 0 && !on) return null;
            return (
              <li key={f.id}>
                <Link
                  href={toggleColour(f.id)}
                  title={`${f.label} (${n})`}
                  aria-label={`${f.label}, ${n} modèle${n > 1 ? "s" : ""}`}
                  aria-pressed={on}
                  className={clsx(
                    "relative flex h-9 w-9 items-center justify-center rounded-full border transition-transform hover:scale-110",
                    on ? "border-ink ring-2 ring-ink ring-offset-2" : "border-black/10"
                  )}
                  style={{ background: f.swatch }}
                >
                  {on && (
                    <Check className={clsx("h-4 w-4", ["blanc", "jaune", "rose", "gris"].includes(f.id) ? "text-ink" : "text-white")} />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <FilterGroup title="Prix barrés">
        <FilterLink href={hrefWith({ deals: params.deals ? undefined : "1" })} active={!!params.deals} count={countWhere("deals", hasDeal)}>
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
            {activeUniverse && activeUniverse.slug !== params.categorie && (
              <>
                <span className="mx-2">/</span>
                <Link href={`/boutique?categorie=${activeUniverse.slug}`} className="hover:text-ink">
                  {activeUniverse.name}
                </Link>
              </>
            )}
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

      <div className="container-page grid grid-cols-1 gap-10 py-8 lg:grid-cols-[240px_1fr] lg:gap-14 lg:py-12">
        <aside className="hidden lg:block" aria-label="Filtres">
          <div className="rail sticky top-32 max-h-[calc(100dvh-9rem)] overflow-y-auto pb-6 pr-1">{filterPanel}</div>
        </aside>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <details className="group lg:hidden">
              <summary className="btn btn-secondary btn-sm cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <SlidersHorizontal className="h-4 w-4" /> Filtres
                {activeFilters.length > 0 && <span className="tabular font-mono text-[11px] text-slate">{activeFilters.length}</span>}
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
              {products.map((product, i) => (
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

function FilterLink({
  href,
  active,
  count,
  children,
}: {
  href: string;
  active?: boolean;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "true" : undefined}
        className={clsx(
          "flex items-center justify-between gap-2 rounded-lg py-1.5 text-[14.5px] transition-colors",
          active ? "font-semibold text-ink" : "text-ink-soft hover:text-ink",
          count === 0 && !active && "opacity-40"
        )}
      >
        <span className="flex items-center gap-2">
          {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
          {children}
        </span>
        {count !== undefined && <span className="tabular font-mono text-[11px] font-normal text-slate">{count}</span>}
      </Link>
    </li>
  );
}
