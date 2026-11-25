"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import clsx from "clsx";
import { Logo } from "@/components/ui/Logo";
import { CartCount, WishlistCount } from "./CartBadge";
import type { SessionPayload } from "@/lib/session";

type Category = {
  id: string;
  name: string;
  slug: string;
  children: { id: string; name: string; slug: string }[];
};

const navLinks = [
  { label: "Boutique", href: "/boutique", hasDropdown: true },
  { label: "iPhone", href: "/boutique?categorie=smartphones&marque=apple" },
  { label: "Samsung", href: "/boutique?marque=samsung" },
  { label: "Offres", href: "/boutique?deals=1" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: "/contact" },
];

export function HeaderClient({
  categories,
  session,
}: {
  categories: Category[];
  session: SessionPayload | null;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 24);
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(query ? `/boutique?q=${encodeURIComponent(query)}` : "/boutique");
    setSearchOpen(false);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Level 1 — slim top bar */}
      <div
        className={clsx(
          "overflow-hidden bg-ink text-white transition-[max-height,opacity] duration-300",
          scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
        )}
      >
        <div className="container-page flex h-9 items-center justify-between text-[12px] text-white/80">
          <p className="hidden sm:block">Livraison rapide à Dakar et partout au Sénégal</p>
          <div className="flex w-full items-center justify-between gap-5 sm:w-auto sm:justify-end">
            <a href="tel:+221788379919" className="link-underline hidden hover:text-white md:block">
              78 837 99 19
            </a>
            <Link href="/compte" className="link-underline hover:text-white">
              Suivre ma commande
            </Link>
            <Link href="/contact" className="link-underline hover:text-white">
              Besoin d&apos;aide ?
            </Link>
            {session?.role === "MERCHANT" && (
              <Link href="/dashboard" className="font-medium text-accent hover:text-white">
                Espace commerçant
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Level 2 — main navigation */}
      <div
        className={clsx(
          "border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300",
          scrolled ? "glass border-transparent" : "border-line bg-white"
        )}
      >
        <div
          className={clsx(
            "container-page flex items-center gap-8 transition-[height] duration-300",
            scrolled ? "h-16" : "h-20"
          )}
        >
          <button
            className="md:hidden"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-6 w-6 text-ink" /> : <Menu className="h-6 w-6 text-ink" />}
          </button>

          <Logo />

          <nav className="hidden items-center gap-9 text-[14.5px] font-medium text-ink md:flex">
            {navLinks.map((link) =>
              link.hasDropdown ? (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => setShopOpen(true)}
                  onMouseLeave={() => setShopOpen(false)}
                >
                  <Link href={link.href} className="flex items-center gap-1 py-2 link-underline">
                    {link.label}
                    <ChevronDown className="h-3.5 w-3.5 text-slate" />
                  </Link>
                  {shopOpen && (
                    <div className="absolute left-0 top-full pt-3">
                      <div className="glass grid w-[min(760px,80vw)] grid-cols-3 gap-x-6 gap-y-5 rounded-3xl p-6">
                        {categories.map((cat) => (
                          <div key={cat.id}>
                            <Link
                              href={`/boutique?categorie=${cat.slug}`}
                              className="text-[13px] font-bold text-ink hover:text-accent"
                            >
                              {cat.name}
                            </Link>
                            {cat.children.length > 0 && (
                              <ul className="mt-2 space-y-1">
                                {cat.children.map((child) => (
                                  <li key={child.id}>
                                    <Link
                                      href={`/boutique?categorie=${child.slug}`}
                                      className="block text-[13px] text-slate transition hover:text-ink"
                                    >
                                      {child.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link key={link.href} href={link.href} className="link-underline py-2">
                  {link.label}
                </Link>
              )
            )}
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <button
              aria-label="Rechercher"
              onClick={() => setSearchOpen((v) => !v)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-mist"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link
              href={session ? (session.role === "MERCHANT" ? "/dashboard" : "/compte") : "/connexion"}
              className="hidden h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-mist sm:flex"
              aria-label="Compte"
            >
              <User className="h-[18px] w-[18px]" />
            </Link>
            <Link
              href="/favoris"
              className="relative hidden h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-mist sm:flex"
              aria-label="Liste d'envies"
            >
              <Heart className="h-[18px] w-[18px]" />
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[9px] font-bold text-white">
                <WishlistCount />
              </span>
            </Link>
            <Link
              href="/panier"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-mist"
              aria-label="Panier"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-ink text-[9px] font-bold text-white">
                <CartCount />
              </span>
            </Link>
          </div>
        </div>

        {searchOpen && (
          <div className="glass border-t-0">
            <form onSubmit={handleSearch} className="container-page flex items-center gap-3 py-4">
              <Search className="h-4 w-4 shrink-0 text-slate" />
              <input
                ref={searchInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                placeholder="Rechercher un iPhone, un Galaxy, une console…"
                className="w-full bg-transparent text-base text-ink outline-none placeholder:text-slate"
              />
              <button type="submit" className="btn btn-primary hidden sm:inline-flex">
                Rechercher
              </button>
            </form>
          </div>
        )}
      </div>

      {menuOpen && (
        <div className="glass border-t-0 px-6 pb-6 md:hidden">
          <form onSubmit={handleSearch} className="mt-4 flex items-center gap-3 border-b border-line py-3">
            <Search className="h-4 w-4 shrink-0 text-slate" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              placeholder="Rechercher un produit"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-slate"
            />
          </form>

          <nav className="mt-4 flex flex-col gap-1 text-[15px] font-medium text-ink">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-2 py-2.5 hover:bg-mist"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/panier"
              className="flex items-center gap-2 rounded-lg px-2 py-2.5 hover:bg-mist"
              onClick={() => setMenuOpen(false)}
            >
              <ShoppingBag className="h-4 w-4" /> Panier (<CartCount />)
            </Link>
            <Link
              href="/favoris"
              className="flex items-center gap-2 rounded-lg px-2 py-2.5 hover:bg-mist"
              onClick={() => setMenuOpen(false)}
            >
              <Heart className="h-4 w-4" /> Favoris (<WishlistCount />)
            </Link>
            <Link
              href={session ? (session.role === "MERCHANT" ? "/dashboard" : "/compte") : "/connexion"}
              className="flex items-center gap-2 rounded-lg px-2 py-2.5 hover:bg-mist"
              onClick={() => setMenuOpen(false)}
            >
              <User className="h-4 w-4" /> {session ? "Mon compte" : "Connexion"}
            </Link>
          </nav>

          <div className="mt-4 border-t border-line pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate">Univers</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/boutique?categorie=${cat.slug}`}
                  className="rounded-full border border-line px-3 py-1.5 text-xs text-ink hover:border-ink"
                  onClick={() => setMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
