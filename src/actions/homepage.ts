"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireMerchant } from "@/lib/auth";
import { HOME_SECTIONS } from "@/lib/content";

export type HomeFormState = { error?: string; success?: string } | undefined;

const ids = HOME_SECTIONS.map((s) => s.id) as [string, ...string[]];
const layoutSchema = z
  .array(z.object({ id: z.enum(ids), visible: z.boolean() }))
  .refine((l) => new Set(l.map((s) => s.id)).size === l.length, "Section en double");

export async function saveHomeLayoutAction(_prev: HomeFormState, formData: FormData): Promise<HomeFormState> {
  await requireMerchant();
  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("sections") ?? "[]"));
  } catch {
    return { error: "Mise en page invalide" };
  }
  const parsed = layoutSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Mise en page invalide" };
  if (!parsed.data.some((s) => s.visible)) return { error: "Gardez au moins une section visible" };

  await prisma.siteSetting.upsert({
    where: { key: "homepage" },
    create: { key: "homepage", value: { sections: parsed.data } },
    update: { value: { sections: parsed.data } },
  });
  revalidatePath("/");
  return { success: "Page d'accueil mise à jour." };
}

export async function saveAnnouncementAction(_prev: HomeFormState, formData: FormData): Promise<HomeFormState> {
  await requireMerchant();
  const parsed = z.string().trim().max(140, "140 caractères maximum").safeParse(formData.get("text") ?? "");
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  await prisma.siteSetting.upsert({
    where: { key: "announcement" },
    create: { key: "announcement", value: { text: parsed.data } },
    update: { value: { text: parsed.data } },
  });
  revalidatePath("/", "layout");
  return { success: "Message enregistré." };
}
