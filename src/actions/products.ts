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

const variantImageSchema = z.object({
  url: z.string().min(1),
  isPrimary: z.boolean(),
});

const variantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1, "SKU requis"),
  colorName: z.string().min(1, "Couleur requise"),
  colorHex: z.string().min(1),
  storage: z.string().optional(),
  price: z.coerce.number().int().min(0),
  compareAtPrice: z.coerce.number().int().min(0).nullable().optional(),
  stock: z.coerce.number().int().min(0),
  images: z.array(variantImageSchema).min(1, "Au moins une image par variante"),
});

const productSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  categoryId: z.string().min(1, "La catégorie est requise"),
  description: z.string().min(1, "La description est requise"),
  specs: z.string().min(1, "Les caractéristiques sont requises"),
  featured: z.coerce.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
  tags: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  slug: z.string().optional(),
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
    status: formData.get("status") || undefined,
    tags: formData.get("tags") || undefined,
    seoTitle: formData.get("seoTitle") || undefined,
    seoDescription: formData.get("seoDescription") || undefined,
    slug: formData.get("slug") || undefined,
    variants,
  });
}

async function uniqueSlug(base: string, ignoreId?: string) {
  const baseSlug = slugify(base);
  let slug = baseSlug || "produit";
  let counter = 1;
  while (true) {
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${baseSlug}-${counter++}`;
  }
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

  const slug = await uniqueSlug(parsed.data.slug || parsed.data.name);

  await prisma.product.create({
    data: {
      name: parsed.data.name,
      slug,
      categoryId: parsed.data.categoryId,
      description: parsed.data.description,
      specs: parsed.data.specs,
      featured: parsed.data.featured ?? false,
      status: parsed.data.status,
      tags: parsed.data.tags || null,
      seoTitle: parsed.data.seoTitle || null,
      seoDescription: parsed.data.seoDescription || null,
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
            create: v.images.map((img, imgIndex) => ({
              url: img.url,
              type: img.isPrimary ? ("PRIMARY" as const) : ("GALLERY" as const),
              position: imgIndex,
            })),
          },
        })),
      },
    },
  });

  revalidatePath("/dashboard/produits");
  revalidatePath("/dashboard");
  revalidatePath("/boutique");
  redirect("/dashboard/produits?created=1");
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

  const currentProduct = await prisma.product.findUnique({ where: { id: productId } });
  const slug = parsed.data.slug
    ? await uniqueSlug(parsed.data.slug, productId)
    : currentProduct?.slug ?? (await uniqueSlug(parsed.data.name, productId));

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: productId },
      data: {
        name: parsed.data.name,
        slug,
        categoryId: parsed.data.categoryId,
        description: parsed.data.description,
        specs: parsed.data.specs,
        featured: parsed.data.featured ?? false,
        status: parsed.data.status,
        tags: parsed.data.tags || null,
        seoTitle: parsed.data.seoTitle || null,
        seoDescription: parsed.data.seoDescription || null,
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
        data: v.images.map((img, imgIndex) => ({
          url: img.url,
          type: img.isPrimary ? ("PRIMARY" as const) : ("GALLERY" as const),
          position: imgIndex,
          variantId: variant.id,
        })),
      });
    }
  });

  revalidatePath("/dashboard/produits");
  revalidatePath("/dashboard");
  revalidatePath("/boutique");
  revalidatePath(`/boutique/${slug}`);
  redirect("/dashboard/produits?updated=1");
}

export async function duplicateProductAction(productId: string) {
  await requireMerchant();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { variants: { include: { images: true } } },
  });
  if (!product) redirect("/dashboard/produits");

  const slug = await uniqueSlug(`${product.name}-copie`);

  await prisma.product.create({
    data: {
      name: `${product.name} (copie)`,
      slug,
      categoryId: product.categoryId,
      description: product.description,
      specs: product.specs,
      featured: false,
      status: "DRAFT",
      tags: product.tags,
      variants: {
        create: product.variants.map((v, i) => ({
          sku: `${v.sku}-COPY-${Date.now()}${i}`,
          colorName: v.colorName,
          colorHex: v.colorHex,
          storage: v.storage,
          price: v.price,
          compareAtPrice: v.compareAtPrice,
          stock: 0,
          position: i,
          images: {
            create: v.images.map((img) => ({ url: img.url, type: img.type, position: img.position })),
          },
        })),
      },
    },
  });

  revalidatePath("/dashboard/produits");
  redirect("/dashboard/produits?duplicated=1");
}

export async function archiveProductAction(productId: string) {
  await requireMerchant();
  await prisma.product.update({ where: { id: productId }, data: { status: "ARCHIVED" } });
  revalidatePath("/dashboard/produits");
  revalidatePath("/boutique");
  redirect("/dashboard/produits?archived=1");
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
