import Link from "next/link";
import clsx from "clsx";
import { Search, ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/format";
import type { OrderStatus } from "@prisma/client";
import { EmptyState, OrderBadge, PageHeader } from "@/components/dashboard/ui";
import { ORDER_STATUSES, orderStatusLabel } from "@/lib/orderStatus";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string; q?: string }>;

export default async function DashboardOrdersPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const status = ORDER_STATUSES.includes(params.status as OrderStatus) ? (params.status as OrderStatus) : undefined;
  const q = params.q?.trim();

  const [orders, counts] = await Promise.all([
    prisma.order.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(q
          ? {
              OR: [
                { reference: { contains: q, mode: "insensitive" as const } },
                { customerName: { contains: q, mode: "insensitive" as const } },
                { customerEmail: { contains: q, mode: "insensitive" as const } },
                { customerPhone: { contains: q } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { items: true },
      take: 200,
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const countOf = new Map(counts.map((c) => [c.status, c._count._all]));
  const total = counts.reduce((s, c) => s + c._count._all, 0);
  const tabHref = (s?: string) => {
    const sp = new URLSearchParams();
    if (s) sp.set("status", s);
    if (q) sp.set("q", q);
    const qs = sp.toString();
    return `/dashboard/commandes${qs ? `?${qs}` : ""}`;
  };

  return (
    <div>
      <PageHeader
        eyebrow="Ventes"
        title="Commandes"
        description={`${total} commande${total > 1 ? "s" : ""} au total · ${countOf.get("PENDING") ?? 0} en attente de traitement`}
      >
        <form role="search" className="relative">
          {status && <input type="hidden" name="status" value={status} />}
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Référence, client, téléphone…"
            aria-label="Rechercher une commande"
            className="field field-sm w-72 pl-10"
          />
        </form>
      </PageHeader>

      <div className="rail mb-4 flex gap-2 overflow-x-auto">
        <Link href={tabHref()} className={clsx("pill", !status && "pill-active")}>
          Toutes <span className="tabular font-mono text-[11px] opacity-60">{total}</span>
        </Link>
        {ORDER_STATUSES.map((value) => (
          <Link key={value} href={tabHref(value)} className={clsx("pill", status === value && "pill-active")}>
            {orderStatusLabel[value]}
            <span className="tabular font-mono text-[11px] opacity-60">{countOf.get(value) ?? 0}</span>
          </Link>
        ))}
      </div>

      <div className="overflow-hidden db-card">
        {orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title={q ? "Aucune commande ne correspond à cette recherche" : `Aucune commande ${status ? "dans ce statut" : "pour le moment"}`}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line bg-paper/60 text-left">
                  <th className="db-th px-4 py-3">Référence</th>
                  <th className="db-th px-4 py-3">Client</th>
                  <th className="db-th px-4 py-3">Articles</th>
                  <th className="db-th px-4 py-3">Statut</th>
                  <th className="db-th px-4 py-3">Date</th>
                  <th className="db-th px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-line last:border-0 hover:bg-paper/50">
                    <td className="px-4 py-3.5">
                      <Link href={`/dashboard/commandes/${o.id}`} className="font-mono text-[12.5px] font-medium text-accent hover:underline">
                        {o.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-ink">{o.customerName}</p>
                      <p className="font-mono text-[11px] text-slate">{o.customerPhone}</p>
                    </td>
                    <td className="tabular px-4 py-3.5 font-mono text-[12.5px] text-ink">{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                    <td className="px-4 py-3.5">
                      <OrderBadge status={o.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[11.5px] text-slate">{new Date(o.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="tabular whitespace-nowrap px-4 py-3.5 text-right font-semibold text-ink">{formatFCFA(o.total)}</td>
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
