import type { Prisma } from "@prisma/client";

/** Only PUBLISHED products should ever reach the storefront — draft/archived
 * products stay visible in the dashboard only. */
export const publishedFilter: Prisma.ProductWhereInput = { status: "PUBLISHED" };

/** What the storefront may show: published, and filed in an active category
 * whose parent (if any) is active too. Deactivating a category in the
 * dashboard therefore hides its products everywhere. */
export const storefrontFilter: Prisma.ProductWhereInput = {
  status: "PUBLISHED",
  category: { active: true, OR: [{ parentId: null }, { parent: { active: true } }] },
};

/** Price bands shared by the home page and the shop filters (F CFA). */
export const BUDGETS = [
  { key: "0-250000", label: "Moins de 250 000", short: "< 250 000", caption: "Essentiel", min: 0, max: 250_000 },
  { key: "250000-500000", label: "250 000 – 500 000", short: "250 – 500 000", caption: "Équilibre", min: 250_000, max: 500_000 },
  { key: "500000-900000", label: "500 000 – 900 000", short: "500 – 900 000", caption: "Premium", min: 500_000, max: 900_000 },
  { key: "900000-", label: "900 000 et plus", short: "900 000 +", caption: "Ultra", min: 900_000, max: null },
] as const;

/** Parses `?prix=min-max` (max optional). */
export function parsePriceRange(value?: string): { min: number; max: number | null } | null {
  const m = /^(\d+)-(\d*)$/.exec(value ?? "");
  if (!m) return null;
  return { min: Number(m[1]), max: m[2] ? Number(m[2]) : null };
}

/** Matches products in a category OR in any of its sub-categories, so
 * `?categorie=smartphones` returns every iPhone, Galaxy and Pixel. */
export function categoryFilter(slug: string): Prisma.ProductWhereInput {
  return { category: { OR: [{ slug }, { parent: { slug } }] } };
}

/** Case-insensitive brand match (`?marque=samsung`). */
export function brandFilter(brand: string): Prisma.ProductWhereInput {
  return { brand: { equals: brand, mode: "insensitive" } };
}

export const productWithVariantsInclude = {
  category: true,
  variants: {
    orderBy: { position: "asc" as const },
    include: { images: { orderBy: { position: "asc" as const } } },
  },
} satisfies Prisma.ProductInclude;

export type ProductWithVariants = Prisma.ProductGetPayload<{
  include: typeof productWithVariantsInclude;
}>;

export type VariantCardData = {
  id: string;
  colorName: string;
  colorHex: string;
  storage?: string | null;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  image?: string;
  hoverImage?: string;
};

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  categoryName?: string;
  variants: VariantCardData[];
};

function variantImages(variant: ProductWithVariants["variants"][number]) {
  const primary = variant.images.find((i) => i.type === "PRIMARY") ?? variant.images[0];
  const secondary = variant.images.find((i) => i.id !== primary?.id);
  return { image: primary?.url, hoverImage: secondary?.url };
}

export function toProductCardData(product: ProductWithVariants): ProductCardData {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    categoryName: product.category?.name,
    variants: product.variants.map((v) => ({
      id: v.id,
      colorName: v.colorName,
      colorHex: v.colorHex,
      storage: v.storage,
      price: v.price,
      compareAtPrice: v.compareAtPrice,
      stock: v.stock,
      ...variantImages(v),
    })),
  };
}

/** Lowest current price across a product's variants, for "à partir de" display. */
export function fromPrice(product: ProductWithVariants) {
  return Math.min(...product.variants.map((v) => v.price));
}
