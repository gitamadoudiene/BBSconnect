import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "bbs_session";

/** Merchant sessions are short; customer sessions stay long for convenience. */
export const SESSION_MAX_AGE = {
  MERCHANT: 60 * 60 * 12,
  CUSTOMER: 60 * 60 * 24 * 30,
} as const;

function getSecret() {
  const raw = process.env.JWT_SECRET;
  if (!raw || raw.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET manquant ou trop court (32 caractères minimum).");
    }
    return new TextEncoder().encode("dev-only-secret-not-for-production-use");
  }
  return new TextEncoder().encode(raw);
}

export type SessionPayload = {
  userId: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "MERCHANT";
  /** Must equal User.sessionVersion for the session to stay valid. */
  ver?: number;
};

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE[payload.role]}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** Signature check only — cheap, used by the proxy and the storefront. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(user: {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "MERCHANT";
  sessionVersion: number;
}) {
  const token = await createSessionToken({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    ver: user.sessionVersion,
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE[user.role],
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
