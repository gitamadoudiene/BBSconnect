import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ImageOff,
  PackageX,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";
import clsx from "clsx";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/format";
import { getPeriodRange, percentChange, resolvePeriod } from "@/lib/period";
import { PeriodFilter } from "@/components/dashboard/PeriodFilter";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { RevenueChart, type RevenuePoint } from "@/components/dashboard/RevenueChart";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  PROCESSING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-indigo-100 text-indigo-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

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
    danger: { icon: PackageX, className: "border-db-danger/20 bg-db-danger-tint text-db-danger" },
    warning: { icon: AlertTriangle, className: "border-db-warning/20 bg-db-warning-tint text-db-warning" },
    success: { icon: CheckCircle2, className: "border-db-success/20 bg-db-success-tint text-db-success" },
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-db-muted">
          Bonjour 👋 — voici les performances de votre boutique.
        </p>
        <PeriodFilter active={period} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Chiffre d'affaires" value={formatFCFA(revenue)} change={revenueChange} icon={TrendingUp} />
        <KpiCard label="Commandes" value={ordersCurrent.length.toString()} change={ordersChange} icon={ShoppingBag} />
        <KpiCard label="Clients (période)" value={uniqueCustomers.toString()} icon={Users} />
        <div className="rounded-xl border border-dashed border-db-border bg-db-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-[12.5px] font-medium text-db-muted">Visiteurs</p>
            <Users className="h-4 w-4 text-db-muted" />
          </div>
          <p className="mt-2 text-[15px] font-medium text-db-muted">Pas encore de données</p>
          <p className="mt-2.5 text-[12px] text-db-muted">
            Le suivi des visiteurs arrive avec le module Analytics.
          </p>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="mb-6 rounded-xl border border-db-border bg-db-card p-5">
          <h2 className="mb-3 text-[13px] font-semibold text-db-text">À surveiller</h2>
          <div className="space-y-2">
            {alerts.map((a, i) => {
              const style = alertStyles[a.level];
              return (
                <Link
                  key={i}
                  href={a.href}
                  className={clsx("flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-[13px] transition hover:opacity-80", style.className)}
                >
                  <style.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-db-text">{a.text}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border border-db-border bg-db-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-db-text">Chiffre d&apos;affaires</h2>
            <span className="text-[12px] text-db-muted">FCFA</span>
          </div>
          {chartData.every((d) => d.revenue === 0) ? (
            <div className="flex h-[260px] items-center justify-center text-[13px] text-db-muted">
              Aucune vente sur cette période.
            </div>
          ) : (
            <RevenueChart data={chartData} />
          )}
        </div>

        <div className="rounded-xl border border-db-border bg-db-card p-6">
          <h2 className="mb-4 text-[13px] font-semibold text-db-text">Produits les plus vendus</h2>
          {topProducts.length === 0 ? (
            <p className="py-6 text-center text-[13px] text-db-muted">Pas encore de ventes sur cette période.</p>
          ) : (
            <ul className="space-y-3.5">
              {topProducts.map((p) => (
                <li key={p.slug} className="flex items-center justify-between gap-3">
                  <Link href={`/boutique/${p.slug}`} target="_blank" className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-[13px] font-medium text-db-text">{p.name}</p>
                    <p className="text-[11.5px] text-db-muted">{p.qty} vendu{p.qty > 1 ? "s" : ""}</p>
                  </Link>
                  <span className="shrink-0 text-[13px] font-semibold text-db-text">{formatFCFA(p.revenue)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border border-db-border bg-db-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-db-text">Commandes récentes</h2>
            <Link href="/dashboard/commandes" className="text-[12.5px] font-semibold text-accent hover:underline">
              Tout voir
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="py-8 text-center text-[13px] text-db-muted">Aucune commande pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-db-border text-left text-[11px] uppercase tracking-wide text-db-muted">
                    <th className="pb-2 pr-4">Référence</th>
                    <th className="pb-2 pr-4">Client</th>
                    <th className="pb-2 pr-4">Statut</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-db-border/60 last:border-0">
                      <td className="py-2.5 pr-4">
                        <Link href={`/dashboard/commandes/${o.id}`} className="font-medium text-accent hover:underline">
                          {o.reference}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4 text-db-text">{o.customerName}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusColors[o.status]}`}>
                          {statusLabels[o.status]}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-semibold text-db-text">{formatFCFA(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-db-border bg-db-card p-6">
            <h2 className="mb-4 text-[13px] font-semibold text-db-text">Commandes par statut</h2>
            <div className="space-y-3">
              {statusCounts.map((s) => (
                <div key={s.status}>
                  <div className="mb-1 flex justify-between text-[11.5px] text-db-muted">
                    <span>{statusLabels[s.status]}</span>
                    <span>{s._count._all}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-db-bg">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${(s._count._all / maxStatusCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-db-border bg-db-card p-6 text-center">
            <p className="text-[24px] font-semibold text-db-text">{productCount}</p>
            <p className="text-[12.5px] text-db-muted">produits au catalogue</p>
            <Link href="/dashboard/produits" className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-accent hover:underline">
              Gérer le catalogue <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {missingImageVariants.length > 0 && (
        <div className="mt-6 flex items-center gap-2 text-[12px] text-db-muted">
          <ImageOff className="h-3.5 w-3.5" />
          Astuce : ajoutez une image principale à chaque variante pour un rendu optimal sur la boutique.
        </div>
      )}
    </div>
  );
}
