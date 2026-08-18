import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const order = await prisma.order.findUnique({
    where: { reference },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });

  if (!order) notFound();

  return (
    <div className="container-page max-w-2xl py-16">
      <div className="rounded-2xl bg-paper p-8 text-center sm:p-12">
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-500" strokeWidth={1.25} />
        <h1 className="text-h2 text-ink">Commande confirmée !</h1>
        <p className="mt-3 text-slate">
          Merci {order.customerName.split(" ")[0]}, votre commande{" "}
          <span className="font-semibold text-ink">{order.reference}</span> a bien été
          enregistrée. Nous vous contacterons au {order.customerPhone} pour la livraison.
        </p>

        <div className="mt-8 rounded-xl bg-white p-6 text-left">
          <ul className="space-y-2.5 text-[14px]">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-ink/80">
                <span>
                  {item.variant.product.name}
                  <span className="text-slate">
                    {" "}
                    ({[item.variant.colorName, item.variant.storage].filter(Boolean).join(" · ")}) × {item.quantity}
                  </span>
                </span>
                <span className="font-medium text-ink">{formatFCFA(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1.5 border-t border-line pt-4 text-[14px] text-slate">
            <div className="flex justify-between"><span>Sous-total</span><span className="text-ink">{formatFCFA(order.subtotal)}</span></div>
            <div className="flex justify-between"><span>Livraison</span><span className="text-ink">{formatFCFA(order.shippingFee)}</span></div>
            <div className="flex justify-between text-[16px] font-semibold text-ink"><span>Total</span><span>{formatFCFA(order.total)}</span></div>
          </div>
          <div className="mt-4 border-t border-line pt-4 text-[13.5px] text-slate">
            <p><span className="font-medium text-ink">Paiement : </span>{order.paymentMethod}</p>
            <p><span className="font-medium text-ink">Livraison : </span>{order.address}, {order.city}</p>
          </div>
        </div>

        <Link href="/boutique" className="btn btn-primary mt-8">
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}
