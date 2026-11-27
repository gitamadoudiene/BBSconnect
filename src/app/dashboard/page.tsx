import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Package,
  PackageX,
  Plus,
  ReceiptText,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import clsx from "clsx";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/format";
import { getPeriodRange, percentChange, periodLabels, resolvePeriod } from "@/lib/period";
import { PeriodFilter } from "@/components/dashboard/PeriodFilter";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RevenueChart, type RevenuePoint } from "@/components/dashboard/RevenueChart";
import { CardTitle, EmptyState, OrderBadge, PageHeader } from "@/components/dashboard/ui";
import { ORDER_STATUSES, orderStatusLabel, orderStatusTone } from "@/lib/orderStatus";
import { getMerchant } from "@/lib/auth";

export const dynamic = "force-dynamic";

function dayLabel(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}
function monthLabel(d: Date) {
  return d.toLocaleDateString("fr-FR", { month: "short" });
}

export default async function DashboardOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string }>;
}) {
  const { periode } = await searchParams;
  const period = resolvePeriod(periode);
  const { start, end, prevStart, prevEnd, groupBy } = getPeriodRange(period);

  const [ordersCurrent, ordersPrevious, productCount, recentOrders, statusCounts, itemsCurrent, lowStock, criticalStock, missingImageVariants] =
    await Promise.all([
      prisma.order.findMany({
        where: { status: { not: "CANCELLED" }, createdAt: { gte: start, lte: end } },
        select: { id: true, total: true, createdAt: true, customerEmail: true },
      }),
      prisma.order.findMany({
        where: { status: { not: "CANCELLED" }, createdAt: { gte: prevStart, lt: prevEnd } },
        select: { id: true, total: true },
      }),
      prisma.product.count(),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.orderItem.findMany({
        where: { order: { createdAt: { gte: start, lte: end }, status: { not: "CANCELLED" } } },
        include: { variant: { include: { product: true } } },
      }),
      prisma.productVariant.findMany({
        where: { stock: { gt: 2, lte: 5 } },
        include: { product: true },
        take: 5,
      }),
      prisma.productVariant.findMany({
        where: { stock: { lte: 2 } },
        include: { product: true },
        take: 5,
      }),
      prisma.productVariant.findMany({
        where: { images: { none: { type: "PRIMARY" } } },
        include: { product: true },
        distinct: ["productId"],
      }),
    ]);

  const revenue = ordersCurrent.reduce((s, o) => s + o.total, 0);
  const revenuePrev = ordersPrevious.reduce((s, o) => s + o.total, 0);
  const uniqueCustomers = new Set(ordersCurrent.map((o) => o.customerEmail)).size;

  // Revenue chart buckets
  const buckets = new Map<string, RevenuePoint>();
  if (groupBy === "day") {
    const cursor = new Date(start);
    while (cursor <= end) {
      buckets.set(cursor.toDateString(), { label: dayLabel(cursor), revenue: 0, orders: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    for (const o of ordersCurrent) {
      const key = new Date(o.createdAt).toDateString();
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.revenue += o.total;
        bucket.orders += 1;
      }
    }
  } else {
    const cursor = new Date(start);
    while (cursor <= end) {
      buckets.set(`${cursor.getFullYear()}-${cursor.getMonth()}`, { label: monthLabel(cursor), revenue: 0, orders: 0 });
      cursor.setMonth(cursor.getMonth() + 1);
    }
    for (const o of ordersCurrent) {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const bucket = buckets.get(key);
      if (bucket) {
        bucket.revenue += o.total;
        bucket.orders += 1;
      }
    }
  }
  const chartData = Array.from(buckets.values());

  // Top products in period
  const byProduct = new Map<string, { name: string; slug: string; qty: number; revenue: number }>();
  for (const item of itemsCurrent) {
    const p = item.variant.product;
    const entry = byProduct.get(p.id) ?? { name: p.name, slug: p.slug, qty: 0, revenue: 0 };
    entry.qty += item.quantity;
    entry.revenue += item.price * item.quantity;
    byProduct.set(p.id, entry);
  }
  const topProducts = Array.from(byProduct.values()).sort((a, b) => b.qty - a.qty).slice(0, 5);

  const maxStatusCount = Math.max(1, ...statusCounts.map((s) => s._count._all));
  const revenueChange = percentChange(revenue, revenuePrev);
  const ordersChange = percentChange(ordersCurrent.length, ordersPrevious.length);

  const alerts = [
    ...criticalStock.map((v) => ({
      level: "danger" as const,
      text: `${v.product.name} (${v.colorName}${v.storage ? ` · ${v.storage}` : ""}) — stock critique : ${v.stock} unité${v.stock > 1 ? "s" : ""}`,
      href: "/dashboard/produits?stock=low",
    })),
    ...lowStock.map((v) => ({
      level: "warning" as const,
      text: `${v.product.name} (${v.colorName}${v.storage ? ` · ${v.storage}` : ""}) — stock faible : ${v.stock} unités`,
      href: "/dashboard/produits?stock=low",
    })),
    ...(missingImageVariants.length > 0
      ? [
          {
            level: "warning" as const,
            text: `${missingImageVariants.length} produit${missingImageVariants.length > 1 ? "s" : ""} sans image principale`,
            href: "/dashboard/produits",
          },
        ]
      : []),
    ...(revenueChange !== null && revenueChange > 0
      ? [{ level: "success" as const, text: `Chiffre d'affaires en hausse de ${revenueChange.toFixed(1)} % sur la période`, href: "/dashboard" }]
      : []),
  ].slice(0, 6);

  const alertStyles = {
    danger: { icon: PackageX, className: "bg-db-danger-tint text-db-danger" },
    warning: { icon: AlertTriangle, className: "bg-signal-tint text-signal-deep" },
    success: { icon: CheckCircle2, className: "bg-db-success-tint text-db-success" },
  };

  const merchant = await getMerchant();
  const firstName = merchant?.name.split(" ")[0] ?? "";
  const hour = Number(new Date().toLocaleString("en-GB", { hour: "2-digit", hour12: false, timeZone: "Africa/Dakar" }));
  const greeting = hour < 18 ? "Bonjour" : "Bonsoir";
  const averageBasket = ordersCurrent.length ? Math.round(revenue / ordersCurrent.length) : 0;
  const countByStatus = new Map(statusCounts.map((s) => [s.status, s._count._all]));
  const totalOrders = statusCounts.reduce((sum, s) => sum + s._count._all, 0);

  return (
    <div>
      <PageHeader
        eyebrow={`Vue d'ensemble · ${periodLabels[period]}`}
        title={`${greeting}${firstName ? ` ${firstName}` : ""}.`}
        description="Voici où en est votre boutique."
      >
        <PeriodFilter active={period} />
      </PageHeader>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Chiffre d'affaires" value={formatFCFA(revenue)} change={revenueChange} icon={TrendingUp} />
        <KpiCard label="Commandes" value={ordersCurrent.length.toString()} change={ordersChange} icon={ShoppingBag} />
        <KpiCard label="Panier moyen" value={averageBasket ? formatFCFA(averageBasket) : "—"} icon={ReceiptText} hint="sur la période" />
        <KpiCard label="Clients" value={uniqueCustomers.toString()} icon={Users} hint="ayant commandé sur la période" />
      </div>

      {alerts.length > 0 && (
        <div className="db-card mb-4 p-6">
          <CardTitle>À surveiller</CardTitle>
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {alerts.map((a, i) => {
              const style = alertStyles[a.level];
              return (
                <li key={i}>
                  <Link
                    href={a.href}
                    className="group flex items-center gap-3 rounded-[14px] border border-line px-3.5 py-3 text-[13.5px] transition-colors hover:border-ink"
                  >
                    <span className={clsx("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", style.className)}>
                      <style.icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-ink">{a.text}</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="db-card p-6">
          <CardTitle action={<span className="font-mono text-[11px] text-slate">F CFA</span>}>Chiffre d&apos;affaires</CardTitle>
          <div className="relative">
            <RevenueChart data={chartData} />
            {chartData.every((d) => d.revenue === 0) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-[16px] border border-line bg-white px-5 py-4 text-center">
                  <p className="text-[14px] font-semibold text-ink">Aucune vente sur cette période</p>
                  {period !== "year" && (
                    <Link href="/dashboard?periode=year" className="mt-1 inline-flex items-center gap-1 text-[13px] font-semibold text-accent">
                      <span className="link-underline">Voir toute l&apos;année</span> <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="db-card p-6">
          <CardTitle>Meilleures ventes</CardTitle>
          {topProducts.length === 0 ? (
            <p className="flex h-[240px] items-center justify-center rounded-[16px] bg-paper text-center text-[13.5px] text-slate">
              Pas encore de ventes sur cette période.
            </p>
          ) : (
            <ol className="divide-y divide-line">
              {topProducts.map((p, i) => (
                <li key={p.slug}>
                  <Link href={`/boutique/${p.slug}`} target="_blank" className="group flex items-center gap-3 py-3">
                    <span className="w-5 font-mono text-[12px] text-slate">0{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 text-[14px] font-semibold tracking-[-0.01em] text-ink group-hover:text-accent">{p.name}</span>
                      <span className="font-mono text-[11.5px] text-slate">{p.qty} vendu{p.qty > 1 ? "s" : ""}</span>
                    </span>
                    <span className="tabular shrink-0 text-[13.5px] font-semibold text-ink">{formatFCFA(p.revenue)}</span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="db-card overflow-hidden">
          <div className="px-6 pt-6">
            <CardTitle
              action={
                <Link href="/dashboard/commandes" className="group inline-flex items-center gap-1 text-[13px] font-semibold text-ink">
                  <span className="link-underline">Toutes les commandes</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              }
            >
              Commandes récentes
            </CardTitle>
          </div>
          {recentOrders.length === 0 ? (
            <EmptyState icon={ShoppingBag} title="Aucune commande pour le moment" text="Les commandes passées sur la boutique arriveront ici." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13.5px]">
                <thead>
                  <tr className="border-y border-line bg-paper/60 text-left">
                    <th className="db-th px-6 py-3">Référence</th>
                    <th className="db-th px-4 py-3">Client</th>
                    <th className="db-th px-4 py-3">Statut</th>
                    <th className="db-th px-6 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-line last:border-0 hover:bg-paper/50">
                      <td className="px-6 py-3.5">
                        <Link href={`/dashboard/commandes/${o.id}`} className="font-mono text-[12.5px] font-medium text-accent hover:underline">
                          {o.reference}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-ink">{o.customerName}</td>
                      <td className="px-4 py-3.5"><OrderBadge status={o.status} /></td>
                      <td className="tabular px-6 py-3.5 text-right font-semibold text-ink">{formatFCFA(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="db-card p-6">
            <CardTitle action={<span className="tabular font-mono text-[11.5px] text-slate">{totalOrders} au total</span>}>
              Commandes par statut
            </CardTitle>
            <ul className="space-y-3.5">
              {ORDER_STATUSES.map((status) => {
                const count = countByStatus.get(status) ?? 0;
                return (
                  <li key={status}>
                    <Link href={`/dashboard/commandes?status=${status}`} className="group block">
                      <span className="mb-1.5 flex items-center justify-between text-[13px]">
                        <span className="flex items-center gap-2 text-ink group-hover:text-accent">
                          <span className={clsx("h-2 w-2 rounded-full", orderStatusTone[status].dot)} />
                          {orderStatusLabel[status]}
                        </span>
                        <span className="tabular font-mono text-[12px] text-slate">{count}</span>
                      </span>
                      <span className="block h-1.5 w-full overflow-hidden rounded-full bg-paper">
                        <span
                          className={clsx("block h-full rounded-full", orderStatusTone[status].dot)}
                          style={{ width: `${(count / maxStatusCount) * 100}%` }}
                        />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex flex-1 flex-col justify-between gap-6 rounded-[22px] bg-ink p-6 text-white">
            <div className="flex items-start justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/50">Catalogue</p>
              <Package className="h-5 w-5 text-white/50" strokeWidth={1.6} />
            </div>
            <div>
              <p className="tabular text-[40px] font-bold leading-none tracking-[-0.05em]">{productCount}</p>
              <p className="mt-1 text-[13.5px] text-white/60">produits en ligne ou en brouillon</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard/produits/nouveau" className="btn btn-inverse btn-sm">
                <Plus className="h-4 w-4" /> Ajouter
              </Link>
              <Link href="/dashboard/produits" className="btn btn-ghost-light btn-sm">
                Gérer <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
