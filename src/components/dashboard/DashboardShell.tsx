"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import {
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Store,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { logoutAction } from "@/actions/auth";

const links = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/dashboard/produits", label: "Produits", icon: Package },
  { href: "/dashboard/commandes", label: "Commandes", icon: ShoppingBag },
  { href: "/dashboard/parametres", label: "Paramètres", icon: Settings },
];

export function DashboardShell({
  merchantName,
  children,
}: {
  merchantName: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {links.map((link) => {
        const active = link.href === "/dashboard" ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={clsx(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition",
              active ? "bg-brand-blue text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
      <Link
        href="/"
        className="mt-2 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white"
      >
        <Store className="h-4 w-4" />
        Voir la boutique
      </Link>
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-brand-gray">
      <aside className="hidden w-64 shrink-0 flex-col bg-brand-navy py-6 md:flex">
        <div className="mb-8 px-6">
          <Logo dark />
        </div>
        {nav}
        <div className="mt-auto px-3 pt-6">
          <div className="mb-2 rounded-md bg-white/5 px-3 py-2 text-xs text-white/60">
            Connecté en tant que <span className="font-semibold text-white">{merchantName}</span>
          </div>
          <form action={logoutAction}>
            <button className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
              Se déconnecter
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-16 items-center gap-3 border-b border-brand-border bg-white px-4 md:hidden">
          <button onClick={() => setOpen(true)} aria-label="Ouvrir le menu">
            <Menu className="h-6 w-6 text-brand-navy" />
          </button>
          <Logo />
        </header>

        {open && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="flex w-64 flex-col bg-brand-navy py-6">
              <div className="mb-8 flex items-center justify-between px-6">
                <Logo dark />
                <button onClick={() => setOpen(false)} aria-label="Fermer le menu">
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
              {nav}
              <div className="mt-auto px-3 pt-6">
                <form action={logoutAction}>
                  <button className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white">
                    Se déconnecter
                  </button>
                </form>
              </div>
            </div>
            <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
