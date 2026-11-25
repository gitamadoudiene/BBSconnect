import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BadgePercent,
  CreditCard,
  Headphones,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Truck,
  Wallet,
} from "lucide-react";
import clsx from "clsx";
import { formatFCFA } from "@/lib/format";

/* ---------------------------------------------------------------------------
   Service strip — the reassurance line every good retail site has under the
   hero. Icon + two short lines each.
   ------------------------------------------------------------------------- */

const services = [
  { icon: Truck, title: "Livraison 24 h", text: "Partout à Dakar" },
  { icon: Wallet, title: "Paiement à la livraison", text: "ou Mobile Money" },
  { icon: ShieldCheck, title: "Garantie", text: "Défauts de fabrication" },
  { icon: BadgeCheck, title: "100 % authentique", text: "Produits d'origine" },
  { icon: MessageCircle, title: "Conseil WhatsApp", text: "78 837 99 19" },
];

export function ServiceStrip() {
  return (
    <section aria-label="Nos services" className="container-page pt-4 lg:pt-5">
      <ul className="rail flex gap-2 overflow-x-auto lg:grid lg:grid-cols-5 lg:gap-3">
        {services.map((s) => (
          <li
            key={s.title}
            className="flex min-w-[220px] items-center gap-3 rounded-[18px] border border-line px-4 py-3.5 lg:min-w-0"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-tint text-accent">
              <s.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </span>
            <span className="leading-tight">
              <span className="block text-[14px] font-semibold tracking-[-0.01em] text-ink">{s.title}</span>
              <span className="mt-0.5 block font-mono text-[11.5px] text-slate">{s.text}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Shortcuts — round icon entries, the "rayons" of the shop.
   ------------------------------------------------------------------------- */

function AppleGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M16.37 12.6c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.18-1.72-1.35-.14-2.64.8-3.33.8-.69 0-1.74-.78-2.87-.76-1.47.02-2.83.86-3.59 2.18-1.53 2.66-.39 6.6 1.1 8.75.73 1.05 1.6 2.24 2.73 2.2 1.1-.05 1.51-.71 2.84-.71 1.32 0 1.7.71 2.86.69 1.18-.02 1.93-1.07 2.65-2.13.84-1.22 1.18-2.4 1.2-2.46-.03-.01-2.3-.88-2.33-3.5ZM14.19 6.12c.6-.74 1.01-1.75.9-2.77-.87.04-1.93.58-2.55 1.31-.56.65-1.05 1.69-.92 2.68.97.08 1.96-.49 2.57-1.22Z" />
    </svg>
  );
}

const shortcuts = [
  { label: "iPhone", href: "/boutique?categorie=smartphones&marque=apple", icon: "apple" as const },
  { label: "Samsung", href: "/boutique?marque=samsung", icon: Smartphone },
  { label: "Pixel", href: "/boutique?marque=google", icon: Smartphone },
  { label: "Écouteurs", href: "/boutique?categorie=accessoires&q=pro", icon: Headphones },
  { label: "Accessoires", href: "/boutique?categorie=accessoires", icon: ShieldCheck },
  { label: "Offres", href: "/boutique?deals=1", icon: BadgePercent },
  { label: "Petit budget", href: "/boutique?categorie=smartphones&prix=0-250000", icon: CreditCard },
];

export function Shortcuts() {
  return (
    <nav aria-label="Rayons" className="container-page pt-10 lg:pt-14">
      <ul className="rail flex gap-3 overflow-x-auto sm:justify-between">
        {shortcuts.map((s) => (
          <li key={s.label} className="shrink-0">
            <Link href={s.href} className="group flex w-[84px] flex-col items-center gap-2.5 text-center sm:w-[96px]">
              <span className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-paper text-ink transition-colors group-hover:bg-ink group-hover:text-white sm:h-[76px] sm:w-[76px]">
                {s.icon === "apple" ? (
                  <AppleGlyph className="h-7 w-7" />
                ) : (
                  <s.icon className="h-7 w-7" strokeWidth={1.6} />
                )}
              </span>
              <span className="text-[13.5px] font-medium text-ink">{s.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ---------------------------------------------------------------------------
   Promo tiles — the small banners under the hero.
   ------------------------------------------------------------------------- */

export type PromoTile = {
  key: string;
  eyebrow: string;
  title: string;
  price?: string;
  href: string;
  tone: "sky" | "paper" | "peach" | "ink";
  images: { src: string; alt: string; className: string }[];
};

const tones = {
  sky: "bg-accent-tint text-ink",
  paper: "bg-paper text-ink",
  peach: "bg-signal-tint text-ink",
  ink: "bg-ink text-white",
};

export function PromoTiles({ tiles }: { tiles: PromoTile[] }) {
  return (
    <section aria-label="À la une" className="container-page pt-10 lg:pt-14">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {tiles.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={clsx("group relative flex h-[230px] overflow-hidden rounded-[24px] p-6 lg:h-[260px]", tones[t.tone])}
          >
            <div className="relative z-10 flex max-w-[58%] flex-col">
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] opacity-70">{t.eyebrow}</span>
              <span className="mt-2 text-[22px] font-bold leading-[1.05] tracking-[-0.035em] lg:text-[24px]">{t.title}</span>
              {t.price && <span className="tabular mt-2 font-mono text-[12.5px] opacity-80">{t.price}</span>}
              <span className="mt-auto inline-flex items-center gap-1.5 text-[13.5px] font-semibold">
                <span className="link-underline">J&apos;en profite</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
            {t.images.map((im) => (
              <Image
                key={im.src}
                src={im.src}
                alt={im.alt}
                width={600}
                height={800}
                sizes="200px"
                className={clsx(
                  "pointer-events-none absolute h-auto object-contain drop-shadow-[0_18px_20px_rgba(0,0,0,0.22)] transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:rotate-[-2deg]",
                  im.className
                )}
              />
            ))}
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   Video banner — the iPhone 17 film, framed like a screen.
   ------------------------------------------------------------------------- */

export function VideoBanner({ price }: { price?: number }) {
  return (
    <section className="container-page pb-4">
      <div className="grid grid-cols-1 items-center gap-8 overflow-hidden rounded-[28px] bg-ink p-6 text-white sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:gap-12 lg:p-14">
        <div>
          <p className="flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.12em] text-white/60">
            <AppleGlyph className="h-4 w-4 text-white" /> iPhone 17
          </p>
          <h2 className="mt-5 text-[clamp(2.25rem,4vw,3.75rem)] font-bold leading-[0.96] tracking-[-0.05em]">
            Magique.
            <br />
            <span className="text-signal">En vrai.</span>
          </h2>
          <p className="mt-5 max-w-[42ch] text-[16px] leading-relaxed text-white/70">
            Écran ProMotion 120 Hz, puce A19 et double capteur 48 Mpx. Commandez-le aujourd&apos;hui, on vous le
            livre en 24 h à Dakar.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/boutique?categorie=iphone-17" className="btn btn-inverse h-[52px] px-6">
              Découvrir l&apos;iPhone 17 <ArrowRight className="h-4 w-4" />
            </Link>
            {price !== undefined && (
              <span className="font-mono text-[13px] text-white/70">
                dès <span className="tabular text-[17px] font-semibold text-white">{formatFCFA(price)}</span>
              </span>
            )}
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-[22px] border border-white/10 bg-black">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="aspect-[16/11] h-full w-full object-cover"
              aria-label="Vidéo de présentation de l'iPhone 17"
            >
              <source src="/images/xlarge.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
