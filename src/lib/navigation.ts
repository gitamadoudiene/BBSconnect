import { prisma } from "@/lib/prisma";
import { storefrontFilter } from "@/lib/catalog";
import type { MegaColumn, NavMenu } from "@/components/layout/MegaMenu";

/** Android brands shown as columns, in this order (others follow). */
export const ANDROID_BRANDS = ["Samsung", "Tecno", "Huawei", "Google"] as const;

const brandLabel: Record<string, string> = { Google: "Google Pixel" };

/** Range → brand, from the category field or, failing that, its slug. */
export function seriesBrand(c: { brand: string | null; slug: string }) {
  if (c.brand) return c.brand;
  if (c.slug.startsWith("iphone")) return "Apple";
  if (c.slug.startsWith("galaxy")) return "Samsung";
  if (c.slug.includes("pixel")) return "Google";
  if (c.slug.startsWith("tecno")) return "Tecno";
  if (c.slug.startsWith("huawei")) return "Huawei";
  return null;
}

export async function getNavMenus(): Promise<NavMenu[]> {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: { active: true, parent: { active: true, slug: { in: ["smartphones", "accessoires"] } } },
      orderBy: { position: "asc" },
      select: { id: true, name: true, slug: true, brand: true, parent: { select: { slug: true } } },
    }),
    prisma.product.findMany({
      where: { AND: [storefrontFilter], variants: { some: {} } },
      select: {
        name: true,
        slug: true,
        brand: true,
        featured: true,
        categoryId: true,
        category: { select: { slug: true } },
        variants: {
          orderBy: { position: "asc" },
          select: { price: true, images: { orderBy: { position: "asc" }, take: 1, select: { url: true } } },
        },
      },
    }),
  ]);

  const stats = new Map<string, { count: number; from: number }>();
  for (const p of products) {
    const min = Math.min(...p.variants.map((v) => v.price));
    const s = stats.get(p.categoryId) ?? { count: 0, from: Infinity };
    s.count += 1;
    s.from = Math.min(s.from, min);
    stats.set(p.categoryId, s);
  }
  const item = (c: (typeof categories)[number]) => ({
    name: c.name,
    href: `/boutique?categorie=${c.slug}`,
    count: stats.get(c.id)?.count ?? 0,
    from: stats.get(c.id)?.from ?? null,
  });
  const minOf = (filter: (p: (typeof products)[number]) => boolean) => {
    const prices = products.filter(filter).map((p) => Math.min(...p.variants.map((v) => v.price)));
    return prices.length ? Math.min(...prices) : null;
  };

  const phones = categories.filter((c) => c.parent?.slug === "smartphones");
  const accessories = categories.filter((c) => c.parent?.slug === "accessoires");

  /* iPhone — split the ranges in two columns: latest, then earlier ones. */
  const iphones = phones.filter((c) => seriesBrand(c) === "Apple").map(item).filter((i) => i.count > 0);
  const iphoneMenu: NavMenu = {
    key: "iphone",
    label: "iPhone",
    href: "/boutique?categorie=smartphones&marque=apple",
    allLabel: "Tous les iPhone",
    columns: [
      { title: "Dernières générations", items: iphones.slice(0, 3) },
      { title: "Générations précédentes", items: iphones.slice(3) },
    ].filter((c) => c.items.length > 0),
    feature: {
      eyebrow: "Nouveau",
      title: "iPhone 17 Pro",
      href: "/boutique?categorie=iphone-17&q=Pro",
      image: "/images/banner/iphone17pro-orange.webp",
      tone: "orange",
      from: minOf((p) => p.category.slug === "iphone-17" && p.name.includes("Pro")),
    },
  };

  /* Android — one column per brand, even before its phones arrive. */
  const androidBrands = [
    ...ANDROID_BRANDS,
    ...new Set(phones.map(seriesBrand).filter((b): b is string => !!b && b !== "Apple" && !ANDROID_BRANDS.includes(b as never))),
  ];
  const androidColumns: MegaColumn[] = androidBrands.map((brand) => ({
    title: brandLabel[brand] ?? brand,
    href: `/boutique?categorie=smartphones&marque=${brand.toLowerCase()}`,
    items: phones.filter((c) => seriesBrand(c) === brand).map(item).filter((i) => i.count > 0),
    emptyText: "Arrivage en cours, demandez-nous le modèle sur WhatsApp.",
  }));
  const androidMenu: NavMenu = {
    key: "android",
    label: "Android",
    href: "/boutique?categorie=smartphones&os=android",
    allLabel: "Tous les Android",
    columns: androidColumns,
    feature: {
      eyebrow: "Pliable",
      title: "Galaxy Z Fold7",
      href: "/boutique/galaxy-z-fold7",
      image: "/images/banner/galaxy-zfold.webp",
      tone: "blue",
      from: minOf((p) => p.slug === "galaxy-z-fold7"),
    },
  };

  /* Accessories — sub-categories, then the most wanted products. */
  const accessoryProducts = products
    .filter((p) => p.category.slug === "accessoires" || accessories.some((a) => a.id === p.categoryId))
    .sort((a, b) => Number(b.featured) - Number(a.featured));
  const accessoriesMenu: NavMenu = {
    key: "accessoires",
    label: "Accessoires",
    href: "/boutique?categorie=accessoires",
    allLabel: "Tous les accessoires",
    columns: [
      { title: "Par catégorie", items: accessories.map(item).filter((i) => i.count > 0) },
      {
        title: "Les plus demandés",
        products: accessoryProducts.slice(0, 4).map((p) => ({
          name: p.name,
          href: `/boutique/${p.slug}`,
          from: Math.min(...p.variants.map((v) => v.price)),
          image: p.variants.find((v) => v.images[0])?.images[0]?.url ?? null,
        })),
      },
    ].filter((c) => (c.items?.length ?? 0) + (c.products?.length ?? 0) > 0),
    feature: {
      eyebrow: "Protection",
      title: "Coques MagSafe",
      href: "/boutique/coque-silicone-magsafe",
      image: "/images/banner/case-magsafe.webp",
      tone: "peach",
      from: minOf((p) => p.slug === "coque-silicone-magsafe"),
    },
  };

  return [iphoneMenu, androidMenu, accessoriesMenu];
}
