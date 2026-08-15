import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { orderReference } from "@/lib/format";

const SHIPPING_FEE = 2500;

const checkoutSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(6),
  address: z.string().min(3),
  city: z.string().min(2),
  paymentMethod: z.enum(["livraison", "mobile-money", "carte"]),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
});

const paymentLabels: Record<string, string> = {
  livraison: "Paiement à la livraison",
  "mobile-money": "Mobile Money",
  carte: "Carte bancaire",
};

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  }

  const products = await prisma.product.findMany({
    where: { id: { in: parsed.data.items.map((i) => i.productId) } },
  });

  if (products.length !== parsed.data.items.length) {
    return NextResponse.json({ error: "Un produit n'existe plus" }, { status: 400 });
  }

  for (const item of parsed.data.items) {
    const product = products.find((p) => p.id === item.productId)!;
    if (product.stock < item.quantity) {
      return NextResponse.json(
        { error: `Stock insuffisant pour ${product.name}` },
        { status: 400 }
      );
    }
  }

  const subtotal = parsed.data.items.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId)!;
    return sum + product.price * item.quantity;
  }, 0);
  const total = subtotal + SHIPPING_FEE;

  const session = await getSession();

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        reference: orderReference(),
        customerName: parsed.data.customerName,
        customerEmail: parsed.data.customerEmail,
        customerPhone: parsed.data.customerPhone,
        address: parsed.data.address,
        city: parsed.data.city,
        paymentMethod: paymentLabels[parsed.data.paymentMethod],
        subtotal,
        shippingFee: SHIPPING_FEE,
        total,
        userId: session?.userId,
        items: {
          create: parsed.data.items.map((item) => {
            const product = products.find((p) => p.id === item.productId)!;
            return {
              productId: product.id,
              quantity: item.quantity,
              price: product.price,
            };
          }),
        },
      },
    });

    for (const item of parsed.data.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    return created;
  });

  return NextResponse.json({ reference: order.reference });
}
