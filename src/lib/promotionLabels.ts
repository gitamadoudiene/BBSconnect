import type { PromotionStatus } from "@prisma/client";
import { parseTarget } from "@/lib/promotions";

export const promoStatus: Record<PromotionStatus, { label: string; className: string }> = {
  DRAFT: { label: "Brouillon", className: "bg-paper text-slate" },
  ACTIVE: { label: "En cours", className: "bg-signal-tint text-signal-deep" },
  ENDED: { label: "Terminée", className: "bg-mist text-slate" },
};

export function describeTarget(target: unknown, categories: Map<string, string>, products?: number) {
  const t = parseTarget(target);
  if (t.mode === "brand") return `Marque ${t.brand}`;
  if (t.mode === "category") return `Catégorie ${categories.get(t.categoryId) ?? "supprimée"}`;
  if (t.mode === "products") return `${products ?? t.productIds.length} produit${(products ?? t.productIds.length) > 1 ? "s" : ""} choisi${(products ?? t.productIds.length) > 1 ? "s" : ""}`;
  return "Tout le catalogue";
}

