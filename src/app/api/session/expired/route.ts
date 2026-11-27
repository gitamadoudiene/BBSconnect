import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

/** A signed but revoked session (password changed, signed out everywhere):
 *  drop the cookie and send the user back to the sign-in page. */
export function GET(request: NextRequest) {
  const url = new URL("/connexion", request.url);
  url.searchParams.set("expired", "1");
  url.searchParams.set("redirect", "/dashboard");
  const res = NextResponse.redirect(url);
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
