import { prisma } from "@/lib/prisma";
import { fromPrice, productWithVariantsInclude, publishedFilter, toProductCardData } from "@/lib/catalog";
import type { ProductWithVariants } from "@/lib/catalog";
import { Hero, type HeroSpot } from "@/components/marketing/Hero";
import { UniverseBento } from "@/components/marketing/UniverseBento";
import { ProductShowcase } from "@/components/marketing/ProductShowcase";
import { GalaxySpotlight } from "@/components/marketing/GalaxySpotlight";
import { ShopByConditionSection } from "@/components/marketing/ShopByConditionSection";
import { ProBanner } from "@/components/marketing/ProBanner";
import { WhyUs } from "@/components/marketing/WhyUs";
import { OfferSection } from "@/components/marketing/OfferSection";
import { Newsletter } from "@/components/marketing/Newsletter";

export const dynamic = "force-dynamic";

const HERO_SLUGS = ["iphone-17-pro-max", "galaxy-s26-ultra", "playstation-5-pro"];
const GALAXY_SLUGS = [
  { slug: "galaxy-s26-ultra", tagline: "Le flagship ultime" },
  { slug: "galaxy-z-fold7", tagline: "Le smartphone qui devient tablette" },
  { slug: "galaxy-z-flip7", tagline: "Le pliable de poche" },
];

function primaryImage(p: ProductWithVariants) {
  const v = p.variants[0];
  return (v?.images.find((i) => i.type === "PRIMARY") ?? v?.images[0])?.url;
}

export default async function HomePage() {
  const [featured, topCategories, spotlightProducts] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true, ...publishedFilter, variants: { some: {} } },
      include: { ...productWithVariantsInclude, category: { include: { parent: true } } },
      orderBy: { updatedAt: "desc" },
      take: 24,
    }),
    prisma.category.findMany({
      where: { parentId: null, active: true },
      orderBy: { position: "asc" },
      include: {
        _count: { select: { products: { where: publishedFilter } } },
        children: { select: { _count: { select: { products: { where: publishedFilter } } } } },
      },
    }),
    prisma.product.findMany({
      where: {
        slug: { in: [...HERO_SLUGS, ...GALAXY_SLUGS.map((g) => g.slug)] },
        ...publishedFilter,
        variants: { some: {} },
      },
      include: productWithVariantsInclude,
    }),
  ]);

  const bySlug = new Map(spotlightProducts.map((p) => [p.slug, p]));

  const heroSpots: Record<string, HeroSpot | undefined> = {};
  for (const slug of HERO_SLUGS) {
    const p = bySlug.get(slug);
    if (p) heroSpots[slug] = { slug, name: p.name, price: fromPrice(p), image: primaryImage(p) };
  }

  const galaxy = GALAXY_SLUGS.flatMap(({ slug, tagline }) => {
    const p = bySlug.get(slug);
    return p ? [{ slug, name: p.name, price: fromPrice(p), image: primaryImage(p), tagline }] : [];
  });

  const universes = topCategories
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      image: c.image,
      count: c._count.products + c.children.reduce((s, ch) => s + ch._count.products, 0),
    }))
    .filter((u) => u.count > 0);

  const showcase = featured.map((p) => ({
    card: toProductCardData(p),
    universe: p.category.parent?.slug ?? p.category.slug,
  }));

  return (
    <div>
      <Hero spots={heroSpots} />
      <UniverseBento universes={universes} />
      <ProductShowcase items={showcase} />
      <GalaxySpotlight products={galaxy} />
      <ShopByConditionSection />
      <ProBanner />
      <WhyUs />
      <OfferSection />
      <Newsletter />
    </div>
  );
}
