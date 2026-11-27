import type { OrderStatus } from "@prisma/client";

export const ORDER_STATUSES: OrderStatus[] = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export const orderStatusLabel: Record<OrderStatus, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  PROCESSING: "En préparation",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

/** Storefront palette only: orange = needs you, blue = moving, green = done. */
export const orderStatusTone: Record<OrderStatus, { badge: string; dot: string }> = {
  PENDING: { badge: "bg-signal-tint text-signal-deep", dot: "bg-signal" },
  PAID: { badge: "bg-accent-tint text-accent-deep", dot: "bg-brand" },
  PROCESSING: { badge: "bg-accent-tint text-accent-deep", dot: "bg-accent" },
  SHIPPED: { badge: "bg-paper text-ink", dot: "bg-ink" },
  DELIVERED: { badge: "bg-db-success-tint text-db-success", dot: "bg-db-success" },
  CANCELLED: { badge: "bg-mist text-slate", dot: "bg-line-strong" },
};
