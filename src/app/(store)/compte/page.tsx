import { redirect } from "next/navigation";
import { Package, User } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/format";
import { logoutAction } from "@/actions/auth";

const statusLabels: Record<string, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  PROCESSING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/connexion?redirect=/compte");

  const orders = await prisma.order.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="container-page py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-brand-navy">{session.name}</h1>
            <p className="text-sm text-brand-navy/60">{session.email}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button className="rounded-md border border-brand-border px-4 py-2 text-sm font-medium text-brand-navy hover:border-brand-red hover:text-brand-red">
            Se déconnecter
          </button>
        </form>
      </div>

      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-brand-navy">
        <Package className="h-4 w-4" /> Mes commandes
      </h2>

      {orders.length === 0 ? (
        <p className="rounded-lg border border-dashed border-brand-border p-8 text-center text-sm text-brand-navy/60">
          Vous n&apos;avez pas encore passé de commande.
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-brand-border p-4">
              <div>
                <p className="text-sm font-semibold text-brand-navy">{order.reference}</p>
                <p className="text-xs text-brand-navy/50">
                  {order.items.length} article{order.items.length > 1 ? "s" : ""} ·{" "}
                  {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="rounded-full bg-brand-blue-light px-3 py-1 text-xs font-semibold text-brand-blue">
                  {statusLabels[order.status]}
                </span>
                <span className="text-sm font-bold text-brand-navy">{formatFCFA(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
