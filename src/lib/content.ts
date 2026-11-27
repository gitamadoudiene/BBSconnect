import type { Banner, BannerPlacement } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/format";
import { fromPrice, type ProductWithVariants } from "@/lib/catalog";
import type { HeroPhone, HeroSlide, HeroTheme } from "@/components/home/HeroBanner";
import type { PromoTile } from "@/components/home/Promos";

/* ===========================================================================
   Home page sections — order and visibility are editable from the dashboard.
   ========================================================================= */

export const HOME_SECTIONS = [
  { id: "hero", label: "Grande bannière animée", hint: "Les diapositives de la page Bannières" },
  { id: "services", label: "Bandeau de services", hint: "Livraison, paiement, garantie…" },
  { id: "shortcuts", label: "Raccourcis rayons", hint: "Les icônes rondes iPhone, Samsung…" },
  { id: "tiles", label: "Petites bannières", hint: "Les tuiles promo de la page Bannières" },
  { id: "finder", label: "Recherche & marques", hint: "« Quel téléphone cherchez-vous ? »" },
  { id: "selection", label: "Sélection du moment", hint: "Onglets Tous / iPhone / Samsung / Pixel" },
  { id: "collections", label: "Collections", hint: "Les collections cochées « Afficher sur l'accueil »" },
  { id: "video", label: "Bannière vidéo iPhone 17", hint: "La vidéo « Magique. En vrai. »" },
  { id: "budget", label: "Par budget", hint: "Les 4 tranches de prix" },
  { id: "series", label: "Les gammes", hint: "Liste des générations" },
  { id: "accessories", label: "Accessoires", hint: "4 accessoires mis en avant" },
  { id: "promises", label: "Nos engagements", hint: "Authentique, garanti, livré…" },
  { id: "advice", label: "Bandeau conseil WhatsApp", hint: "« Vous hésitez entre deux modèles ? »" },
] as const;

export type HomeSectionId = (typeof HOME_SECTIONS)[number]["id"];
export type HomeLayout = { id: HomeSectionId; visible: boolean }[];

const SECTION_IDS = HOME_SECTIONS.map((s) => s.id) as readonly string[];

export const DEFAULT_ANNOUNCEMENT = "Livraison 24h à Dakar · Paiement à la livraison · Produits garantis";

export async function getHomeLayout(): Promise<HomeLayout> {
  const row = await prisma.siteSetting.findUnique({ where: { key: "homepage" } });
  const saved = Array.isArray((row?.value as { sections?: unknown })?.sections)
    ? ((row!.value as { sections: { id: string; visible: boolean }[] }).sections ?? [])
    : [];
  const known = saved.filter((s) => SECTION_IDS.includes(s.id)) as HomeLayout;
  // Sections added after the layout was saved are appended, visible.
  const missing = HOME_SECTIONS.filter((s) => !known.some((k) => k.id === s.id)).map((s) => ({
    id: s.id,
    visible: true,
  }));
  return [...known, ...missing];
}

export async function getAnnouncement(): Promise<string> {
  const row = await prisma.siteSetting.findUnique({ where: { key: "announcement" } });
  const text = (row?.value as { text?: string } | null)?.text;
  return typeof text === "string" ? text : DEFAULT_ANNOUNCEMENT;
}

/* ===========================================================================
   Banners
   ========================================================================= */

export type BannerImage = { src: string; alt: string; size?: "s" | "m" | "l" };

export const HERO_THEMES: { id: HeroTheme; label: string; swatch: string }[] = [
  { id: "orange", label: "Orange", swatch: "#ea792c" },
  { id: "blue", label: "Bleu", swatch: "#00a0ca" },
  { id: "ink", label: "Noir", swatch: "#121315" },
];

export const TILE_THEMES: { id: PromoTile["tone"]; label: string; swatch: string }[] = [
  { id: "sky", label: "Bleu ciel", swatch: "#e3f3f8" },
  { id: "paper", label: "Sable", swatch: "#f4f2ed" },
  { id: "peach", label: "Pêche", swatch: "#fcebdf" },
  { id: "ink", label: "Noir", swatch: "#121315" },
];

/** Hero composition by number of images. Image 1 is always the hero (front). */
const HERO_LAYOUTS: Omit<HeroPhone, "src" | "alt">[][] = [
  [],
  [{ x: 6, y: 8, h: 84, rotate: -4, depth: 1, z: 2, fit: true }],
  [
    { x: 36, y: 4, h: 90, rotate: 4, depth: 1, z: 2 },
    { x: 6, y: 16, h: 72, rotate: -9, depth: 0.55, z: 1 },
  ],
  [
    { x: 27, y: 4, h: 90, rotate: -2, depth: 1, z: 2 },
    { x: 4, y: 18, h: 66, rotate: -9, depth: 0.5, z: 1 },
    { x: 54, y: 10, h: 74, rotate: 8, depth: 0.65, z: 1 },
  ],
];

/** Tile image classes — full literals so Tailwind generates them. */
const TILE_SINGLE = {
  s: "-bottom-8 -right-2 w-[34%] rotate-[10deg]",
  m: "-bottom-6 -right-4 w-[50%] rotate-[8deg]",
  l: "-bottom-6 -right-8 w-[64%] -rotate-[4deg]",
} as const;
const TILE_PAIR = ["-bottom-4 right-[18%] w-[38%] -rotate-[6deg]", "-bottom-10 -right-3 w-[36%] rotate-[7deg]"];

export const MAX_IMAGES = { HERO: 3, TILE: 2 } as const;

type BannerSeed = Omit<Banner, "id" | "createdAt" | "updatedAt" | "images" | "startsAt" | "endsAt"> & {
  images: BannerImage[];
};

/** The launch banners — shown while the database has none, and importable. */
export const DEFAULT_BANNERS: BannerSeed[] = [
  {
    placement: "HERO",
    position: 0,
    theme: "orange",
    eyebrow: "Nouveau · Apple",
    title: "iPhone 17 Pro\nest arrivé.",
    text: "Puce A19 Pro, triple 48 Mpx, autonomie record. Disponible en orange cosmique, bleu intense et argent.",
    ctaLabel: "Choisir mon iPhone 17 Pro",
    href: "/boutique?categorie=iphone-17&q=Pro",
    tag: "Nouveau",
    showPrice: true,
    active: true,
    images: [{ src: "/images/banner/iphone17pro-orange.webp", alt: "iPhone 17 Pro orange cosmique" }],
  },
  {
    placement: "HERO",
    position: 1,
    theme: "blue",
    eyebrow: "Samsung Galaxy",
    title: "Galaxy,\nl'autre légende.",
    text: "Galaxy S, Z Fold, Z Flip et Galaxy A : toute la gamme Samsung, neuve et garantie, livrée en 24 h à Dakar.",
    ctaLabel: "Voir les Galaxy",
    href: "/boutique?categorie=smartphones&marque=samsung",
    tag: "Samsung",
    showPrice: true,
    active: true,
    images: [{ src: "/images/banner/galaxy-zfold.webp", alt: "Samsung Galaxy Z Fold bleu, fermé et ouvert" }],
  },
  {
    placement: "HERO",
    position: 2,
    theme: "ink",
    eyebrow: "Petits prix",
    title: "Un iPhone\nà votre budget.",
    text: "Des iPhone 11 aux iPhone 17 : choisissez la génération qui vous va, au juste prix, avec garantie.",
    ctaLabel: "Voir tous les iPhone",
    href: "/boutique?categorie=smartphones&marque=apple",
    tag: "Meilleurs prix",
    showPrice: true,
    active: true,
    images: [{ src: "/images/banner/iphone17-black.webp", alt: "iPhone 17 gris sidéral" }],
  },
  {
    placement: "TILE",
    position: 0,
    theme: "sky",
    eyebrow: "iPhone Air",
    title: "L'iPhone le plus fin.",
    text: null,
    ctaLabel: "J'en profite",
    href: "/boutique/iphone-air",
    tag: null,
    showPrice: true,
    active: true,
    images: [{ src: "/images/banner/iphone-air.webp", alt: "iPhone Air", size: "m" }],
  },
  {
    placement: "TILE",
    position: 1,
    theme: "paper",
    eyebrow: "iPhone 17",
    title: "Le nouveau standard.",
    text: null,
    ctaLabel: "J'en profite",
    href: "/boutique/iphone-17",
    tag: null,
    showPrice: true,
    active: true,
    images: [
      { src: "/images/banner/iphone17-white.webp", alt: "iPhone 17 blanc" },
      { src: "/images/banner/iphone17-black.webp", alt: "iPhone 17 noir" },
    ],
  },
  {
    placement: "TILE",
    position: 2,
    theme: "peach",
    eyebrow: "Accessoires",
    title: "Protégez votre téléphone.",
    text: null,
    ctaLabel: "J'en profite",
    href: "/boutique?categorie=accessoires",
    tag: null,
    showPrice: true,
    active: true,
    images: [{ src: "/images/banner/case-magsafe.webp", alt: "Coque MagSafe pour iPhone", size: "s" }],
  },
  {
    placement: "TILE",
    position: 3,
    theme: "ink",
    eyebrow: "Offres du moment",
    title: "Jusqu'à −{remise} %",
    text: "Sur une sélection de téléphones",
    ctaLabel: "J'en profite",
    href: "/boutique?deals=1",
    tag: null,
    showPrice: false,
    active: true,
    images: [{ src: "/images/banner/iphone12-range.webp", alt: "iPhone 12 en cinq coloris", size: "l" }],
  },
];

export function bannerImages(value: unknown): BannerImage[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is BannerImage => typeof v?.src === "string" && v.src.length > 0)
    .map((v) => ({ src: v.src, alt: typeof v.alt === "string" ? v.alt : "", size: v.size }));
}

/** Live banners for one placement; the launch set if none were ever created. */
export async function getLiveBanners(placement: BannerPlacement) {
  const now = new Date();
  const [total, live] = await Promise.all([
    prisma.banner.count({ where: { placement } }),
    prisma.banner.findMany({
      where: {
        placement,
        active: true,
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
        ],
      },
      orderBy: { position: "asc" },
    }),
  ]);
  if (total === 0) {
    return DEFAULT_BANNERS.filter((b) => b.placement === placement).map((b, i) => ({
      ...b,
      id: `default-${placement}-${i}`,
    }));
  }
  return live.map((b) => ({ ...b, images: bannerImages(b.images) }));
}

type LiveBanner = Awaited<ReturnType<typeof getLiveBanners>>[number];

/* ===========================================================================
   Prices — "dès X F" computed from whatever the banner links to.
   ========================================================================= */

export function priceForHref(
  href: string,
  products: ProductWithVariants[],
  parentSlugOf: Map<string, string | null>
): number | undefined {
  let url: URL;
  try {
    url = new URL(href, "https://bbs.local");
  } catch {
    return undefined;
  }
  let matches: ProductWithVariants[] = [];
  const single = /^\/boutique\/([^/]+)$/.exec(url.pathname);
  if (single) {
    matches = products.filter((p) => p.slug === single[1]);
  } else if (url.pathname === "/boutique") {
    const cat = url.searchParams.get("categorie");
    const brand = url.searchParams.get("marque")?.toLowerCase();
    const deals = url.searchParams.get("deals");
    const q = url.searchParams.get("q")?.toLowerCase();
    matches = products.filter(
      (p) =>
        (!q || `${p.name} ${p.brand}`.toLowerCase().includes(q)) &&
        (!cat || p.category.slug === cat || parentSlugOf.get(p.categoryId) === cat) &&
        (!brand || p.brand.toLowerCase() === brand) &&
        (!deals || p.variants.some((v) => v.compareAtPrice && v.compareAtPrice > v.price))
    );
  }
  const withStock = matches.filter((p) => p.variants.length > 0);
  return withStock.length ? Math.min(...withStock.map(fromPrice)) : undefined;
}

export function toHeroSlide(b: LiveBanner, price?: number): HeroSlide {
  const imgs = b.images.slice(0, MAX_IMAGES.HERO);
  const layout = HERO_LAYOUTS[imgs.length] ?? [];
  const theme = (["orange", "blue", "ink"].includes(b.theme) ? b.theme : "ink") as HeroTheme;
  return {
    key: b.id,
    theme,
    eyebrow: b.eyebrow,
    title: b.title.split("\n").filter(Boolean),
    text: b.text ?? "",
    cta: { label: b.ctaLabel || "Découvrir", href: b.href },
    price: b.showPrice ? price : undefined,
    tag: b.tag ?? "",
    phones: imgs.map((im, i) => ({ src: im.src, alt: im.alt, ...layout[i]! })),
  };
}

export function toPromoTile(b: LiveBanner, price: number | undefined, maxDiscount: number): PromoTile {
  const imgs = b.images.slice(0, MAX_IMAGES.TILE);
  const tone = (["sky", "paper", "peach", "ink"].includes(b.theme) ? b.theme : "paper") as PromoTile["tone"];
  const title = b.title.includes("{remise}")
    ? maxDiscount > 0
      ? b.title.replace("{remise}", String(maxDiscount))
      : "Les bons plans"
    : b.title;
  return {
    key: b.id,
    eyebrow: b.eyebrow,
    title,
    price: b.text ?? (b.showPrice && price !== undefined ? `dès ${formatFCFA(price)}` : undefined),
    cta: b.ctaLabel || "J'en profite",
    href: b.href,
    tone,
    images: imgs.map((im, i) => ({
      src: im.src,
      alt: im.alt,
      className: imgs.length === 2 ? TILE_PAIR[i]! : TILE_SINGLE[im.size ?? "m"],
    })),
  };
}
