import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { promoPrice } from "@/lib/promoPrice";

export { promoPrice };

export type PromotionTarget =
  | { mode: "all" }
  | { mode: "brand"; brand: string }
  | { mode: "category"; categoryId: string }
  | { mode: "products"; productIds: string[] };

export function parseTarget(value: unknown): PromotionTarget {
  const v = (value ?? {}) as Record<string, unknown>;
  if (v.mode === "brand" && typeof v.brand === "string") return { mode: "brand", brand: v.brand };
  if (v.mode === "category" && typeof v.categoryId === "string") return { mode: "category", categoryId: v.categoryId };
  if (v.mode === "products" && Array.isArray(v.productIds))
    return { mode: "products", productIds: v.productIds.filter((x): x is string => typeof x === "string") };
  return { mode: "all" };
}

export function targetWhere(target: PromotionTarget): Prisma.ProductWhereInput {
  switch (target.mode) {
    case "brand":
      return { brand: { equals: target.brand, mode: "insensitive" } };
    case "category":
      return { OR: [{ categoryId: target.categoryId }, { category: { parentId: target.categoryId } }] };
    case "products":
      return { id: { in: target.productIds } };
    default:
      return {};
  }
}

/** Variants a promotion would touch, minus those already in another live promotion. */
export async function targetVariants(target: PromotionTarget, exceptPromotionId?: string) {
  return prisma.productVariant.findMany({
    where: {
      product: { ...targetWhere(target), status: { not: "ARCHIVED" } },
      promotionItems: {
        none: { promotion: { status: "ACTIVE", ...(exceptPromotionId ? { id: { not: exceptPromotionId } } : {}) } },
      },
    },
    include: { product: { select: { name: true } } },
    orderBy: [{ product: { name: "asc" } }, { position: "asc" }],
  });
}

export async function startPromotion(id: string) {
  const promo = await prisma.promotion.findUnique({ where: { id } });
  if (!promo || promo.status === "ACTIVE") return { error: "Promotion introuvable ou déjà en cours" };
  const variants = await targetVariants(parseTarget(promo.target), id);
  if (variants.length === 0) return { error: "Aucun produit disponible pour cette promotion" };

  await prisma.$transaction([
    prisma.promotionItem.deleteMany({ where: { promotionId: id } }),
    ...variants.map((v) =>
      prisma.productVariant.update({
        where: { id: v.id },
        data: {
          price: promoPrice(v.price, promo.percent),
          compareAtPrice: Math.max(v.compareAtPrice ?? 0, v.price),
          promotionItems: { create: { promotionId: id, originalPrice: v.price, originalCompareAt: v.compareAtPrice } },
        },
      })
    ),
    prisma.promotion.update({ where: { id }, data: { status: "ACTIVE", startedAt: new Date(), endedAt: null } }),
  ]);
  return { count: variants.length };
}

/** Puts prices back — except where the merchant changed a price by hand meanwhile. */
export async function endPromotion(id: string) {
  const promo = await prisma.promotion.findUnique({
    where: { id },
    include: { items: { include: { variant: { select: { id: true, price: true } } } } },
  });
  if (!promo || promo.status !== "ACTIVE") return { restored: 0, skipped: 0 };
  const restorable = promo.items.filter((i) => i.variant.price === promoPrice(i.originalPrice, promo.percent));
  await prisma.$transaction([
    ...restorable.map((i) =>
      prisma.productVariant.update({
        where: { id: i.variantId },
        data: { price: i.originalPrice, compareAtPrice: i.originalCompareAt },
      })
    ),
    prisma.promotion.update({ where: { id }, data: { status: "ENDED", endedAt: new Date() } }),
  ]);
  return { restored: restorable.length, skipped: promo.items.length - restorable.length };
}

/** Ends promotions whose end date has passed. Cheap no-op most of the time. */
export async function expirePromotions() {
  const due = await prisma.promotion.findMany({
    where: { status: "ACTIVE", endsAt: { lte: new Date() } },
    select: { id: true },
  });
  for (const p of due) await endPromotion(p.id);
  return due.length;
}
