"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { OrderStatus } from "@prisma/client";

async function requireMerchant() {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") {
    redirect("/connexion?redirect=/dashboard");
  }
  return session;
}

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  await requireMerchant();
  await prisma.order.update({ where: { id: orderId }, data: { status } });
  revalidatePath("/dashboard/commandes");
  revalidatePath(`/dashboard/commandes/${orderId}`);
}
