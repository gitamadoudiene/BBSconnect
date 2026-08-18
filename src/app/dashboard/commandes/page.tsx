import Link from "next/link";
import clsx from "clsx";
import { ShoppingBag } from "lucide-react";
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
      <p className="mb-4 text-[13px] text-db-muted">{orders.length} commande{orders.length > 1 ? "s" : ""}</p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <Link
          href="/dashboard/commandes"
          className={clsx(
            "rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition",
            !status ? "bg-ink text-white" : "text-db-muted hover:bg-db-bg"
          )}
        >
          Toutes
        </Link>
        {Object.entries(statusLabels).map(([value, label]) => (
          <Link
            key={value}
            href={`/dashboard/commandes?status=${value}`}
            className={clsx(
              "rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition",
              status === value ? "bg-ink text-white" : "text-db-muted hover:bg-db-bg"
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-db-border bg-db-card">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <ShoppingBag className="mb-3 h-9 w-9 text-db-muted" strokeWidth={1.5} />
            <p className="text-[14px] font-medium text-db-text">Aucune commande {status ? "dans ce statut" : "pour le moment"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-db-border bg-db-bg text-left text-[11px] uppercase tracking-wide text-db-muted">
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
                  <tr key={o.id} className="border-b border-db-border/70 last:border-0 hover:bg-db-bg/50">
                    <td className="p-3">
                      <Link href={`/dashboard/commandes/${o.id}`} className="font-medium text-accent hover:underline">
                        {o.reference}
                      </Link>
                    </td>
                    <td className="p-3">
                      <p className="text-db-text">{o.customerName}</p>
                      <p className="text-[11.5px] text-db-muted">{o.customerEmail}</p>
                    </td>
                    <td className="p-3 text-db-muted">{o.items.length}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusColors[o.status]}`}>
                        {statusLabels[o.status]}
                      </span>
                    </td>
                    <td className="p-3 text-[12px] text-db-muted">{new Date(o.createdAt).toLocaleDateString("fr-FR")}</td>
                    <td className="p-3 text-right font-semibold text-db-text">{formatFCFA(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
