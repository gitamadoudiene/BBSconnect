import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { AnalyticsEventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const id = z.string().regex(/^[a-zA-Z0-9-]{8,64}$/);

const schema = z.object({
  type: z.enum(["PAGE_VIEW", "ADD_TO_CART"]),
  path: z.string().startsWith("/").max(300),
  visitorId: id,
  sessionId: id,
  productSlug: z.string().max(200).optional(),
  value: z.number().int().min(0).max(100_000_000).optional(),
  referrer: z.string().max(500).optional(),
});

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|facebookexternalhit|whatsapp|vercel-screenshot/i;

function device(ua: string) {
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(ua)) return "mobile";
  return "desktop";
}

function referrerHost(value: string | undefined, ownHost: string | null) {
  if (!value) return null;
  try {
    const host = new URL(value).hostname.replace(/^www\./, "");
    if (ownHost && host === ownHost.replace(/^www\./, "").split(":")[0]) return null;
    return host.slice(0, 100);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT.test(ua)) return new NextResponse(null, { status: 204 });

  let body: unknown;
  try {
    body = JSON.parse(await request.text());
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return new NextResponse(null, { status: 400 });
  const e = parsed.data;
  const path = e.path.split("?")[0]!;
  if (path.startsWith("/dashboard") || path.startsWith("/api")) return new NextResponse(null, { status: 204 });

  const common = {
    visitorId: e.visitorId,
    sessionId: e.sessionId,
    path,
    device: device(ua),
    country: request.headers.get("x-vercel-ip-country")?.slice(0, 2) ?? null,
  };

  // A product page view also counts as a product view; /checkout as a checkout start.
  const slug = e.productSlug ?? /^\/boutique\/([^/]+)$/.exec(path)?.[1];
  const product = slug ? await prisma.product.findUnique({ where: { slug }, select: { id: true } }) : null;

  const events: { type: AnalyticsEventType; productId?: string | null; value?: number | null; referrer?: string | null }[] = [];
  if (e.type === "PAGE_VIEW") {
    events.push({ type: "PAGE_VIEW", referrer: referrerHost(e.referrer, request.headers.get("host")) });
    if (product) events.push({ type: "PRODUCT_VIEW", productId: product.id });
    if (path === "/checkout") events.push({ type: "BEGIN_CHECKOUT" });
  } else {
    events.push({ type: "ADD_TO_CART", productId: product?.id ?? null, value: e.value ?? null });
  }

  await prisma.analyticsEvent.createMany({ data: events.map((ev) => ({ ...common, ...ev })) });
  return new NextResponse(null, { status: 204 });
}
