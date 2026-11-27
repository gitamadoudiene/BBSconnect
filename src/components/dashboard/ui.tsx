import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import clsx from "clsx";
import type { OrderStatus } from "@prisma/client";
import { orderStatusLabel, orderStatusTone } from "@/lib/orderStatus";

/** Page title block — same voice as the storefront section headings. */
export function PageHeader({
  eyebrow,
  title,
  description,
  back,
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  back?: { href: string; label: string };
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      {back && (
        <Link
          href={back.href}
          className="group mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-slate hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && <p className="db-eyebrow mb-2.5">{eyebrow}</p>}
          <h1 className="db-title">{title}</h1>
          {description && <p className="mt-2 text-[14px] text-slate">{description}</p>}
        </div>
        {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
      </div>
    </div>
  );
}

export function CardTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 className="db-eyebrow">{children}</h2>
      {action}
    </div>
  );
}

export function Notice({ tone, children }: { tone: "success" | "danger"; children: React.ReactNode }) {
  const Icon = tone === "success" ? CheckCircle2 : XCircle;
  return (
    <div
      role="status"
      className={clsx(
        "mb-5 flex items-center gap-2.5 rounded-[14px] px-4 py-3 text-[13.5px] font-medium",
        tone === "success" ? "bg-db-success-tint text-db-success" : "bg-db-danger-tint text-db-danger"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {children}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-paper text-ink">
        <Icon className="h-6 w-6" strokeWidth={1.6} />
      </span>
      <p className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</p>
      {text && <p className="mt-1 max-w-sm text-[13.5px] text-slate">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function OrderBadge({ status }: { status: OrderStatus }) {
  const tone = orderStatusTone[status];
  return (
    <span className={clsx("badge", tone.badge)}>
      <span className={clsx("h-1.5 w-1.5 rounded-full", tone.dot)} />
      {orderStatusLabel[status]}
    </span>
  );
}
