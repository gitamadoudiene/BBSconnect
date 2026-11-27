import { notFound } from "next/navigation";
import { MapPin, MessageCircle, Phone, Wallet } from "lucide-react";
import { OrderBadge, PageHeader } from "@/components/dashboard/ui";
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
      <PageHeader
        back={{ href: "/dashboard/commandes", label: "Retour aux commandes" }}
        eyebrow={`Commande · ${new Date(order.createdAt).toLocaleDateString("fr-FR", { dateStyle: "long" })}`}
        title={<span className="font-mono tracking-[-0.02em]">{order.reference}</span>}
      >
        <OrderBadge status={order.status} />
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
        <div className="db-card p-6">
          <h2 className="db-eyebrow mb-5">Articles</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="h-16 w-12 shrink-0 rounded-[12px] bg-paper p-2">
                  <PhoneMock color={item.variant.colorHex} variant="back" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-[14px] font-semibold tracking-[-0.01em] text-ink">{item.variant.product.name}</p>
                  <p className="font-mono text-[11.5px] text-slate">
                    {[item.variant.colorName, item.variant.storage].filter(Boolean).join(" · ")} · {formatFCFA(item.price)} × {item.quantity}
                  </p>
                </div>
                <p className="tabular text-[14px] font-semibold text-ink">{formatFCFA(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="tabular mt-6 space-y-2 border-t border-line pt-5 text-[13.5px] text-slate">
            <div className="flex justify-between"><span>Sous-total</span><span>{formatFCFA(order.subtotal)}</span></div>
            <div className="flex justify-between"><span>Livraison</span><span>{formatFCFA(order.shippingFee)}</span></div>
            <div className="flex justify-between border-t border-line pt-3 text-[18px] font-bold tracking-[-0.02em] text-ink"><span>Total</span><span>{formatFCFA(order.total)}</span></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="db-card p-6">
            <h2 className="db-eyebrow mb-4">Client</h2>
            <p className="text-[16px] font-semibold tracking-[-0.01em] text-ink">{order.customerName}</p>
            <p className="font-mono text-[12px] text-slate">{order.customerEmail}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={`tel:${order.customerPhone.replace(/\s/g, "")}`} className="btn btn-secondary btn-sm">
                <Phone className="h-4 w-4" /> {order.customerPhone}
              </a>
              <a
                href={`https://wa.me/${order.customerPhone.replace(/\D/g, "").replace(/^(?!221)/, "221")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm bg-[#25d366] text-white hover:opacity-90"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>

          <div className="db-card p-6">
            <h2 className="db-eyebrow mb-4">Livraison</h2>
            <p className="flex items-start gap-2.5 text-[14px] text-ink">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate" />
              <span>
                {order.address}
                <span className="block font-mono text-[12px] text-slate">{order.city}</span>
              </span>
            </p>
          </div>

          <div className="db-card p-6">
            <h2 className="db-eyebrow mb-4">Paiement</h2>
            <p className="flex items-center gap-2.5 text-[14px] text-ink"><Wallet className="h-4 w-4 text-slate" /> {order.paymentMethod}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
