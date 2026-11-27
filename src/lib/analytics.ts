import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPeriodRange, type Period } from "@/lib/period";

const n = (v: unknown) => Number(v ?? 0);

export type SeriesPoint = { label: string; visitors: number; pageViews: number; orders: number };

function bucketLabel(d: Date, unit: "day" | "month") {
  return unit === "day"
    ? d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", timeZone: "UTC" })
    : d.toLocaleDateString("fr-FR", { month: "short", timeZone: "UTC" });
}

export async function getTraffic(period: Period) {
  const { start, end, prevStart, prevEnd, groupBy } = getPeriodRange(period);
  const unit = groupBy;
  const trunc = Prisma.raw(`'${unit}'`);

  const [totals, prev, daily, ordersDaily, newVisitors, bounce] = await Promise.all([
    prisma.$queryRaw<{ visitors: bigint; sessions: bigint; pageviews: bigint }[]>`
      SELECT COUNT(DISTINCT "visitorId") AS visitors, COUNT(DISTINCT "sessionId") AS sessions,
             COUNT(*) FILTER (WHERE type = 'PAGE_VIEW') AS pageviews
      FROM "AnalyticsEvent" WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}`,
    prisma.$queryRaw<{ visitors: bigint; sessions: bigint }[]>`
      SELECT COUNT(DISTINCT "visitorId") AS visitors, COUNT(DISTINCT "sessionId") AS sessions
      FROM "AnalyticsEvent" WHERE "createdAt" >= ${prevStart} AND "createdAt" < ${prevEnd}`,
    prisma.$queryRaw<{ bucket: Date; visitors: bigint; pageviews: bigint }[]>`
      SELECT date_trunc(${trunc}, "createdAt") AS bucket, COUNT(DISTINCT "visitorId") AS visitors,
             COUNT(*) FILTER (WHERE type = 'PAGE_VIEW') AS pageviews
      FROM "AnalyticsEvent" WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
      GROUP BY 1 ORDER BY 1`,
    prisma.$queryRaw<{ bucket: Date; orders: bigint }[]>`
      SELECT date_trunc(${trunc}, "createdAt") AS bucket, COUNT(*) AS orders
      FROM "Order" WHERE status <> 'CANCELLED' AND "createdAt" >= ${start} AND "createdAt" <= ${end}
      GROUP BY 1`,
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*) AS count FROM (
        SELECT "visitorId", MIN("createdAt") AS first FROM "AnalyticsEvent" GROUP BY 1
      ) v WHERE v.first >= ${start} AND v.first <= ${end}`,
    prisma.$queryRaw<{ single: bigint; total: bigint }[]>`
      SELECT COUNT(*) FILTER (WHERE views = 1) AS single, COUNT(*) AS total FROM (
        SELECT "sessionId", COUNT(*) AS views FROM "AnalyticsEvent"
        WHERE type = 'PAGE_VIEW' AND "createdAt" >= ${start} AND "createdAt" <= ${end} GROUP BY 1
      ) s`,
  ]);

  // Zero-filled buckets so the chart always has a full axis.
  const buckets = new Map<string, SeriesPoint>();
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), unit === "day" ? start.getUTCDate() : 1));
  while (cursor <= end) {
    buckets.set(cursor.toISOString(), { label: bucketLabel(cursor, unit), visitors: 0, pageViews: 0, orders: 0 });
    if (unit === "day") cursor.setUTCDate(cursor.getUTCDate() + 1);
    else cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  for (const r of daily) {
    const b = buckets.get(new Date(r.bucket).toISOString());
    if (b) {
      b.visitors = n(r.visitors);
      b.pageViews = n(r.pageviews);
    }
  }
  for (const r of ordersDaily) {
    const b = buckets.get(new Date(r.bucket).toISOString());
    if (b) b.orders = n(r.orders);
  }

  const t = totals[0]!;
  const visitors = n(t.visitors);
  const sessions = n(t.sessions);
  const fresh = n(newVisitors[0]?.count);
  return {
    visitors,
    sessions,
    pageViews: n(t.pageviews),
    prevVisitors: n(prev[0]?.visitors),
    prevSessions: n(prev[0]?.sessions),
    newVisitors: fresh,
    returningVisitors: Math.max(0, visitors - fresh),
    pagesPerSession: sessions ? n(t.pageviews) / sessions : 0,
    bounceRate: n(bounce[0]?.total) ? (n(bounce[0]?.single) / n(bounce[0]?.total)) * 100 : 0,
    series: [...buckets.values()],
  };
}

export async function getBreakdowns(period: Period) {
  const { start, end } = getPeriodRange(period);
  const [pages, referrers, devices, countries, landings, live] = await Promise.all([
    prisma.$queryRaw<{ path: string; views: bigint; visitors: bigint }[]>`
      SELECT path, COUNT(*) AS views, COUNT(DISTINCT "visitorId") AS visitors FROM "AnalyticsEvent"
      WHERE type = 'PAGE_VIEW' AND "createdAt" >= ${start} AND "createdAt" <= ${end}
      GROUP BY 1 ORDER BY 2 DESC LIMIT 10`,
    prisma.$queryRaw<{ source: string; sessions: bigint }[]>`
      SELECT COALESCE(referrer, 'Accès direct') AS source, COUNT(DISTINCT "sessionId") AS sessions FROM "AnalyticsEvent"
      WHERE type = 'PAGE_VIEW' AND "createdAt" >= ${start} AND "createdAt" <= ${end}
      GROUP BY 1 ORDER BY 2 DESC LIMIT 8`,
    prisma.$queryRaw<{ device: string; visitors: bigint }[]>`
      SELECT COALESCE(device, 'desktop') AS device, COUNT(DISTINCT "visitorId") AS visitors FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${start} AND "createdAt" <= ${end} GROUP BY 1 ORDER BY 2 DESC`,
    prisma.$queryRaw<{ country: string; visitors: bigint }[]>`
      SELECT COALESCE(country, '??') AS country, COUNT(DISTINCT "visitorId") AS visitors FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${start} AND "createdAt" <= ${end} GROUP BY 1 ORDER BY 2 DESC LIMIT 6`,
    prisma.$queryRaw<{ path: string; sessions: bigint }[]>`
      SELECT path, COUNT(*) AS sessions FROM (
        SELECT DISTINCT ON ("sessionId") "sessionId", path FROM "AnalyticsEvent"
        WHERE type = 'PAGE_VIEW' AND "createdAt" >= ${start} AND "createdAt" <= ${end}
        ORDER BY "sessionId", "createdAt"
      ) s GROUP BY 1 ORDER BY 2 DESC LIMIT 6`,
    prisma.$queryRaw<{ visitors: bigint }[]>`
      SELECT COUNT(DISTINCT "visitorId") AS visitors FROM "AnalyticsEvent"
      WHERE "createdAt" >= NOW() - INTERVAL '5 minutes'`,
  ]);
  return {
    pages: pages.map((r) => ({ path: r.path, views: n(r.views), visitors: n(r.visitors) })),
    referrers: referrers.map((r) => ({ source: r.source, sessions: n(r.sessions) })),
    devices: devices.map((r) => ({ device: r.device, visitors: n(r.visitors) })),
    countries: countries.map((r) => ({ country: r.country, visitors: n(r.visitors) })),
    landings: landings.map((r) => ({ path: r.path, sessions: n(r.sessions) })),
    live: n(live[0]?.visitors),
  };
}

export async function getFunnel(period: Period) {
  const { start, end } = getPeriodRange(period);
  const [steps, products, orders] = await Promise.all([
    prisma.$queryRaw<{ sessions: bigint; viewed: bigint; carted: bigint; checkout: bigint; purchased: bigint }[]>`
      SELECT COUNT(DISTINCT "sessionId") AS sessions,
             COUNT(DISTINCT "sessionId") FILTER (WHERE type = 'PRODUCT_VIEW') AS viewed,
             COUNT(DISTINCT "sessionId") FILTER (WHERE type = 'ADD_TO_CART') AS carted,
             COUNT(DISTINCT "sessionId") FILTER (WHERE type = 'BEGIN_CHECKOUT') AS checkout,
             COUNT(DISTINCT "sessionId") FILTER (WHERE type = 'PURCHASE') AS purchased
      FROM "AnalyticsEvent" WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}`,
    prisma.$queryRaw<{ productId: string; views: bigint; carts: bigint }[]>`
      SELECT "productId", COUNT(*) FILTER (WHERE type = 'PRODUCT_VIEW') AS views,
             COUNT(*) FILTER (WHERE type = 'ADD_TO_CART') AS carts
      FROM "AnalyticsEvent"
      WHERE "productId" IS NOT NULL AND "createdAt" >= ${start} AND "createdAt" <= ${end}
      GROUP BY 1 ORDER BY 2 DESC LIMIT 12`,
    prisma.order.findMany({
      where: { status: { not: "CANCELLED" }, createdAt: { gte: start, lte: end } },
      select: { total: true, items: { select: { quantity: true, variant: { select: { productId: true } } } } },
    }),
  ]);

  const sold = new Map<string, number>();
  for (const o of orders) for (const i of o.items) sold.set(i.variant.productId, (sold.get(i.variant.productId) ?? 0) + i.quantity);
  const names = await prisma.product.findMany({
    where: { id: { in: products.map((p) => p.productId) } },
    select: { id: true, name: true, slug: true },
  });
  const byId = new Map(names.map((p) => [p.id, p]));

  const s = steps[0]!;
  return {
    steps: [
      { key: "sessions", label: "Visites", hint: "sessions sur le site", value: n(s.sessions) },
      { key: "viewed", label: "Fiche produit vue", hint: "au moins un produit consulté", value: n(s.viewed) },
      { key: "carted", label: "Ajout au panier", hint: "au moins un article ajouté", value: n(s.carted) },
      { key: "checkout", label: "Page de commande", hint: "formulaire de livraison ouvert", value: n(s.checkout) },
      { key: "purchased", label: "Commande passée", hint: "commande validée", value: n(s.purchased) },
    ],
    orders: orders.length,
    revenue: orders.reduce((sum, o) => sum + o.total, 0),
    products: products
      .map((p) => ({
        id: p.productId,
        name: byId.get(p.productId)?.name ?? "Produit supprimé",
        slug: byId.get(p.productId)?.slug ?? null,
        views: n(p.views),
        carts: n(p.carts),
        sold: sold.get(p.productId) ?? 0,
      }))
      .filter((p) => p.views + p.carts > 0),
  };
}

export const deviceLabel: Record<string, string> = { mobile: "Mobile", tablet: "Tablette", desktop: "Ordinateur" };

export function countryName(code: string) {
  if (code === "??") return "Inconnu";
  try {
    return new Intl.DisplayNames(["fr"], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}
