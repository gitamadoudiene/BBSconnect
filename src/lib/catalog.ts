import type { Prisma } from "@prisma/client";

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
