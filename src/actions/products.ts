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

const productSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  sku: z.string().min(2, "Le SKU est requis"),
  categoryId: z.string().min(1, "La catégorie est requise"),
  price: z.coerce.number().int().min(0, "Le prix doit être positif"),
  compareAtPrice: z
    .string()
    .transform((v) => (v ? Number(v) : null))
    .nullable(),
  stock: z.coerce.number().int().min(0),
  color: z.string().min(1),
  storage: z.string().optional(),
  description: z.string().min(1, "La description est requise"),
  specs: z.string().min(1, "Les caractéristiques sont requises"),
  featured: z.coerce.boolean().optional(),
});

export type ProductFormState = { error?: string } | undefined;

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku"),
    categoryId: formData.get("categoryId"),
    price: formData.get("price"),
    compareAtPrice: formData.get("compareAtPrice"),
    stock: formData.get("stock"),
    color: formData.get("color"),
    storage: formData.get("storage"),
    description: formData.get("description"),
    specs: formData.get("specs"),
    featured: formData.get("featured") === "on",
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

  const baseSlug = slugify(parsed.data.name);
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
  }

  const existingSku = await prisma.product.findUnique({ where: { sku: parsed.data.sku } });
  if (existingSku) return { error: "Ce SKU est déjà utilisé" };

  await prisma.product.create({
    data: {
      name: parsed.data.name,
      slug,
      sku: parsed.data.sku,
      categoryId: parsed.data.categoryId,
      price: parsed.data.price,
      compareAtPrice: parsed.data.compareAtPrice,
      stock: parsed.data.stock,
      color: parsed.data.color,
      storage: parsed.data.storage || null,
      description: parsed.data.description,
      specs: parsed.data.specs,
      featured: parsed.data.featured ?? false,
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

  const skuOwner = await prisma.product.findUnique({ where: { sku: parsed.data.sku } });
  if (skuOwner && skuOwner.id !== productId) {
    return { error: "Ce SKU est déjà utilisé par un autre produit" };
  }

  await prisma.product.update({
    where: { id: productId },
    data: {
      name: parsed.data.name,
      sku: parsed.data.sku,
      categoryId: parsed.data.categoryId,
      price: parsed.data.price,
      compareAtPrice: parsed.data.compareAtPrice,
      stock: parsed.data.stock,
      color: parsed.data.color,
      storage: parsed.data.storage || null,
      description: parsed.data.description,
      specs: parsed.data.specs,
      featured: parsed.data.featured ?? false,
    },
  });

  revalidatePath("/dashboard/produits");
  revalidatePath("/boutique");
  redirect("/dashboard/produits");
}

export async function deleteProductAction(productId: string) {
  await requireMerchant();

  const orderItemCount = await prisma.orderItem.count({ where: { productId } });
  if (orderItemCount > 0) {
    redirect("/dashboard/produits?error=has-orders");
  }

  await prisma.product.delete({ where: { id: productId } });
  revalidatePath("/dashboard/produits");
  revalidatePath("/boutique");
  redirect("/dashboard/produits?deleted=1");
}
