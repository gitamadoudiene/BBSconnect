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
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-tint text-accent">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-h2 text-ink">{session.name}</h1>
            <p className="text-sm text-slate">{session.email}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button className="btn btn-secondary btn-sm">
            Se déconnecter
          </button>
        </form>
      </div>

      <h2 className="text-eyebrow mb-4 flex items-center gap-2 text-slate">
        <Package className="h-4 w-4" /> Mes commandes
      </h2>

      {orders.length === 0 ? (
        <p className="rounded-[24px] border border-dashed border-line-strong p-10 text-center text-[15px] text-slate">
          Vous n&apos;avez pas encore passé de commande.
        </p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="text-sm font-semibold text-ink">{order.reference}</p>
                <p className="text-xs text-slate">
                  {order.items.length} article{order.items.length > 1 ? "s" : ""} ·{" "}
                  {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="rounded-full bg-accent-tint px-3 py-1 font-mono text-[11px] font-medium text-accent-deep">
                  {statusLabels[order.status]}
                </span>
                <span className="text-sm font-bold text-ink">{formatFCFA(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
