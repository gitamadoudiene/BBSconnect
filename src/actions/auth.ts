"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { customerPassword, fakeVerify, hashPassword, verifyPassword } from "@/lib/password";
import { clearSessionCookie, setSessionCookie } from "@/lib/session";
import { clientInfo } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().trim().email("Adresse email invalide").max(200),
  password: z.string().min(1, "Mot de passe requis").max(128),
});

const registerSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(80),
  email: z.string().trim().email("Adresse email invalide").max(200),
  phone: z.string().trim().max(30).optional(),
  password: customerPassword,
});

export type AuthState = { error?: string } | undefined;

/** Brute-force limits. */
const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILS_PER_IP = 10;
const MAX_FAILS_PER_ACCOUNT = 5;
const LOCK_MS = 15 * 60 * 1000;

const GENERIC_ERROR = "Email ou mot de passe incorrect";

/** Only same-site paths: "/x" yes, "//evil.com" or "/\evil.com" no. */
function safeRedirect(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  return value;
}

function minutesLeft(until: Date) {
  return Math.max(1, Math.ceil((until.getTime() - Date.now()) / 60000));
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Champs invalides" };
  }

  const email = parsed.data.email.toLowerCase();
  const { ip, userAgent } = await clientInfo();
  const since = new Date(Date.now() - WINDOW_MS);

  const ipFails = await prisma.loginAttempt.count({
    where: { ip, success: false, createdAt: { gte: since } },
  });
  if (ipFails >= MAX_FAILS_PER_IP) {
    return { error: "Trop de tentatives depuis cette connexion. Réessayez dans 15 minutes." };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user?.lockedUntil && user.lockedUntil > new Date()) {
    await prisma.loginAttempt.create({ data: { email, ip, userAgent, success: false } });
    return {
      error: `Compte temporairement verrouillé après plusieurs essais. Réessayez dans ${minutesLeft(user.lockedUntil)} min.`,
    };
  }

  const valid = user
    ? await verifyPassword(parsed.data.password, user.password)
    : await fakeVerify(parsed.data.password);

  if (!user || !valid) {
    await prisma.loginAttempt.create({ data: { email, ip, userAgent, success: false } });
    if (user) {
      const fails = user.failedLogins + 1;
      await prisma.user.update({
        where: { id: user.id },
        data:
          fails >= MAX_FAILS_PER_ACCOUNT
            ? { failedLogins: 0, lockedUntil: new Date(Date.now() + LOCK_MS) }
            : { failedLogins: fails },
      });
      if (fails >= MAX_FAILS_PER_ACCOUNT) {
        return { error: "Trop d'essais : le compte est verrouillé pendant 15 minutes." };
      }
    }
    return { error: GENERIC_ERROR };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() },
    }),
    prisma.loginAttempt.create({ data: { email, ip, userAgent, success: true } }),
    prisma.loginAttempt.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } },
    }),
  ]);

  await setSessionCookie(user);

  const redirectTo = safeRedirect(formData.get("redirect"));
  if (redirectTo && (user.role === "MERCHANT" || !redirectTo.startsWith("/dashboard"))) {
    redirect(redirectTo);
  }
  redirect(user.role === "MERCHANT" ? "/dashboard" : "/");
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Champs invalides" };
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Un compte existe déjà avec cet email" };

  const password = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      password,
      phone: parsed.data.phone || null,
      role: "CUSTOMER",
    },
  });

  await setSessionCookie(user);
  redirect("/");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/connexion");
}
