import Link from "next/link";
import clsx from "clsx";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/format";
import type { OrderStatus } from "@prisma/client";

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

type SearchParams = Promise<{ status?: string }>;

export default async function DashboardOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const status = params.status as OrderStatus | undefined;

  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy">Commandes</h1>
        <p className="text-sm text-brand-navy/60">{orders.length} commande(s)</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/dashboard/commandes"
          className={clsx(
            "rounded-full border px-3 py-1.5 text-xs font-semibold",
            !status ? "border-brand-blue bg-brand-blue-light text-brand-blue" : "border-brand-border text-brand-navy/60"
          )}
        >
          Toutes
        </Link>
        {Object.entries(statusLabels).map(([value, label]) => (
          <Link
            key={value}
            href={`/dashboard/commandes?status=${value}`}
            className={clsx(
              "rounded-full border px-3 py-1.5 text-xs font-semibold",
              status === value ? "border-brand-blue bg-brand-blue-light text-brand-blue" : "border-brand-border text-brand-navy/60"
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-brand-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-gray text-left text-xs uppercase text-brand-navy/50">
              <th className="p-3">Référence</th>
              <th className="p-3">Client</th>
              <th className="p-3">Articles</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-brand-border/60 last:border-0">
                <td className="p-3">
                  <Link href={`/dashboard/commandes/${o.id}`} className="font-medium text-brand-blue hover:underline">
                    {o.reference}
                  </Link>
                </td>
                <td className="p-3">
                  <p className="text-brand-navy">{o.customerName}</p>
                  <p className="text-xs text-brand-navy/50">{o.customerEmail}</p>
                </td>
                <td className="p-3 text-brand-navy/70">{o.items.length}</td>
                <td className="p-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusColors[o.status]}`}>
                    {statusLabels[o.status]}
                  </span>
                </td>
                <td className="p-3 text-brand-navy/60">{new Date(o.createdAt).toLocaleDateString("fr-FR")}</td>
                <td className="p-3 text-right font-semibold text-brand-navy">{formatFCFA(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="p-8 text-center text-sm text-brand-navy/50">Aucune commande trouvée.</p>
        )}
      </div>
    </div>
  );
}
