"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Heart, LayoutDashboard, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import clsx from "clsx";
import { Logo } from "@/components/ui/Logo";
import { CartCount, WishlistCount } from "./CartBadge";
import type { SessionPayload } from "@/lib/session";
import { MegaPanel, MobileMegaMenu, type NavMenu } from "./MegaMenu";

/** Plain links after the mega-menus. */
const links = [
  { label: "Offres", href: "/boutique?deals=1" },
  { label: "À propos", href: "/a-propos" },
];

export function HeaderClient({
  menus,
  session,
  announcement,
}: {
  menus: NavMenu[];
  session: SessionPayload | null;
  announcement: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenMenu(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openMenu]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/boutique?q=${encodeURIComponent(q)}` : "/boutique");
    setMenuOpen(false);
  }

  function open(label: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(label);
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 160);
  }

  const accountHref = session ? (session.role === "MERCHANT" ? "/dashboard" : "/compte") : "/connexion";

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      {/* Utility strip */}
      <div className="hidden border-b border-line bg-paper lg:block">
        <div className="container-page flex h-9 items-center justify-between font-mono text-[11.5px] text-slate">
          <p className="truncate">{announcement}</p>
          <div className="flex items-center gap-5">
            <a href="tel:+221788379919" className="tabular hover:text-ink">
              78 837 99 19
            </a>
            <Link href="/compte" className="hover:text-ink">
              Suivre ma commande
            </Link>
            {session?.role === "MERCHANT" && (
              <Link href="/dashboard" className="text-accent hover:text-accent-deep">
                Espace commerçant
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="container-page flex h-16 items-center gap-3 sm:gap-6 lg:h-[72px]">
        <button
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-xl text-ink lg:hidden"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Logo />

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Navigation principale">
          {menus.map((menu) => {
            const isOpen = openMenu === menu.key;
            return (
              <div key={menu.key} onMouseEnter={() => open(menu.key)} onMouseLeave={scheduleClose}>
                <button
                  className={clsx(
                    "flex items-center gap-1 whitespace-nowrap rounded-xl px-3 py-2 text-[14.5px] font-medium text-ink transition-colors",
                    isOpen ? "bg-paper" : "hover:bg-paper"
                  )}
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  onClick={() => (isOpen ? setOpenMenu(null) : open(menu.key))}
                >
                  {menu.label}
                  <ChevronDown className={clsx("h-3.5 w-3.5 text-slate transition-transform", isOpen && "rotate-180")} />
                </button>
                {isOpen && <MegaPanel menu={menu} onNavigate={() => setOpenMenu(null)} />}
              </div>
            );
          })}
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap rounded-xl px-3 py-2 text-[14.5px] font-medium text-ink transition-colors hover:bg-paper"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <form onSubmit={handleSearch} className="relative mr-2 hidden xl:block" role="search">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Rechercher un modèle"
              aria-label="Rechercher un modèle"
              className="h-10 w-[240px] rounded-xl border border-line bg-paper pl-10 pr-3 text-[14px] text-ink outline-none transition-colors placeholder:text-slate focus:border-accent focus:bg-white"
            />
          </form>
          <Link
            href="/boutique"
            aria-label="Rechercher"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-ink hover:bg-paper xl:hidden"
          >
            <Search className="h-[18px] w-[18px]" />
          </Link>
          {session?.role === "MERCHANT" && (
            <Link
              href="/dashboard"
              aria-label="Espace commerçant"
              title="Espace commerçant"
              className="flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-accent/30 bg-accent-tint px-2.5 text-[13.5px] font-semibold text-accent-deep transition-colors hover:border-accent xl:px-3"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden xl:inline">Espace commerçant</span>
            </Link>
          )}
          <Link
            href={accountHref}
            aria-label="Mon compte"
            className="hidden h-10 w-10 items-center justify-center rounded-xl text-ink hover:bg-paper sm:flex"
          >
            <User className="h-[18px] w-[18px]" />
          </Link>
          <Link
            href="/favoris"
            aria-label="Favoris"
            className="relative hidden h-10 w-10 items-center justify-center rounded-xl text-ink hover:bg-paper sm:flex"
          >
            <Heart className="h-[18px] w-[18px]" />
            <Badge>
              <WishlistCount />
            </Badge>
          </Link>
          <Link
            href="/panier"
            aria-label="Panier"
            className="relative flex h-10 items-center gap-2 rounded-xl bg-ink pl-3 pr-3.5 text-white hover:bg-ink-soft"
          >
            <ShoppingBag className="h-[17px] w-[17px]" />
            <span className="tabular font-mono text-[12.5px]">
              <CartCount />
            </span>
          </Link>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-line bg-white lg:hidden"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) setMenuOpen(false);
          }}
        >
          <div className="container-page py-5">
            <form onSubmit={handleSearch} className="relative" role="search">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                placeholder="Rechercher un modèle"
                aria-label="Rechercher un modèle"
                className="field pl-11"
              />
            </form>

            <nav className="mt-6" aria-label="Navigation mobile">
              {menus.map((menu, i) => (
                <MobileMegaMenu key={menu.key} menu={menu} index={i} />
              ))}
              {links.map((l, i) => (
                <Link key={l.href} href={l.href} className="flex items-baseline justify-between border-b border-line py-4">
                  <span className="text-[26px] font-bold tracking-[-0.035em] text-ink">{l.label}</span>
                  <span className="font-mono text-[11px] text-slate">0{menus.length + i + 1}</span>
                </Link>
              ))}
            </nav>

            {session?.role === "MERCHANT" && (
              <Link href="/dashboard" className="btn btn-accent mt-6 w-full">
                <LayoutDashboard className="h-4 w-4" /> Espace commerçant
              </Link>
            )}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Link href={accountHref} className="btn btn-secondary">
                <User className="h-4 w-4" /> {session ? "Mon compte" : "Connexion"}
              </Link>
              <Link href="/favoris" className="btn btn-secondary">
                <Heart className="h-4 w-4" /> Favoris
              </Link>
            </div>

            <div className="mt-8 rounded-[20px] bg-paper p-5 font-mono text-[12px] leading-relaxed text-slate">
              Livraison 24h à Dakar · Paiement à la livraison
              <br />
              <a href="tel:+221788379919" className="text-ink">
                78 837 99 19
              </a>{" "}
              ·{" "}
              <a href="https://wa.me/221788379919" className="text-ink">
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-signal px-1 font-mono text-[9.5px] font-medium text-ink">
      {children}
    </span>
  );
}
