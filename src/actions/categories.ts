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
}

const categorySchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  parentId: z.string().optional(),
  active: z.coerce.boolean().optional(),
});

export type CategoryFormState = { error?: string } | undefined;

function parseForm(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || undefined,
    image: formData.get("image") || undefined,
    parentId: formData.get("parentId") || undefined,
    active: formData.get("active") === "on",
  });
}

async function uniqueSlug(base: string, ignoreId?: string) {
  const baseSlug = slugify(base);
  let slug = baseSlug || "categorie";
  let counter = 1;
  while (true) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${baseSlug}-${counter++}`;
  }
}

export async function createCategoryAction(
  _prev: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requireMerchant();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Champs invalides" };

  const slug = await uniqueSlug(parsed.data.slug || parsed.data.name);
  const count = await prisma.category.count();

  await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description || null,
      image: parsed.data.image || null,
      parentId: parsed.data.parentId || null,
      active: parsed.data.active ?? true,
      position: count,
    },
  });

  revalidatePath("/dashboard/categories");
  revalidatePath("/boutique");
  redirect("/dashboard/categories?created=1");
}

export async function updateCategoryAction(
  categoryId: string,
  _prev: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requireMerchant();
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Champs invalides" };

  if (parsed.data.parentId === categoryId) {
    return { error: "Une catégorie ne peut pas être son propre parent" };
  }

  const current = await prisma.category.findUnique({ where: { id: categoryId } });
  const slug = parsed.data.slug
    ? await uniqueSlug(parsed.data.slug, categoryId)
    : current?.slug ?? (await uniqueSlug(parsed.data.name, categoryId));

  await prisma.category.update({
    where: { id: categoryId },
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description || null,
      image: parsed.data.image || null,
      parentId: parsed.data.parentId || null,
      active: parsed.data.active ?? true,
    },
  });

  revalidatePath("/dashboard/categories");
  revalidatePath("/boutique");
  redirect("/dashboard/categories?updated=1");
}

export async function deleteCategoryAction(categoryId: string) {
  await requireMerchant();

  const [productCount, childCount] = await Promise.all([
    prisma.product.count({ where: { categoryId } }),
    prisma.category.count({ where: { parentId: categoryId } }),
  ]);

  if (productCount > 0) {
    redirect("/dashboard/categories?error=has-products");
  }
  if (childCount > 0) {
    redirect("/dashboard/categories?error=has-children");
  }

  await prisma.category.delete({ where: { id: categoryId } });
  revalidatePath("/dashboard/categories");
  redirect("/dashboard/categories?deleted=1");
}
