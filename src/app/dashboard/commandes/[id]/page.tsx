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
    include: { items: { include: { product: true } } },
  });

  if (!order) notFound();

  return (
    <div>
      <Link href="/dashboard/commandes" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-brand-blue hover:underline">
        <ArrowLeft className="h-4 w-4" /> Retour aux commandes
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">{order.reference}</h1>
          <p className="text-sm text-brand-navy/60">
            Passée le {new Date(order.createdAt).toLocaleDateString("fr-FR", { dateStyle: "long" })}
          </p>
        </div>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-brand-border bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-navy">Articles</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="h-14 w-9 shrink-0 rounded bg-brand-gray p-1.5">
                  <PhoneMock color={item.product.color} variant="back" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-brand-navy">{item.product.name}</p>
                  <p className="text-xs text-brand-navy/50">
                    {formatFCFA(item.price)} × {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-brand-navy">{formatFCFA(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 border-t border-brand-border pt-4 text-sm text-brand-navy/70">
            <div className="flex justify-between"><span>Sous-total</span><span>{formatFCFA(order.subtotal)}</span></div>
            <div className="flex justify-between"><span>Livraison</span><span>{formatFCFA(order.shippingFee)}</span></div>
            <div className="flex justify-between text-base font-bold text-brand-navy"><span>Total</span><span>{formatFCFA(order.total)}</span></div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-brand-border bg-white p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-navy">Client</h2>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-brand-navy/50">Nom</dt>
                <dd className="font-medium text-brand-navy">{order.customerName}</dd>
              </div>
              <div>
                <dt className="text-brand-navy/50">Email</dt>
                <dd className="font-medium text-brand-navy">{order.customerEmail}</dd>
              </div>
              <div>
                <dt className="text-brand-navy/50">Téléphone</dt>
                <dd className="font-medium text-brand-navy">{order.customerPhone}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-brand-border bg-white p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-navy">Livraison</h2>
            <p className="text-sm text-brand-navy">{order.address}</p>
            <p className="text-sm text-brand-navy/70">{order.city}</p>
          </div>

          <div className="rounded-lg border border-brand-border bg-white p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-navy">Paiement</h2>
            <p className="text-sm text-brand-navy">{order.paymentMethod}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
