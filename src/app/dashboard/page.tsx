import Link from "next/link";
import { AlertTriangle, Package, ShoppingBag, TrendingUp, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/format";

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

export default async function DashboardOverviewPage() {
  const [orders, productCount, lowStockCount, customerCount, recentOrders, topItems] =
    await Promise.all([
      prisma.order.findMany({ where: { status: { not: "CANCELLED" } } }),
      prisma.product.count(),
      prisma.product.count({ where: { stock: { lte: 5 } } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      }),
    ]);

  const revenue = orders.reduce((sum, o) => sum + o.total, 0);

  const statusCounts = await prisma.order.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const maxStatusCount = Math.max(1, ...statusCounts.map((s) => s._count._all));

  const topProductIds = topItems.map((t) => t.productId);
  const topProducts = await prisma.product.findMany({ where: { id: { in: topProductIds } } });
  const topProductsWithQty = topItems.map((t) => ({
    product: topProducts.find((p) => p.id === t.productId),
    quantity: t._sum.quantity ?? 0,
  }));

  const stats = [
    { label: "Revenu total", value: formatFCFA(revenue), icon: TrendingUp, accent: "text-emerald-600 bg-emerald-100" },
    { label: "Commandes", value: orders.length.toString(), icon: ShoppingBag, accent: "text-blue-600 bg-blue-100" },
    { label: "Produits", value: productCount.toString(), icon: Package, accent: "text-indigo-600 bg-indigo-100" },
    { label: "Clients", value: customerCount.toString(), icon: Users, accent: "text-purple-600 bg-purple-100" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">Vue d&apos;ensemble</h1>
        <p className="text-sm text-brand-navy/60">Aperçu de l&apos;activité de votre boutique.</p>
      </div>

      {lowStockCount > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          {lowStockCount} produit{lowStockCount > 1 ? "s ont" : " a"} un stock faible (5 unités ou moins).{" "}
          <Link href="/dashboard/produits" className="font-semibold underline">
            Voir les produits
          </Link>
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-brand-border bg-white p-5">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${s.accent}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-brand-navy">{s.value}</p>
            <p className="text-sm text-brand-navy/60">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-lg border border-brand-border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-navy">
              Commandes récentes
            </h2>
            <Link href="/dashboard/commandes" className="text-sm font-semibold text-brand-blue hover:underline">
              Tout voir
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-brand-navy/50">Aucune commande pour le moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border text-left text-xs uppercase text-brand-navy/50">
                    <th className="pb-2 pr-4">Référence</th>
                    <th className="pb-2 pr-4">Client</th>
                    <th className="pb-2 pr-4">Statut</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-brand-border/60 last:border-0">
                      <td className="py-2.5 pr-4">
                        <Link href={`/dashboard/commandes/${o.id}`} className="font-medium text-brand-blue hover:underline">
                          {o.reference}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4 text-brand-navy/80">{o.customerName}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[o.status]}`}>
                          {statusLabels[o.status]}
                        </span>
                      </td>
                      <td className="py-2.5 text-right font-semibold text-brand-navy">{formatFCFA(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-brand-border bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-navy">
              Commandes par statut
            </h2>
            <div className="space-y-3">
              {statusCounts.map((s) => (
                <div key={s.status}>
                  <div className="mb-1 flex justify-between text-xs text-brand-navy/60">
                    <span>{statusLabels[s.status]}</span>
                    <span>{s._count._all}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-brand-gray">
                    <div
                      className="h-full rounded-full bg-brand-blue"
                      style={{ width: `${(s._count._all / maxStatusCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-brand-border bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-navy">
              Meilleures ventes
            </h2>
            {topProductsWithQty.length === 0 ? (
              <p className="text-sm text-brand-navy/50">Pas encore de ventes.</p>
            ) : (
              <ul className="space-y-3">
                {topProductsWithQty.map(
                  (t) =>
                    t.product && (
                      <li key={t.product.id} className="flex items-center justify-between text-sm">
                        <span className="line-clamp-1 pr-2 text-brand-navy/80">{t.product.name}</span>
                        <span className="shrink-0 font-semibold text-brand-navy">{t.quantity} vendus</span>
                      </li>
                    )
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
