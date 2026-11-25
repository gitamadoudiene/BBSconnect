import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/format";
import { BUDGETS, fromPrice, productWithVariantsInclude, storefrontFilter, toProductCardData } from "@/lib/catalog";
import type { ProductWithVariants } from "@/lib/catalog";
import { HomeHero, type BrandRow } from "@/components/home/HomeHero";
import { HeroBanner } from "@/components/home/HeroBanner";
import { PromoTiles, ServiceStrip, Shortcuts, VideoBanner, type PromoTile } from "@/components/home/Promos";
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


function minOf(products: ProductWithVariants[]) {
  return products.length ? Math.min(...products.map(fromPrice)) : undefined;
}

function stats(products: ProductWithVariants[]) {
  return {
    count: products.length,
    from: products.length ? Math.min(...products.map(fromPrice)) : null,
  };
}

export default async function HomePage() {
  const [phones, accessories, series] = await Promise.all([
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
  ]);

  const byBrand = (b: string) => phones.filter((p) => p.brand.toLowerCase() === b);
  const apple = byBrand("apple");
  const samsung = byBrand("samsung");
  const google = byBrand("google");

  const brands: BrandRow[] = [
    { label: "iPhone", href: "/boutique?categorie=smartphones&marque=apple", ...stats(apple) },
    { label: "Galaxy", href: "/boutique?marque=samsung", ...stats(samsung) },
    { label: "Pixel", href: "/boutique?marque=google", ...stats(google) },
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

  const bySlug = (slug: string) => phones.filter((p) => p.slug === slug);
  const maxDiscount = Math.max(
    0,
    ...phones.flatMap((p) =>
      p.variants
        .filter((v) => v.compareAtPrice && v.compareAtPrice > v.price)
        .map((v) => Math.round(100 - (v.price / v.compareAtPrice!) * 100))
    )
  );
  const dès = (n?: number) => (n !== undefined ? `dès ${formatFCFA(n)}` : undefined);

  const tiles: PromoTile[] = [
    {
      key: "air",
      eyebrow: "iPhone Air",
      title: "L'iPhone le plus fin.",
      price: dès(minOf(bySlug("iphone-air"))),
      href: "/boutique/iphone-air",
      tone: "sky",
      images: [{ src: "/images/banner/iphone-air.webp", alt: "iPhone Air", className: "-bottom-6 -right-4 w-[52%] rotate-[8deg]" }],
    },
    {
      key: "iphone17",
      eyebrow: "iPhone 17",
      title: "Le nouveau standard.",
      price: dès(minOf(bySlug("iphone-17"))),
      href: "/boutique/iphone-17",
      tone: "paper",
      images: [
        { src: "/images/banner/iphone17-white.webp", alt: "iPhone 17 blanc", className: "-bottom-4 right-[18%] w-[38%] -rotate-[6deg]" },
        { src: "/images/banner/iphone17-black.webp", alt: "iPhone 17 noir", className: "-bottom-10 -right-3 w-[36%] rotate-[7deg]" },
      ],
    },
    {
      key: "accessoires",
      eyebrow: "Accessoires",
      title: "Protégez votre téléphone.",
      price: dès(accessoryRow.from ?? undefined),
      href: "/boutique?categorie=accessoires",
      tone: "peach",
      images: [{ src: "/images/banner/case-magsafe.webp", alt: "Coque MagSafe pour iPhone", className: "-bottom-8 -right-2 w-[34%] rotate-[10deg]" }],
    },
    {
      key: "offres",
      eyebrow: "Offres du moment",
      title: maxDiscount > 0 ? `Jusqu'à −${maxDiscount} %` : "Les bons plans",
      price: "Sur une sélection de téléphones",
      href: "/boutique?deals=1",
      tone: "ink",
      images: [{ src: "/images/banner/iphone12-range.webp", alt: "iPhone 12 en cinq coloris", className: "-bottom-6 -right-8 w-[64%] -rotate-[4deg]" }],
    },
  ];

  return (
    <div>
      <HeroBanner
        prices={{
          iphonePro: minOf(phones.filter((p) => p.category.slug === "iphone-17" && p.name.includes("Pro"))),
          samsung: minOf(samsung),
          iphone: minOf(apple),
        }}
      />
      <ServiceStrip />
      <Shortcuts />
      <PromoTiles tiles={tiles} />
      <HomeHero brands={brands} accessories={accessoryRow} popular={popular} totalModels={phones.length} />

      <section className="section-space">
        <div className="container-page">
          <SectionHeading
            index="01"
            label="Sélection"
            title="Les modèles du moment."
            action={{ label: "Tous les téléphones", href: "/boutique?categorie=smartphones" }}
          />
          <div className="mt-10">
            <ProductTabs tabs={tabs} />
          </div>
        </div>
      </section>

      <VideoBanner price={minOf(bySlug("iphone-17"))} />
      <BudgetGrid bands={bands} />
      <SeriesIndex groups={groups} />

      {accessories.length > 0 && (
        <section className="section-space">
          <div className="container-page">
            <SectionHeading
              index="04"
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
      )}

      <Promises />
      <AdviceBand />
    </div>
  );
}
