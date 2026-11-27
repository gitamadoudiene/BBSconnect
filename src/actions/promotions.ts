"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireMerchant } from "@/lib/auth";
import { endPromotion, startPromotion } from "@/lib/promotions";

export type PromotionFormState = { error?: string } | undefined;

const schema = z
  .object({
    name: z.string().trim().min(2, "Donnez un nom à la promotion").max(80),
    percent: z.coerce.number().int().min(1, "Remise minimum 1 %").max(90, "Remise maximum 90 %"),
    mode: z.enum(["all", "brand", "category", "products"]),
    brand: z.string().trim().optional(),
    categoryId: z.string().optional(),
    productIds: z.array(z.string()).optional(),
    endsAt: z
      .string()
      .optional()
      .transform((v) => (v ? new Date(v) : null))
      .refine((d) => d === null || !Number.isNaN(d.getTime()), "Date invalide"),
  })
  .superRefine((v, ctx) => {
    if (v.mode === "brand" && !v.brand) ctx.addIssue({ code: "custom", message: "Choisissez une marque", path: ["brand"] });
    if (v.mode === "category" && !v.categoryId) ctx.addIssue({ code: "custom", message: "Choisissez une catégorie", path: ["categoryId"] });
    if (v.mode === "products" && !v.productIds?.length) ctx.addIssue({ code: "custom", message: "Choisissez au moins un produit", path: ["productIds"] });
  });

function refresh() {
  revalidatePath("/", "layout");
  revalidatePath("/dashboard/promotions");
}

export async function createPromotionAction(_prev: PromotionFormState, formData: FormData): Promise<PromotionFormState> {
  await requireMerchant();
  let productIds: unknown = [];
  try {
    productIds = JSON.parse(String(formData.get("productIds") ?? "[]"));
  } catch {
    productIds = [];
  }
  const parsed = schema.safeParse({
    name: formData.get("name"),
    percent: formData.get("percent"),
    mode: formData.get("mode"),
    brand: formData.get("brand") || undefined,
    categoryId: formData.get("categoryId") || undefined,
    productIds,
    endsAt: formData.get("endsAt") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Champs invalides" };
  const { name, percent, mode, brand, categoryId, endsAt } = parsed.data;
  if (endsAt && endsAt <= new Date()) return { error: "La date de fin est déjà passée" };

  const target =
    mode === "brand" ? { mode, brand } : mode === "category" ? { mode, categoryId } : mode === "products" ? { mode, productIds: parsed.data.productIds } : { mode };

  const promo = await prisma.promotion.create({ data: { name, percent, target, endsAt } });

  if (formData.get("startNow") === "on") {
    const r = await startPromotion(promo.id);
    if ("error" in r) {
      refresh();
      redirect(`/dashboard/promotions/${promo.id}?error=${encodeURIComponent(r.error ?? "")}`);
    }
  }
  refresh();
  redirect(`/dashboard/promotions/${promo.id}?saved=1`);
}

export async function startPromotionAction(id: string) {
  await requireMerchant();
  const r = await startPromotion(id);
  refresh();
  redirect(`/dashboard/promotions/${id}?${"error" in r ? `error=${encodeURIComponent(r.error ?? "")}` : `started=${r.count}`}`);
}

export async function endPromotionAction(id: string) {
  await requireMerchant();
  const r = await endPromotion(id);
  refresh();
  redirect(`/dashboard/promotions/${id}?ended=${r.restored}&skipped=${r.skipped}`);
}

export async function deletePromotionAction(id: string) {
  await requireMerchant();
  const p = await prisma.promotion.findUnique({ where: { id }, select: { status: true } });
  if (p?.status === "ACTIVE") await endPromotion(id);
  await prisma.promotion.delete({ where: { id } });
  refresh();
  redirect("/dashboard/promotions?deleted=1");
}
