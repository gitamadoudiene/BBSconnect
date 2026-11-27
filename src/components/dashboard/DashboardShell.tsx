"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import {
  ArrowUpRight,
  BadgePercent,
  BarChart3,
  Boxes,
  ChevronDown,
  Eye,
  Folder,
  Home,
  Image as ImageIcon,
  Images,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  Target,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { DuoMark, Logo } from "@/components/ui/Logo";
import { logoutAction } from "@/actions/auth";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  /** Custom matcher when the href alone isn't enough (query-string tabs). */
  isActive?: (path: string, query: URLSearchParams) => boolean;
};

const nav: { label: string; items: NavItem[] }[] = [
  {
    label: "Pilotage",
    items: [{ href: "/dashboard", label: "Vue d'ensemble", icon: LayoutDashboard, isActive: (p) => p === "/dashboard" }],
  },
  {
    label: "Catalogue",
    items: [
      {
        href: "/dashboard/produits",
        label: "Produits",
        icon: Package,
        isActive: (p, q) => p.startsWith("/dashboard/produits") && q.get("stock") !== "low",
      },
      { href: "/dashboard/categories", label: "Catégories", icon: Folder },
      { href: "/dashboard/collections", label: "Collections", icon: Layers },
      {
        href: "/dashboard/produits?stock=low",
        label: "Stock faible",
        icon: Boxes,
        isActive: (p, q) => p === "/dashboard/produits" && q.get("stock") === "low",
      },
    ],
  },
  {
    label: "Boutique",
    items: [
      { href: "/dashboard/homepage", label: "Page d'accueil", icon: Home },
      { href: "/dashboard/bannieres", label: "Bannières", icon: ImageIcon },
      { href: "/dashboard/promotions", label: "Promotions", icon: BadgePercent },
      { href: "/dashboard/medias", label: "Médias", icon: Images },
    ],
  },
  {
    label: "Ventes",
    items: [
      { href: "/dashboard/commandes", label: "Commandes", icon: ShoppingBag },
      { href: "/dashboard/clients", label: "Clients", icon: Users },
    ],
  },
  {
    label: "Analytics",
    items: [
      { href: "/dashboard/analytics", label: "Vue globale", icon: BarChart3, isActive: (p) => p === "/dashboard/analytics" },
      { href: "/dashboard/analytics/visiteurs", label: "Visiteurs", icon: Eye },
      { href: "/dashboard/analytics/conversions", label: "Conversions", icon: Target },
    ],
  },
  {
    label: "Compte",
    items: [
      { href: "/dashboard/parametres", label: "Profil", icon: UserRound },
      { href: "/dashboard/securite", label: "Sécurité", icon: ShieldCheck },
    ],
  },
];

const sections: [RegExp, string][] = [
  [/^\/dashboard\/(produits|categories|collections)/, "Catalogue"],
  [/^\/dashboard\/(homepage|bannieres|promotions|medias)/, "Boutique"],
  [/^\/dashboard\/(commandes|clients)/, "Ventes"],
  [/^\/dashboard\/analytics/, "Analytics"],
  [/^\/dashboard\/(parametres|securite)/, "Compte"],
];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
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
  const [accountOpen, setAccountOpen] = useState(false);
  const pathname = usePathname();
  const query = useSearchParams();
  const router = useRouter();
  const section = sections.find(([re]) => re.test(pathname))?.[1] ?? "Pilotage";

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") ?? "").trim();
    if (q) router.push(`/dashboard/produits?q=${encodeURIComponent(q)}`);
  }

  const navList = (
    <nav aria-label="Back-office" className="rail flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain px-4 pb-6">
      {nav.map((group) => (
        <div key={group.label}>
          <p className="mb-1.5 px-3 font-mono text-[10.5px] uppercase tracking-[0.12em] text-white/35">{group.label}</p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = item.isActive
                ? item.isActive(pathname, query)
                : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={clsx(
                      "flex h-9 items-center gap-3 rounded-[11px] px-3 text-[13.5px] font-medium transition-colors",
                      active ? "bg-white text-ink" : "text-white/65 hover:bg-white/[0.07] hover:text-white"
                    )}
                  >
                    <item.icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.8} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const storeLink = (
    <div className="shrink-0 border-t border-white/10 p-4">
      <Link
        href="/"
        target="_blank"
        className="flex h-10 items-center justify-between rounded-[12px] px-3 text-[14px] font-medium text-white/65 transition-colors hover:bg-white/[0.07] hover:text-white"
      >
        Voir la boutique <ArrowUpRight className="h-4 w-4" />
      </Link>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-db-bg">
      <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col overflow-hidden bg-ink lg:flex">
        <div className="shrink-0 px-7 pb-6 pt-6">
          <Logo dark href="/dashboard" label="Back-office BBS Connect, vue d'ensemble" />
        </div>
        {navList}
        {storeLink}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
          <div className="flex h-dvh w-[280px] flex-col overflow-hidden bg-ink">
            <div className="flex shrink-0 items-center justify-between px-7 pb-6 pt-6">
              <Logo dark href="/dashboard" label="Back-office BBS Connect, vue d'ensemble" />
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Fermer le menu"
                className="flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {navList}
            {storeLink}
          </div>
          <button aria-label="Fermer le menu" className="flex-1 bg-ink/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur-sm">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-10">
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu className="h-[18px] w-[18px] text-ink" />
            </button>
            <Link href="/dashboard" className="lg:hidden" aria-label="Vue d'ensemble">
              <DuoMark size={28} />
            </Link>

            <p className="hidden min-w-0 flex-1 truncate font-mono text-[11.5px] uppercase tracking-[0.1em] text-slate sm:block">
              Back-office <span className="text-line-strong">/</span> <span className="text-ink">{section}</span>
            </p>
            <div className="flex-1 sm:hidden" />

            <form onSubmit={handleSearch} role="search" className="relative hidden w-72 md:block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
              <input
                name="q"
                type="search"
                placeholder="Rechercher un produit…"
                aria-label="Rechercher un produit"
                className="field field-sm rounded-full bg-paper pl-10 focus:bg-white"
              />
            </form>

            <div className="relative">
              <button
                onClick={() => setAccountOpen((v) => !v)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
                className="flex h-10 items-center gap-2 rounded-full border border-line pl-1 pr-3 transition-colors hover:border-ink"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink font-mono text-[11px] text-white">
                  {initials(merchantName)}
                </span>
                <span className="hidden max-w-[140px] truncate text-[13.5px] font-medium text-ink sm:block">
                  {merchantName}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate" />
              </button>
              {accountOpen && (
                <>
                  <button aria-label="Fermer" className="fixed inset-0 z-10 cursor-default" onClick={() => setAccountOpen(false)} />
                  <div role="menu" className="absolute right-0 top-12 z-20 w-64 overflow-hidden rounded-[18px] border border-line bg-white p-1.5 shadow-[0_18px_40px_-18px_rgba(18,19,21,0.35)]">
                    <div className="px-3 pb-3 pt-2.5">
                      <p className="truncate text-[14px] font-semibold text-ink">{merchantName}</p>
                      <p className="truncate font-mono text-[11.5px] text-slate">{merchantEmail}</p>
                    </div>
                    <div className="border-t border-line pt-1.5">
                      {[
                        { href: "/dashboard/parametres", label: "Profil", icon: UserRound },
                        { href: "/dashboard/securite", label: "Sécurité du compte", icon: ShieldCheck },
                      ].map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          role="menuitem"
                          onClick={() => setAccountOpen(false)}
                          className="flex h-10 items-center gap-2.5 rounded-[12px] px-3 text-[13.5px] text-ink hover:bg-paper"
                        >
                          <l.icon className="h-4 w-4 text-slate" /> {l.label}
                        </Link>
                      ))}
                      <form action={logoutAction}>
                        <button
                          role="menuitem"
                          className="flex h-10 w-full items-center gap-2.5 rounded-[12px] px-3 text-left text-[13.5px] text-db-danger hover:bg-db-danger-tint"
                        >
                          <LogOut className="h-4 w-4" /> Se déconnecter
                        </button>
                      </form>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-12">{children}</main>
      </div>
    </div>
  );
}
