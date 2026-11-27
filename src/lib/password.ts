import bcrypt from "bcryptjs";
import { z } from "zod";

const COST = 12;

export function hashPassword(password: string) {
  return bcrypt.hash(password, COST);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

let dummyHash: Promise<string> | null = null;

/** Burn the same bcrypt time for an unknown email, so timing doesn't reveal which emails exist. */
export async function fakeVerify(password: string) {
  dummyHash ??= bcrypt.hash("bbs-timing-equaliser", COST);
  await bcrypt.compare(password, await dummyHash);
  return false;
}

export const strongPassword = z
  .string()
  .min(10, "Le mot de passe doit contenir au moins 10 caractères")
  .max(128, "Mot de passe trop long")
  .regex(/[a-zA-Z]/, "Le mot de passe doit contenir au moins une lettre")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre");

export const customerPassword = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .max(128, "Mot de passe trop long");
