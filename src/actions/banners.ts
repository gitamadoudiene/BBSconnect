"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { BannerPlacement } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireMerchant } from "@/lib/auth";
import { DEFAULT_BANNERS, MAX_IMAGES } from "@/lib/content";

export type BannerFormState = { error?: string } | undefined;

const link = z
  .string()
  .trim()
  .min(1, "Le lien est requis")
  .max(300)
  .refine((v) => (v.startsWith("/") && !v.startsWith("//")) || /^https:\/\//.test(v), "Lien invalide : commencez par / ou https://");

const imageSchema = z.object({
  src: z
    .string()
    .trim()
    .min(1)
    .max(500)
    .refine((v) => (v.startsWith("/") && !v.startsWith("//")) || /^https:\/\//.test(v), "Image invalide"),
  alt: z.string().trim().max(120).default(""),
  size: z.enum(["s", "m", "l"]).optional(),
});

const optionalDate = z
  .string()
  .optional()
  .transform((v) => (v ? new Date(v) : null))
  .refine((d) => d === null || !Number.isNaN(d.getTime()), "Date invalide");

const schema = z
  .object({
    placement: z.enum(["HERO", "TILE"]),
    eyebrow: z.string().trim().min(1, "Le surtitre est requis").max(60),
    title: z.string().trim().min(1, "Le titre est requis").max(90),
    text: z.string().trim().max(300).optional(),
    ctaLabel: z.string().trim().max(40).optional(),
    href: link,
    tag: z.string().trim().max(24).optional(),
    theme: z.string(),
    images: z.array(imageSchema),
    showPrice: z.boolean(),
    active: z.boolean(),
    startsAt: optionalDate,
    endsAt: optionalDate,
  })
  .superRefine((v, ctx) => {
    const themes = v.placement === "HERO" ? ["orange", "blue", "ink"] : ["sky", "paper", "peach", "ink"];
    if (!themes.includes(v.theme)) ctx.addIssue({ code: "custom", message: "Couleur invalide", path: ["theme"] });
    if (v.images.length > MAX_IMAGES[v.placement])
      ctx.addIssue({ code: "custom", message: `${MAX_IMAGES[v.placement]} images maximum`, path: ["images"] });
    if (v.placement === "HERO" && v.images.length === 0)
      ctx.addIssue({ code: "custom", message: "Ajoutez au moins une image de produit", path: ["images"] });
    if (v.images.some((i) => !i.alt))
      ctx.addIssue({ code: "custom", message: "Décrivez chaque image (texte alternatif)", path: ["images"] });
    if (v.startsAt && v.endsAt && v.endsAt <= v.startsAt)
      ctx.addIssue({ code: "custom", message: "La fin doit être après le début", path: ["endsAt"] });
  });

function parse(formData: FormData) {
  let images: unknown = [];
  try {
    images = JSON.parse(String(formData.get("images") ?? "[]"));
  } catch {
    images = [];
  }
  return schema.safeParse({
    placement: formData.get("placement"),
    eyebrow: formData.get("eyebrow"),
    title: formData.get("title"),
    text: formData.get("text") || undefined,
    ctaLabel: formData.get("ctaLabel") || undefined,
    href: formData.get("href"),
    tag: formData.get("tag") || undefined,
    theme: formData.get("theme"),
    images,
    showPrice: formData.get("showPrice") === "on",
    active: formData.get("active") === "on",
    startsAt: formData.get("startsAt") || undefined,
    endsAt: formData.get("endsAt") || undefined,
  });
}

function refresh() {
  revalidatePath("/");
  revalidatePath("/dashboard/bannieres");
}

export async function createBannerAction(_prev: BannerFormState, formData: FormData): Promise<BannerFormState> {
  await requireMerchant();
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Champs invalides" };
  const { text, ctaLabel, tag, ...rest } = parsed.data;
  const last = await prisma.banner.findFirst({ where: { placement: rest.placement }, orderBy: { position: "desc" } });
  await prisma.banner.create({
    data: { ...rest, text: text ?? null, ctaLabel: ctaLabel ?? null, tag: tag ?? null, position: (last?.position ?? -1) + 1 },
  });
  refresh();
  redirect("/dashboard/bannieres?saved=1");
}

export async function updateBannerAction(id: string, _prev: BannerFormState, formData: FormData): Promise<BannerFormState> {
  await requireMerchant();
  const parsed = parse(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Champs invalides" };
  const { text, ctaLabel, tag, ...rest } = parsed.data;
  await prisma.banner.update({
    where: { id },
    data: { ...rest, text: text ?? null, ctaLabel: ctaLabel ?? null, tag: tag ?? null },
  });
  refresh();
  redirect("/dashboard/bannieres?saved=1");
}

export async function deleteBannerAction(id: string) {
  await requireMerchant();
  await prisma.banner.delete({ where: { id } });
  refresh();
  redirect("/dashboard/bannieres?deleted=1");
}

export async function toggleBannerAction(id: string) {
  await requireMerchant();
  const b = await prisma.banner.findUnique({ where: { id }, select: { active: true } });
  if (!b) return;
  await prisma.banner.update({ where: { id }, data: { active: !b.active } });
  refresh();
}

export async function moveBannerAction(id: string, direction: -1 | 1) {
  await requireMerchant();
  const b = await prisma.banner.findUnique({ where: { id } });
  if (!b) return;
  const siblings = await prisma.banner.findMany({ where: { placement: b.placement }, orderBy: { position: "asc" } });
  const i = siblings.findIndex((s) => s.id === id);
  const j = i + direction;
  if (j < 0 || j >= siblings.length) return;
  const order = [...siblings];
  [order[i], order[j]] = [order[j]!, order[i]!];
  await prisma.$transaction(order.map((s, pos) => prisma.banner.update({ where: { id: s.id }, data: { position: pos } })));
  refresh();
}

/** Copies the launch banners into the database so they become editable. */
export async function importDefaultBannersAction(placement: BannerPlacement) {
  await requireMerchant();
  const existing = await prisma.banner.count({ where: { placement } });
  if (existing === 0) {
    await prisma.banner.createMany({
      data: DEFAULT_BANNERS.filter((b) => b.placement === placement).map((b) => ({ ...b, images: b.images })),
    });
  }
  refresh();
  redirect("/dashboard/bannieres?imported=1");
}
