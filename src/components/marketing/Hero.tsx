"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ShieldCheck, Sparkles, Truck } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import clsx from "clsx";
import { formatFCFA } from "@/lib/format";
import { pexels } from "@/lib/images";

/** A real product pulled from the database, shown as the live price card of a world. */
export type HeroSpot = {
  slug: string;
  name: string;
  price: number;
  image?: string;
};

type Visual =
  | { type: "video"; src: string; poster?: string }
  | { type: "image"; src: string; alt: string }
  | { type: "collage"; items: { src: string; alt: string }[] };

type World = {
  key: string;
  tab: string;
  eyebrow: string;
  lines: [string, string, string];
  subtitle: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  spotSlug: string;
  /** three stops — drives the halos, the gradient headline and the glow */
  palette: [string, string, string];
  chips: string[];
  visual: Visual;
};

const worlds: World[] = [
  {
    key: "iphone",
    tab: "iPhone 17",
    eyebrow: "Apple · Nouvelle génération",
    lines: ["Le futur", "tient dans", "ta main."],
    subtitle:
      "iPhone 17 Pro, iPhone Air, iPhone 17 : la dernière génération Apple, authentique et garantie, livrée chez vous à Dakar.",
    primary: { label: "Découvrir les iPhone", href: "/boutique?categorie=smartphones&marque=apple" },
    secondary: { label: "Voir les offres", href: "/boutique?deals=1" },
    spotSlug: "iphone-17-pro-max",
    palette: ["#ff8a3d", "#ff3d7f", "#7b5cff"],
    chips: ["Puce A19 Pro", "Triple 48 Mpx", "Titane"],
    visual: { type: "video", src: "/images/xlarge.mp4" },
  },
  {
    key: "galaxy",
    tab: "Samsung Galaxy",
    eyebrow: "Samsung · Galaxy AI",
    lines: ["L'IA.", "Le zoom.", "Sans limite."],
    subtitle:
      "Galaxy S26 Ultra, Z Fold7, Z Flip7 : la puissance Samsung et Galaxy AI arrivent chez BBS Connect.",
    primary: { label: "Explorer Samsung", href: "/boutique?marque=samsung" },
    secondary: { label: "Les pliables", href: "/boutique?categorie=galaxy-z" },
    spotSlug: "galaxy-s26-ultra",
    palette: ["#22d3ee", "#3b82f6", "#6366f1"],
    chips: ["200 Mpx", "S Pen intégré", "Galaxy AI"],
    visual: {
      type: "image",
      src: pexels("30466736", 1400),
      alt: "Samsung Galaxy Ultra tenu en main au-dessus de sa boîte",
    },
  },
  {
    key: "tech",
    tab: "Gaming · Audio · Drones",
    eyebrow: "Univers tech",
    lines: ["Toute la tech.", "Un seul", "endroit."],
    subtitle:
      "PlayStation 5 Pro, AirPods Pro 3, drones DJI, montres connectées : les dernières technos, sélectionnées pour vous.",
    primary: { label: "Explorer l'univers tech", href: "/boutique?categorie=gaming" },
    secondary: { label: "Audio", href: "/boutique?categorie=audio" },
    spotSlug: "playstation-5-pro",
    palette: ["#f0abfc", "#a855f7", "#6366f1"],
    chips: ["PS5 Pro", "Réduction de bruit", "4K / 120 ips"],
    visual: {
      type: "collage",
      items: [
        { src: pexels("32967534", 1200), alt: "PlayStation 5 et sa manette DualSense" },
        { src: pexels("6857559", 900), alt: "AirPods Pro tenus en main" },
        { src: pexels("9182739", 900), alt: "Drone DJI Mini en gros plan" },
      ],
    },
  },
];

const brands = ["Apple", "Samsung", "Google", "Sony", "PlayStation", "Nintendo", "DJI", "Galaxy AI"];

const DURATION = 7000;
const ease = [0.16, 1, 0.3, 1] as const;

export function Hero({ spots }: { spots: Record<string, HeroSpot | undefined> }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const progress = useMotionValue(0);
  const progressWidth = useTransform(progress, (v) => `${v * 100}%`);

  // Autoplay with a pausable progress bar (hover pauses, tab click resets).
  useEffect(() => {
    if (paused) return;
    let last = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      progressRef.current += (now - last) / DURATION;
      last = now;
      if (progressRef.current >= 1) {
        progressRef.current = 0;
        setActive((i) => (i + 1) % worlds.length);
      }
      progress.set(progressRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, progress]);

  function goTo(i: number) {
    progressRef.current = 0;
    setActive(i);
    progress.set(0);
  }

  // Cursor spotlight + 3D tilt
  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const nx = useMotionValue(0);
  const ny = useMotionValue(0);
  const sx = useSpring(nx, { stiffness: 120, damping: 18 });
  const sy = useSpring(ny, { stiffness: 120, damping: 18 });
  const rotateY = useTransform(sx, [-0.5, 0.5], [-9, 9]);
  const rotateX = useTransform(sy, [-0.5, 0.5], [7, -7]);
  const parallaxX = useTransform(sx, [-0.5, 0.5], [-18, 18]);
  const parallaxY = useTransform(sy, [-0.5, 0.5], [-14, 14]);
  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${mx}px ${my}px, rgba(255,255,255,0.075), transparent 65%)`;

  function handleMove(e: React.MouseEvent<HTMLElement>) {
    if (reduceMotion || !sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
    nx.set((e.clientX - rect.left) / rect.width - 0.5);
    ny.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleLeave() {
    setPaused(false);
    nx.set(0);
    ny.set(0);
    mx.set(-1000);
    my.set(-1000);
  }

  const world = worlds[active];
  const spot = spots[world.spotSlug];
  const [c1, c2, c3] = world.palette;
  const gradient = `linear-gradient(100deg, ${c1}, ${c2} 45%, ${c3})`;

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMove}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={handleLeave}
      className="hero-stage relative isolate overflow-hidden bg-[#05060a] text-white"
    >
      {/* ---------- Background: halos, grid, spotlight, grain ---------- */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="hero-blob hero-blob-a"
          initial={false}
          animate={{ color: c1 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />
        <motion.div
          className="hero-blob hero-blob-b"
          initial={false}
          animate={{ color: c2 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />
        <motion.div
          className="hero-blob hero-blob-c"
          initial={false}
          animate={{ color: c3 }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />
        <div className="hero-grid absolute inset-0" />
        <motion.div className="absolute inset-0" style={{ background: spotlight }} />
        <div className="hero-grain absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#05060a] to-transparent" />
      </div>

      <div className="container-page relative grid grid-cols-1 items-center gap-14 pb-10 pt-14 lg:min-h-[calc(100svh-116px)] lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pb-6 lg:pt-10">
        {/* ---------- Copy ---------- */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.div key={world.key} initial="hidden" animate="visible" exit="exit">
              <motion.span
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
                  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3.5 py-1.5 text-[12px] font-semibold tracking-wide text-white/85 backdrop-blur-md"
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
                    style={{ backgroundColor: c1 }}
                  />
                  <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: c1 }} />
                </span>
                {world.eyebrow}
              </motion.span>

              <h1 className="hero-title mt-7">
                {world.lines.map((line, i) => (
                  <span key={line} className="block overflow-hidden pb-[0.06em]">
                    <motion.span
                      className={clsx("block", i === 2 && "hero-gradient-text")}
                      style={i === 2 ? { backgroundImage: gradient } : undefined}
                      variants={{
                        hidden: { y: "110%", rotate: 2 },
                        visible: { y: "0%", rotate: 0, transition: { duration: 0.9, delay: 0.08 + i * 0.09, ease } },
                        exit: { y: "-110%", transition: { duration: 0.4, delay: i * 0.04, ease: [0.7, 0, 0.84, 0] } },
                      }}
                    >
                      {line}
                    </motion.span>
                  </span>
                ))}
              </h1>

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.4, ease } },
                  exit: { opacity: 0, transition: { duration: 0.2 } },
                }}
                className="mt-7 max-w-[480px] text-[16px] leading-relaxed text-white/65 lg:text-[17px]"
              >
                {world.subtitle}
              </motion.p>

              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.5, ease } },
                  exit: { opacity: 0, transition: { duration: 0.2 } },
                }}
                className="mt-9 flex flex-wrap items-center gap-3"
              >
                <Link href={world.primary.href} className="hero-cta group">
                  <span
                    aria-hidden
                    className="hero-cta-glow"
                    style={{ backgroundImage: gradient }}
                  />
                  <span className="relative flex items-center gap-2">
                    {world.primary.label}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Link>
                <Link
                  href={world.secondary.href}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3.5 text-[14px] font-semibold text-white backdrop-blur-md transition hover:border-white/40 hover:bg-white/[0.08]"
                >
                  {world.secondary.label}
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-3 text-[13px] text-white/55">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-white/80" strokeWidth={1.6} /> 100 % authentique
            </span>
            <span className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-white/80" strokeWidth={1.6} /> Livraison 24h à Dakar
            </span>
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-white/80" strokeWidth={1.6} /> Paiement à la livraison
            </span>
          </div>
        </div>

        {/* ---------- Visual ---------- */}
        <div className="relative mx-auto w-full max-w-[560px] lg:max-w-none" style={{ perspective: 1200 }}>
          <motion.div
            aria-hidden
            className="absolute -inset-16 -z-10 rounded-full opacity-70"
            animate={{ background: `radial-gradient(closest-side, ${c2}, transparent)` }}
            transition={{ duration: 1.2 }}
          />

          <motion.div
            style={reduceMotion ? undefined : { rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative aspect-[4/5] w-full sm:aspect-square lg:aspect-[5/5.4]"
          >
            <AnimatePresence mode="popLayout">
              <motion.div
                key={world.key}
                initial={{ opacity: 0, scale: 0.9, filter: "blur(14px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                transition={{ duration: 0.9, ease }}
                className="absolute inset-0"
              >
                <HeroVisual world={world} />
              </motion.div>
            </AnimatePresence>

            {/* Floating spec chips */}
            <motion.div
              style={reduceMotion ? undefined : { x: parallaxX, y: parallaxY, translateZ: 60 }}
              className="pointer-events-none absolute inset-0"
            >
              <AnimatePresence mode="wait">
                <motion.div key={world.key} className="absolute inset-0">
                  {world.chips.map((chip, i) => (
                    <motion.span
                      key={chip}
                      initial={{ opacity: 0, scale: 0.6, y: 12 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.6, delay: 0.45 + i * 0.12, ease }}
                      className={clsx(
                        "hero-chip absolute",
                        i === 0 && "-left-3 top-[12%] sm:-left-8",
                        i === 1 && "-right-2 top-[38%] sm:-right-6",
                        i === 2 && "left-[8%] bottom-[30%] hidden sm:flex"
                      )}
                      style={{ animationDelay: `${i * 0.8}s` }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: world.palette[i] }} />
                      {chip}
                    </motion.span>
                  ))}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Live product card (price from the database) */}
            <AnimatePresence mode="wait">
              {spot && (
                <motion.div
                  key={spot.slug}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.6, delay: 0.55, ease }}
                  style={reduceMotion ? undefined : { translateZ: 80 }}
                  className="absolute -bottom-6 left-3 z-20 sm:-left-6"
                >
                  <Link
                    href={`/boutique/${spot.slug}`}
                    className="group flex items-center gap-3.5 rounded-2xl border border-white/12 bg-[#0d0f16]/70 p-2.5 pr-4 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] backdrop-blur-xl transition hover:border-white/30"
                  >
                    {spot.image && (
                      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/5">
                        <Image src={spot.image} alt="" fill sizes="56px" className="object-cover" />
                      </span>
                    )}
                    <span className="flex flex-col">
                      <span className="text-[11px] font-medium uppercase tracking-wider text-white/45">
                        À partir de
                      </span>
                      <span className="text-[13.5px] font-semibold text-white">{spot.name}</span>
                      <span
                        className="hero-gradient-text text-[15px] font-bold"
                        style={{ backgroundImage: gradient }}
                      >
                        {formatFCFA(spot.price)}
                      </span>
                    </span>
                    <ArrowUpRight className="ml-1 h-4 w-4 text-white/50 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* ---------- World tabs with progress ---------- */}
      <div className="container-page relative z-10">
        <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-5 sm:gap-6">
          {worlds.map((w, i) => (
            <button
              key={w.key}
              onClick={() => goTo(i)}
              className="group text-left"
              aria-label={`Afficher ${w.tab}`}
              aria-current={i === active}
            >
              <span className="relative block h-[2px] w-full overflow-hidden rounded-full bg-white/10">
                <motion.span
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    width: i === active ? progressWidth : i < active ? "100%" : "0%",
                    backgroundImage: `linear-gradient(90deg, ${w.palette[0]}, ${w.palette[2]})`,
                    opacity: i < active ? 0.35 : 1,
                  }}
                />
              </span>
              <span className="mt-3 flex items-baseline gap-2.5">
                <span className="font-mono text-[11px] text-white/35">0{i + 1}</span>
                <span
                  className={clsx(
                    "text-[12.5px] font-semibold transition-colors sm:text-[14px]",
                    i === active ? "text-white" : "text-white/45 group-hover:text-white/80"
                  )}
                >
                  {w.tab}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ---------- Brand marquee ---------- */}
      <div className="relative z-10 mt-10 overflow-hidden border-t border-white/[0.07] py-6 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="hero-marquee flex w-max items-center gap-14">
          {[...brands, ...brands].map((b, i) => (
            <span key={`${b}-${i}`} className="flex items-center gap-14">
              <span className="text-outline text-[clamp(1.75rem,3vw,2.75rem)] font-extrabold uppercase tracking-tight">
                {b}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function HeroVisual({ world }: { world: World }) {
  const v = world.visual;
  const [c1, , c3] = world.palette;
  const frame = "relative h-full w-full overflow-hidden rounded-[34px] bg-[#0b0d14]";

  return (
    <div
      className="h-full w-full rounded-[36px] p-px"
      style={{ backgroundImage: `linear-gradient(140deg, ${c1}aa, transparent 35%, transparent 65%, ${c3}aa)` }}
    >
      {v.type === "video" && (
        <div className={frame}>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
            aria-label="Présentation vidéo de l'iPhone 17"
          >
            <source src={v.src} type="video/mp4" />
          </video>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      )}

      {v.type === "image" && (
        <div className={frame}>
          <Image src={v.src} alt={v.alt} fill priority sizes="(min-width: 1024px) 45vw, 90vw" className="object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
        </div>
      )}

      {v.type === "collage" && (
        <div className={clsx(frame, "grid grid-cols-2 grid-rows-2 gap-1.5 bg-transparent")}>
          {v.items.map((it, i) => (
            <div
              key={it.src}
              className={clsx(
                "relative overflow-hidden bg-[#0b0d14]",
                i === 0 && "col-span-2 rounded-t-[34px] rounded-b-md",
                i === 1 && "rounded-bl-[34px] rounded-tr-md rounded-tl-md rounded-br-md",
                i === 2 && "rounded-br-[34px] rounded-tl-md rounded-tr-md rounded-bl-md"
              )}
            >
              <Image src={it.src} alt={it.alt} fill sizes="(min-width: 1024px) 30vw, 60vw" className="object-cover" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
