"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { slugify } from "@/lib/slug";

async function requireMerchant() {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") {
    redirect("/connexion?redirect=/dashboard");
  }
  return session;
}

const variantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1, "SKU requis"),
  colorName: z.string().min(1, "Couleur requise"),
  colorHex: z.string().min(1),
  storage: z.string().optional(),
  price: z.coerce.number().int().min(0),
  compareAtPrice: z.coerce.number().int().min(0).nullable().optional(),
  stock: z.coerce.number().int().min(0),
  images: z.array(z.string().min(1)).min(1, "Au moins une image par variante"),
});

const productSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  categoryId: z.string().min(1, "La catégorie est requise"),
  description: z.string().min(1, "La description est requise"),
  specs: z.string().min(1, "Les caractéristiques sont requises"),
  featured: z.coerce.boolean().optional(),
  variants: z.array(variantSchema).min(1, "Au moins une variante est requise"),
});

export type ProductFormState = { error?: string } | undefined;

function parseProductForm(formData: FormData) {
  let variants: unknown = [];
  try {
    variants = JSON.parse(String(formData.get("variants") ?? "[]"));
  } catch {
    return { success: false as const, error: { issues: [{ message: "Variantes invalides" }] } };
  }

  return productSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    specs: formData.get("specs"),
    featured: formData.get("featured") === "on",
    variants,
  });
}

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireMerchant();

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Champs invalides" };
  }

  const skus = parsed.data.variants.map((v) => v.sku);
  const existingSkus = await prisma.productVariant.findMany({ where: { sku: { in: skus } } });
  if (existingSkus.length > 0) {
    return { error: `Le SKU "${existingSkus[0].sku}" est déjà utilisé` };
  }

  const baseSlug = slugify(parsed.data.name);
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  await prisma.product.create({
    data: {
      name: parsed.data.name,
      slug,
      categoryId: parsed.data.categoryId,
      description: parsed.data.description,
      specs: parsed.data.specs,
      featured: parsed.data.featured ?? false,
      variants: {
        create: parsed.data.variants.map((v, i) => ({
          sku: v.sku,
          colorName: v.colorName,
          colorHex: v.colorHex,
          storage: v.storage || null,
          price: v.price,
          compareAtPrice: v.compareAtPrice ?? null,
          stock: v.stock,
          position: i,
          images: {
            create: v.images.map((url, imgIndex) => ({
              url,
              type: imgIndex === 0 ? "PRIMARY" : "GALLERY",
              position: imgIndex,
            })),
          },
        })),
      },
    },
  });

  revalidatePath("/dashboard/produits");
  revalidatePath("/boutique");
  redirect("/dashboard/produits");
}

export async function updateProductAction(
  productId: string,
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireMerchant();

  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Champs invalides" };
  }

  const skuConflicts = await prisma.productVariant.findMany({
    where: { sku: { in: parsed.data.variants.map((v) => v.sku) }, productId: { not: productId } },
  });
  if (skuConflicts.length > 0) {
    return { error: `Le SKU "${skuConflicts[0].sku}" est déjà utilisé par un autre produit` };
  }

  const existingVariants = await prisma.productVariant.findMany({ where: { productId } });
  const submittedIds = new Set(parsed.data.variants.map((v) => v.id).filter(Boolean));
  const removed = existingVariants.filter((v) => !submittedIds.has(v.id));

  if (removed.length > 0) {
    const removedIds = removed.map((v) => v.id);
    const orderCount = await prisma.orderItem.count({ where: { variantId: { in: removedIds } } });
    if (orderCount > 0) {
      return {
        error:
          "Impossible de retirer une variante déjà commandée. Réduisez plutôt son stock à 0.",
      };
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: productId },
      data: {
        name: parsed.data.name,
        categoryId: parsed.data.categoryId,
        description: parsed.data.description,
        specs: parsed.data.specs,
        featured: parsed.data.featured ?? false,
      },
    });

    if (removed.length > 0) {
      await tx.productVariant.deleteMany({ where: { id: { in: removed.map((v) => v.id) } } });
    }

    for (let i = 0; i < parsed.data.variants.length; i++) {
      const v = parsed.data.variants[i];
      const isExisting = v.id && existingVariants.some((ev) => ev.id === v.id);

      const variant = isExisting
        ? await tx.productVariant.update({
            where: { id: v.id! },
            data: {
              sku: v.sku,
              colorName: v.colorName,
              colorHex: v.colorHex,
              storage: v.storage || null,
              price: v.price,
              compareAtPrice: v.compareAtPrice ?? null,
              stock: v.stock,
              position: i,
            },
          })
        : await tx.productVariant.create({
            data: {
              productId,
              sku: v.sku,
              colorName: v.colorName,
              colorHex: v.colorHex,
              storage: v.storage || null,
              price: v.price,
              compareAtPrice: v.compareAtPrice ?? null,
              stock: v.stock,
              position: i,
            },
          });

      await tx.productImage.deleteMany({ where: { variantId: variant.id } });
      await tx.productImage.createMany({
        data: v.images.map((url, imgIndex) => ({
          url,
          type: imgIndex === 0 ? ("PRIMARY" as const) : ("GALLERY" as const),
          position: imgIndex,
          variantId: variant.id,
        })),
      });
    }
  });

  revalidatePath("/dashboard/produits");
  revalidatePath("/boutique");
  redirect("/dashboard/produits");
}

export async function deleteProductAction(productId: string) {
  await requireMerchant();

  const orderItemCount = await prisma.orderItem.count({ where: { variant: { productId } } });
  if (orderItemCount > 0) {
    redirect("/dashboard/produits?error=has-orders");
  }

  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/dashboard/produits");
  revalidatePath("/boutique");
  redirect("/dashboard/produits?deleted=1");
}
