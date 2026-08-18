"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import {
  BarChart3,
  Boxes,
  ChevronLeft,
  ChevronsUpDown,
  Eye,
  Folder,
  Image as ImageIcon,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Tag,
  Target,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { logoutAction } from "@/actions/auth";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  soon?: boolean;
};

type NavGroup = {
  label: string | null;
  items: NavItem[];
};

const nav: NavGroup[] = [
  {
    label: null,
    items: [{ href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard }],
  },
  {
    label: "Catalogue",
    items: [
      { href: "/dashboard/produits", label: "Produits", icon: Package },
      { href: "/dashboard/categories", label: "Catégories", icon: Folder },
      { href: "/dashboard/collections", label: "Collections", icon: Layers, soon: true },
      { href: "/dashboard/produits?stock=low", label: "Stock", icon: Boxes },
    ],
  },
  {
    label: "Boutique",
    items: [
      { href: "/dashboard/homepage", label: "Homepage", icon: Sparkles, soon: true },
      { href: "/dashboard/bannieres", label: "Bannières", icon: ImageIcon, soon: true },
      { href: "/dashboard/promotions", label: "Promotions", icon: Tag, soon: true },
      { href: "/dashboard/medias", label: "Médias", icon: ImageIcon, soon: true },
    ],
  },
  {
    label: "Ventes",
    items: [
      { href: "/dashboard/commandes", label: "Commandes", icon: ShoppingBag },
      { href: "/dashboard/clients", label: "Clients", icon: Users, soon: true },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/dashboard/analytics", label: "Vue globale", icon: BarChart3, soon: true },
      { href: "/dashboard/analytics/visiteurs", label: "Visiteurs", icon: Eye, soon: true },
      { href: "/dashboard/analytics/conversions", label: "Conversions", icon: Target, soon: true },
    ],
  },
  {
    label: "Système",
    items: [{ href: "/dashboard/parametres", label: "Paramètres", icon: Settings }],
  },
];

const pageMeta: { match: (path: string) => boolean; title: string; subtitle: string }[] = [
  { match: (p) => p === "/dashboard", title: "Vue d'ensemble", subtitle: "Les performances de votre boutique" },
  { match: (p) => p.startsWith("/dashboard/produits/nouveau"), title: "Nouveau produit", subtitle: "Ajoutez un article à votre catalogue" },
  { match: (p) => /^\/dashboard\/produits\/[^/]+$/.test(p), title: "Modifier le produit", subtitle: "Mettez à jour les informations" },
  { match: (p) => p.startsWith("/dashboard/produits"), title: "Produits", subtitle: "Gérez votre catalogue" },
  { match: (p) => p.startsWith("/dashboard/categories"), title: "Catégories", subtitle: "Organisez votre catalogue" },
  { match: (p) => p.startsWith("/dashboard/commandes"), title: "Commandes", subtitle: "Suivez et traitez les commandes" },
  { match: (p) => p.startsWith("/dashboard/parametres"), title: "Paramètres", subtitle: "Configurez votre boutique" },
];

function getPageMeta(pathname: string) {
  return pageMeta.find((m) => m.match(pathname)) ?? { title: "Dashboard", subtitle: "" };
}

export function DashboardShell({
  merchantName,
  merchantEmail,
  children,
}: {
  merchantName: string;
  merchantEmail: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const meta = getPageMeta(pathname);

  useEffect(() => {
    const stored = localStorage.getItem("bbs-dashboard-collapsed");
    if (stored === "1") setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((v) => {
      localStorage.setItem("bbs-dashboard-collapsed", !v ? "1" : "0");
      return !v;
    });
  }

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q");
    if (q) router.push(`/dashboard/produits?q=${encodeURIComponent(String(q))}`);
  }

  const sidebarContent = (
    <>
      <div className={clsx("flex items-center gap-2 px-5 pb-2 pt-1", collapsed && "justify-center px-0")}>
        {!collapsed && <Logo dark />}
        {collapsed && <span className="text-xl font-extrabold text-white">B.</span>}
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-5 overflow-y-auto px-3 pb-4">
        {nav.map((group, gi) => (
          <div key={gi}>
            {group.label && !collapsed && (
              <p className="mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-wider text-white/35">
                {group.label}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href.split("?")[0]);
                if (item.soon) {
                  return (
                    <div
                      key={item.href}
                      title="Bientôt disponible"
                      className={clsx(
                        "flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] text-white/30",
                        collapsed && "justify-center px-0"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.label}</span>
                          <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold">
                            Bientôt
                          </span>
                        </>
                      )}
                    </div>
                  );
                }
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.label : undefined}
                    className={clsx(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium transition",
                      collapsed && "justify-center px-0",
                      active ? "bg-accent text-white" : "text-white/65 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link
          href="/"
          target="_blank"
          title={collapsed ? "Voir la boutique" : undefined}
          className={clsx(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium text-white/65 hover:bg-white/10 hover:text-white",
            collapsed && "justify-center px-0"
          )}
        >
          <Eye className="h-4 w-4 shrink-0" />
          {!collapsed && "Voir la boutique ↗"}
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-db-bg">
      <aside
        className={clsx(
          "relative hidden shrink-0 flex-col bg-ink transition-[width] duration-200 md:flex",
          collapsed ? "w-[76px]" : "w-64"
        )}
      >
        {sidebarContent}
        <button
          onClick={toggleCollapsed}
          className="absolute -right-3 top-8 flex h-6 w-6 items-center justify-center rounded-full border border-line bg-white text-ink shadow-sm transition hover:bg-mist"
          aria-label={collapsed ? "Développer la barre latérale" : "Réduire la barre latérale"}
        >
          <ChevronLeft className={clsx("h-3.5 w-3.5 transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="flex w-72 flex-col bg-ink">
            <div className="flex items-center justify-between px-5 pt-4">
              <Logo dark />
              <button onClick={() => setMobileOpen(false)} aria-label="Fermer le menu">
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
            {sidebarContent}
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-db-border bg-white px-4 sm:px-6">
          <button className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Ouvrir le menu">
            <Menu className="h-5 w-5 text-db-text" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[15px] font-semibold text-db-text">{meta.title}</h1>
            {meta.subtitle && <p className="hidden truncate text-[12.5px] text-db-muted sm:block">{meta.subtitle}</p>}
          </div>

          <form onSubmit={handleSearch} className="relative hidden w-64 lg:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-db-muted" />
            <input
              name="q"
              type="search"
              placeholder="Rechercher un produit…"
              className="w-full rounded-lg border border-db-border bg-db-bg py-2 pl-9 pr-3 text-[13px] text-db-text outline-none transition focus:border-accent focus:bg-white"
            />
          </form>

          <Link
            href="/"
            target="_blank"
            className="hidden items-center gap-1.5 rounded-lg border border-db-border px-3 py-2 text-[12.5px] font-medium text-db-text transition hover:border-ink sm:flex"
          >
            Voir la boutique ↗
          </Link>

          <div className="relative">
            <button
              onClick={() => setAccountOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg border border-db-border py-1.5 pl-1.5 pr-2 transition hover:bg-db-bg"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-[11px] font-semibold text-white">
                {merchantName.slice(0, 1).toUpperCase()}
              </span>
              <ChevronsUpDown className="h-3.5 w-3.5 text-db-muted" />
            </button>
            {accountOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setAccountOpen(false)} />
                <div className="absolute right-0 top-11 z-20 w-56 rounded-lg border border-db-border bg-white py-1.5 shadow-lg">
                  <div className="border-b border-db-border px-3 py-2">
                    <p className="truncate text-[13px] font-medium text-db-text">{merchantName}</p>
                    <p className="truncate text-[12px] text-db-muted">{merchantEmail}</p>
                  </div>
                  <Link
                    href="/dashboard/parametres"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-[13px] text-db-text hover:bg-db-bg"
                  >
                    <Settings className="h-4 w-4" /> Paramètres
                  </Link>
                  <form action={logoutAction}>
                    <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-db-danger hover:bg-db-danger-tint">
                      <LogOut className="h-4 w-4" /> Se déconnecter
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
