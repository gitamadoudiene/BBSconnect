"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireMerchant } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export type CollectionFormState = { error?: string } | undefined;

const schema = z.object({
  name: z.string().trim().min(2, "Le nom est requis").max(80),
  slug: z.string().trim().max(80).optional(),
  description: z.string().trim().max(300).optional(),
  active: z.boolean(),
  onHome: z.boolean(),
  productIds: z.array(z.string().min(1)).max(60, "60 produits maximum"),
});

function parse(formData: FormData) {
  let productIds: unknown = [];
  try {
    productIds = JSON.parse(String(formData.get("productIds") ?? "[]"));
  } catch {
    productIds = [];
  }
  return schema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug") || undefined,
    description: formData.get("description") || undefined,
    active: formData.get("active") === "on",
    onHome: formData.get("onHome") === "on",
    productIds,
  });
}

async function uniqueSlug(base: string, exceptId?: string) {
  const root = slugify(base) || "collection";
  let slug = root;
  for (let i = 2; ; i++) {
    const clash = await prisma.collection.findFirst({ where: { slug, ...(exceptId ? { id: { not: exceptId } } : {}) } });
    if (!clash) return slug;
    slug = `${root}-${i}`;
  }
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/boutique");
  revalidatePath("/dashboard/collections");
}

export async function createCollectionAction(_prev: CollectionFormState, formData: FormData): Promise<CollectionFormState> {
  await requireMerchant();
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Champs invalides" };
  const { productIds, slug, description, ...rest } = parsed.data;
  const last = await prisma.collection.findFirst({ orderBy: { position: "desc" } });
  await prisma.collection.create({
    data: {
      ...rest,
      description: description ?? null,
      slug: await uniqueSlug(slug || rest.name),
      position: (last?.position ?? -1) + 1,
      products: { create: productIds.map((productId, position) => ({ productId, position })) },
    },
  });
  refresh();
  redirect("/dashboard/collections?saved=1");
}

export async function updateCollectionAction(id: string, _prev: CollectionFormState, formData: FormData): Promise<CollectionFormState> {
  await requireMerchant();
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Champs invalides" };
  const { productIds, slug, description, ...rest } = parsed.data;
  await prisma.$transaction([
    prisma.collection.update({
      where: { id },
      data: { ...rest, description: description ?? null, slug: await uniqueSlug(slug || rest.name, id) },
    }),
    prisma.collectionProduct.deleteMany({ where: { collectionId: id } }),
    prisma.collectionProduct.createMany({
      data: productIds.map((productId, position) => ({ collectionId: id, productId, position })),
      skipDuplicates: true,
    }),
  ]);
  refresh();
  redirect("/dashboard/collections?saved=1");
}

export async function deleteCollectionAction(id: string) {
  await requireMerchant();
  await prisma.collection.delete({ where: { id } });
  refresh();
  redirect("/dashboard/collections?deleted=1");
}
