import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/format";
import { OrderStatusSelect } from "@/components/dashboard/OrderStatusSelect";
import { PhoneMock } from "@/components/ui/PhoneMock";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });

  if (!order) notFound();

  return (
    <div>
      <Link href="/dashboard/commandes" className="mb-4 inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline">
        <ArrowLeft className="h-4 w-4" /> Retour aux commandes
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[18px] font-semibold text-db-text">{order.reference}</h1>
          <p className="text-[12.5px] text-db-muted">
            Passée le {new Date(order.createdAt).toLocaleDateString("fr-FR", { dateStyle: "long" })}
          </p>
        </div>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-db-border bg-db-card p-6">
          <h2 className="mb-4 text-[13px] font-semibold text-db-text">Articles</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="h-14 w-9 shrink-0 rounded bg-db-bg p-1.5">
                  <PhoneMock color={item.variant.colorHex} variant="back" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-[13px] font-medium text-db-text">{item.variant.product.name}</p>
                  <p className="text-[11.5px] text-db-muted">
                    {[item.variant.colorName, item.variant.storage].filter(Boolean).join(" · ")} · {formatFCFA(item.price)} × {item.quantity}
                  </p>
                </div>
                <p className="text-[13px] font-semibold text-db-text">{formatFCFA(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 border-t border-db-border pt-4 text-[13px] text-db-muted">
            <div className="flex justify-between"><span>Sous-total</span><span>{formatFCFA(order.subtotal)}</span></div>
            <div className="flex justify-between"><span>Livraison</span><span>{formatFCFA(order.shippingFee)}</span></div>
            <div className="flex justify-between text-[15px] font-bold text-db-text"><span>Total</span><span>{formatFCFA(order.total)}</span></div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-db-border bg-db-card p-6">
            <h2 className="mb-3 text-[13px] font-semibold text-db-text">Client</h2>
            <dl className="space-y-2 text-[13px]">
              <div>
                <dt className="text-db-muted">Nom</dt>
                <dd className="font-medium text-db-text">{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-db-muted">Email</dt>
                <dd className="font-medium text-db-text">{order.customerEmail}</dd>
              </div>
              <div>
                <dt className="text-db-muted">Téléphone</dt>
                <dd className="font-medium text-db-text">{order.customerPhone}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-db-border bg-db-card p-6">
            <h2 className="mb-3 text-[13px] font-semibold text-db-text">Livraison</h2>
            <p className="text-[13px] text-db-text">{order.address}</p>
            <p className="text-[13px] text-db-muted">{order.city}</p>
          </div>

          <div className="rounded-xl border border-db-border bg-db-card p-6">
            <h2 className="mb-3 text-[13px] font-semibold text-db-text">Paiement</h2>
            <p className="text-[13px] text-db-text">{order.paymentMethod}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
