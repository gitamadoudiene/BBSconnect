import { prisma } from "@/lib/prisma";
import { expirePromotions } from "@/lib/promotions";
import { BUDGETS, fromPrice, productWithVariantsInclude, storefrontFilter, toProductCardData } from "@/lib/catalog";
import type { ProductWithVariants } from "@/lib/catalog";
import { getHomeLayout, getLiveBanners, priceForHref, toHeroSlide, toPromoTile, type HomeSectionId } from "@/lib/content";
import { HomeHero, type BrandRow } from "@/components/home/HomeHero";
import { HeroBanner } from "@/components/home/HeroBanner";
import { PromoTiles, ServiceStrip, Shortcuts, VideoBanner } from "@/components/home/Promos";
import { ProductTabs } from "@/components/home/ProductTabs";
import { ProductCard } from "@/components/store/ProductCard";
import {
  AdviceBand,
  BudgetGrid,
  Promises,
  SectionHeading,
  SeriesIndex,
  type BudgetBand,
  type SeriesRow,
} from "@/components/home/Sections";

export const dynamic = "force-dynamic";

const inPhones = { category: { OR: [{ slug: "smartphones" }, { parent: { slug: "smartphones" } }] } };

function stats(products: ProductWithVariants[]) {
  return {
    count: products.length,
    from: products.length ? Math.min(...products.map(fromPrice)) : null,
  };
}

export default async function HomePage() {
  await expirePromotions();
  const [phones, accessories, series, categories, layout, heroBanners, tileBanners, homeCollections] = await Promise.all([
    prisma.product.findMany({
      where: { AND: [storefrontFilter, inPhones], variants: { some: {} } },
      include: productWithVariantsInclude,
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    }),
    prisma.product.findMany({
      where: { AND: [storefrontFilter, { category: { slug: "accessoires" } }], variants: { some: {} } },
      include: productWithVariantsInclude,
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    }),
    prisma.category.findMany({
      where: { active: true, parent: { slug: "smartphones" } },
      orderBy: { position: "asc" },
      select: { name: true, slug: true },
    }),
    prisma.category.findMany({ select: { id: true, parent: { select: { slug: true } } } }),
    getHomeLayout(),
    getLiveBanners("HERO"),
    getLiveBanners("TILE"),
    prisma.collection.findMany({
      where: { active: true, onHome: true },
      orderBy: { position: "asc" },
      include: {
        products: {
          orderBy: { position: "asc" },
          where: { product: { AND: [storefrontFilter], variants: { some: {} } } },
          include: { product: { include: productWithVariantsInclude } },
          take: 8,
        },
      },
    }),
  ]);

  const all = [...phones, ...accessories];
  const parentSlugOf = new Map(categories.map((c) => [c.id, c.parent?.slug ?? null]));
  const priceOf = (href: string) => priceForHref(href, all, parentSlugOf);

  const byBrand = (b: string) => phones.filter((p) => p.brand.toLowerCase() === b);
  const apple = byBrand("apple");
  const samsung = byBrand("samsung");
  const google = byBrand("google");

  const brands: BrandRow[] = [
    { label: "iPhone", href: "/boutique?categorie=smartphones&marque=apple", ...stats(apple) },
    { label: "Galaxy", href: "/boutique?categorie=smartphones&marque=samsung", ...stats(samsung) },
    { label: "Pixel", href: "/boutique?categorie=smartphones&marque=google", ...stats(google) },
  ].filter((b) => b.count > 0);

  const accessoryRow: BrandRow = {
    label: "Accessoires",
    href: "/boutique?categorie=accessoires",
    ...stats(accessories),
  };

  const popular = phones
    .filter((p) => p.featured)
    .slice(0, 5)
    .map((p) => ({ name: p.name, slug: p.slug }));

  const card = toProductCardData;
  const tabs = [
    { key: "all", label: "Tous", products: phones.slice(0, 8).map(card) },
    { key: "apple", label: "iPhone", products: apple.slice(0, 8).map(card) },
    { key: "samsung", label: "Samsung", products: samsung.slice(0, 8).map(card) },
    { key: "google", label: "Pixel", products: google.slice(0, 8).map(card) },
  ];

  const bands: BudgetBand[] = BUDGETS.map((b) => ({
    label: b.short,
    caption: b.caption,
    href: `/boutique?categorie=smartphones&prix=${b.key}`,
    count: phones.filter((p) => {
      const price = fromPrice(p);
      return price >= b.min && (b.max === null || price < b.max);
    }).length,
  }));

  const seriesRows: SeriesRow[] = series
    .map((s) => ({ ...s, ...stats(phones.filter((p) => p.category.slug === s.slug)) }))
    .filter((s) => s.count > 0);
  const groups = [
    { brand: "Apple", rows: seriesRows.filter((s) => s.slug.startsWith("iphone")) },
    { brand: "Samsung · Google", rows: seriesRows.filter((s) => !s.slug.startsWith("iphone")) },
  ].filter((g) => g.rows.length > 0);

  const maxDiscount = Math.max(
    0,
    ...phones.flatMap((p) =>
      p.variants
        .filter((v) => v.compareAtPrice && v.compareAtPrice > v.price)
        .map((v) => Math.round(100 - (v.price / v.compareAtPrice!) * 100))
    )
  );

  const slides = heroBanners.map((b) => toHeroSlide(b, priceOf(b.href)));
  const tiles = tileBanners.map((b) => toPromoTile(b, priceOf(b.href), maxDiscount));
  const collections = homeCollections.filter((c) => c.products.length > 0);

  // Numbered headings follow the order chosen in the dashboard.
  let n = 0;
  const next = () => String(++n).padStart(2, "0");

  const render: Record<HomeSectionId, () => React.ReactNode> = {
    hero: () => (slides.length ? <HeroBanner slides={slides} /> : null),
    services: () => <ServiceStrip />,
    shortcuts: () => <Shortcuts />,
    tiles: () => (tiles.length ? <PromoTiles tiles={tiles} /> : null),
    finder: () => <HomeHero brands={brands} accessories={accessoryRow} popular={popular} totalModels={phones.length} />,
    selection: () => (
      <section className="section-space">
        <div className="container-page">
          <SectionHeading
            index={next()}
            label="Sélection"
            title="Les modèles du moment."
            action={{ label: "Tous les téléphones", href: "/boutique?categorie=smartphones" }}
          />
          <div className="mt-10">
            <ProductTabs tabs={tabs} />
          </div>
        </div>
      </section>
    ),
    collections: () =>
      collections.map((c) => (
        <section key={c.id} className="section-space">
          <div className="container-page">
            <SectionHeading
              index={next()}
              label="Collection"
              title={c.name}
              action={{ label: "Voir la collection", href: `/boutique?collection=${c.slug}` }}
            />
            {c.description && <p className="mt-4 max-w-[60ch] text-[15px] text-slate md:ml-[204px]">{c.description}</p>}
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
              {c.products.slice(0, 4).map((cp) => (
                <ProductCard key={cp.productId} product={card(cp.product)} />
              ))}
            </div>
          </div>
        </section>
      )),
    video: () => <VideoBanner price={priceOf("/boutique/iphone-17")} />,
    budget: () => <BudgetGrid bands={bands} index={next()} />,
    series: () => <SeriesIndex groups={groups} index={next()} />,
    accessories: () =>
      accessories.length > 0 ? (
        <section className="section-space">
          <div className="container-page">
            <SectionHeading
              index={next()}
              label="Accessoires"
              title="Ce qui va avec : charge, protection, écoute."
              action={{ label: "Tous les accessoires", href: "/boutique?categorie=accessoires" }}
            />
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
              {accessories.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={card(p)} />
              ))}
            </div>
          </div>
        </section>
      ) : null,
    promises: () => <Promises index={next()} />,
    advice: () => <AdviceBand />,
  };

  return (
    <div>
      {layout
        .filter((s) => s.visible)
        .map((s) => (
          <div key={s.id} data-section={s.id}>
            {render[s.id]()}
          </div>
        ))}
    </div>
  );
}
