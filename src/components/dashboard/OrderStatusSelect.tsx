"use client";

import { useTransition } from "react";
import type { OrderStatus } from "@prisma/client";
import { updateOrderStatusAction } from "@/actions/orders";

const options: { value: OrderStatus; label: string }[] = [
  { value: "PENDING", label: "En attente" },
  { value: "PAID", label: "Payée" },
  { value: "PROCESSING", label: "En préparation" },
  { value: "SHIPPED", label: "Expédiée" },
  { value: "DELIVERED", label: "Livrée" },
  { value: "CANCELLED", label: "Annulée" },
];

export function OrderStatusSelect({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) =>
        startTransition(() => {
          updateOrderStatusAction(orderId, e.target.value as OrderStatus);
        })
      }
      className="rounded-lg border border-db-border px-3 py-2 text-[13px] font-medium text-db-text outline-none focus:border-accent disabled:opacity-50"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
