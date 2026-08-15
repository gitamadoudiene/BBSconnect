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
    include: { items: { include: { product: true } } },
  });

  if (!order) notFound();

  return (
    <div className="container-page max-w-2xl py-16">
      <div className="rounded-lg border border-brand-border p-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-emerald-500" />
        <h1 className="text-2xl font-bold text-brand-navy">Commande confirmée !</h1>
        <p className="mt-2 text-brand-navy/60">
          Merci {order.customerName.split(" ")[0]}, votre commande{" "}
          <span className="font-semibold text-brand-navy">{order.reference}</span> a bien été
          enregistrée. Nous vous contacterons au {order.customerPhone} pour la livraison.
        </p>

        <div className="mt-8 rounded-lg bg-brand-gray p-6 text-left">
          <ul className="space-y-2 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-brand-navy/80">
                <span>{item.product.name} × {item.quantity}</span>
                <span className="font-medium">{formatFCFA(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-brand-border pt-4 text-sm text-brand-navy/70">
            <div className="flex justify-between"><span>Sous-total</span><span>{formatFCFA(order.subtotal)}</span></div>
            <div className="flex justify-between"><span>Livraison</span><span>{formatFCFA(order.shippingFee)}</span></div>
            <div className="flex justify-between text-base font-bold text-brand-navy"><span>Total</span><span>{formatFCFA(order.total)}</span></div>
          </div>
          <div className="mt-4 border-t border-brand-border pt-4 text-sm text-brand-navy/70">
            <p><span className="font-medium text-brand-navy">Paiement : </span>{order.paymentMethod}</p>
            <p><span className="font-medium text-brand-navy">Livraison : </span>{order.address}, {order.city}</p>
          </div>
        </div>

        <Link
          href="/boutique"
          className="mt-8 inline-block rounded-md bg-brand-blue px-6 py-3 text-sm font-semibold text-white hover:bg-brand-blue-dark"
        >
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}
