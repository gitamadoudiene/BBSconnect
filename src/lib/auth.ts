import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

/**
 * Full session check against the database: the account still exists, is a
 * merchant, and the token's version matches (so a password change or
 * "sign out everywhere" kills old sessions immediately).
 * Cached per request.
 */
export const getMerchant = cache(async () => {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      sessionVersion: true,
      lastLoginAt: true,
      passwordChangedAt: true,
      createdAt: true,
    },
  });
  if (!user || user.role !== "MERCHANT") return null;
  if ((session.ver ?? 0) !== user.sessionVersion) return null;
  return user;
});

export async function requireMerchant() {
  const user = await getMerchant();
  if (!user) redirect("/connexion?redirect=/dashboard");
  return user;
}

export async function clientInfo() {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const userAgent = h.get("user-agent")?.slice(0, 300) ?? null;
  return { ip, userAgent };
}
