"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireMerchant } from "@/lib/auth";
import { hashPassword, strongPassword, verifyPassword } from "@/lib/password";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";

export type FormState = { error?: string; success?: string } | undefined;
/** Kept for existing imports. */
export type ProfileFormState = FormState;

const profileSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(80),
  phone: z.string().trim().max(30).optional(),
});

export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const merchant = await requireMerchant();

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Champs invalides" };
  }

  const updated = await prisma.user.update({
    where: { id: merchant.id },
    data: { name: parsed.data.name, phone: parsed.data.phone || null },
  });
  await setSessionCookie(updated);

  revalidatePath("/dashboard", "layout");
  return { success: "Profil mis à jour." };
}

/** Re-check the current password before any sensitive change. */
async function confirmPassword(userId: string, password: FormDataEntryValue | null) {
  if (typeof password !== "string" || !password) return false;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } });
  return Boolean(user && (await verifyPassword(password, user.password)));
}

const passwordSchema = z
  .object({ next: strongPassword, confirm: z.string() })
  .refine((v) => v.next === v.confirm, { message: "Les deux mots de passe ne correspondent pas" });

export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const merchant = await requireMerchant();

  if (!(await confirmPassword(merchant.id, formData.get("current")))) {
    return { error: "Mot de passe actuel incorrect" };
  }
  const parsed = passwordSchema.safeParse({ next: formData.get("next"), confirm: formData.get("confirm") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Mot de passe invalide" };
  }
  if (await confirmPassword(merchant.id, parsed.data.next)) {
    return { error: "Choisissez un mot de passe différent de l'actuel" };
  }

  // New hash + bumped version: every other device is signed out, this one is re-issued.
  const updated = await prisma.user.update({
    where: { id: merchant.id },
    data: {
      password: await hashPassword(parsed.data.next),
      passwordChangedAt: new Date(),
      sessionVersion: { increment: 1 },
    },
  });
  await setSessionCookie(updated);

  revalidatePath("/dashboard/parametres");
  return { success: "Mot de passe modifié. Les autres appareils ont été déconnectés." };
}

const emailSchema = z.object({ email: z.string().trim().email("Adresse email invalide").max(200) });

export async function changeEmailAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const merchant = await requireMerchant();

  if (!(await confirmPassword(merchant.id, formData.get("current")))) {
    return { error: "Mot de passe actuel incorrect" };
  }
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Email invalide" };
  }

  const email = parsed.data.email.toLowerCase();
  if (email === merchant.email) return { error: "C'est déjà votre adresse de connexion" };
  const taken = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (taken) return { error: "Cette adresse est déjà utilisée par un autre compte" };

  const updated = await prisma.user.update({
    where: { id: merchant.id },
    data: { email, sessionVersion: { increment: 1 } },
  });
  await setSessionCookie(updated);

  revalidatePath("/dashboard", "layout");
  return { success: "Adresse de connexion modifiée. Les autres appareils ont été déconnectés." };
}

export async function signOutEverywhereAction(): Promise<void> {
  const merchant = await requireMerchant();
  await prisma.user.update({
    where: { id: merchant.id },
    data: { sessionVersion: { increment: 1 } },
  });
  await clearSessionCookie();
  redirect("/connexion?redirect=/dashboard");
}
