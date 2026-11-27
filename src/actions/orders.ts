"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireMerchant } from "@/lib/auth";
import type { OrderStatus } from "@prisma/client";

const statusSchema = z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]);

export async function updateOrderStatusAction(orderId: string, status: OrderStatus) {
  await requireMerchant();
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success || typeof orderId !== "string") return;
  await prisma.order.update({ where: { id: orderId }, data: { status: parsed.data } });
  revalidatePath("/dashboard", "layout");
}
