"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import clsx from "clsx";
import { formatFCFA } from "@/lib/format";

/** Live "from" prices, read from the catalogue on the server. */
export type BannerPrices = { iphonePro?: number; samsung?: number; iphone?: number };

type Phone = {
  src: string;
  alt: string;
  /** position & size in % of the stage, depth drives parallax strength */
  x: number;
  y: number;
  h: number;
  rotate: number;
  depth: number;
  z: number;
};

type Slide = {
  key: string;
  theme: "orange" | "blue" | "ink";
  eyebrow: string;
  title: string[];
  text: string;
  cta: { label: string; href: string };
  price?: keyof BannerPrices;
  tag: string;
  phones: Phone[];
};

const slides: Slide[] = [
  {
    key: "iphone17pro",
    theme: "orange",
    eyebrow: "Nouveau · Apple",
    title: ["iPhone 17 Pro", "est arrivé."],
    text: "Puce A19 Pro, triple 48 Mpx, autonomie record. Disponible en orange cosmique, bleu intense et argent.",
    cta: { label: "Choisir mon iPhone 17 Pro", href: "/boutique?categorie=iphone-17" },
    price: "iphonePro",
    tag: "Nouveau",
    phones: [
      { src: "/images/banner/iphone17pro-deepblue.webp", alt: "iPhone 17 Pro bleu intense", x: 6, y: 16, h: 70, rotate: -9, depth: 0.5, z: 1 },
      { src: "/images/banner/iphone17pro-silver.webp", alt: "iPhone 17 Pro argent", x: 52, y: 12, h: 72, rotate: 8, depth: 0.6, z: 1 },
      { src: "/images/banner/iphone17pro-orange.webp", alt: "iPhone 17 Pro orange cosmique", x: 26, y: 6, h: 90, rotate: -2, depth: 1, z: 2 },
    ],
  },
  {
    key: "galaxy",
    theme: "blue",
    eyebrow: "Samsung Galaxy",
    title: ["Galaxy,", "l'autre légende."],
    text: "Galaxy S, Z Fold, Z Flip et Galaxy A : toute la gamme Samsung, neuve et garantie, livrée en 24 h à Dakar.",
    cta: { label: "Voir les Galaxy", href: "/boutique?marque=samsung" },
    price: "samsung",
    tag: "Samsung",
    phones: [
      { src: "/images/banner/galaxy-duo.webp", alt: "Deux smartphones Samsung Galaxy", x: 10, y: 12, h: 78, rotate: -8, depth: 1, z: 2 },
    ],
  },
  {
    key: "iphone-prices",
    theme: "ink",
    eyebrow: "Petits prix",
    title: ["Un iPhone", "à votre budget."],
    text: "Des iPhone 11 aux iPhone 17 : choisissez la génération qui vous va, au juste prix, avec garantie.",
    cta: { label: "Voir tous les iPhone", href: "/boutique?categorie=smartphones&marque=apple" },
    price: "iphone",
    tag: "Meilleurs prix",
    phones: [
      { src: "/images/banner/iphone12-range.webp", alt: "iPhone 12 en cinq coloris", x: 0, y: 30, h: 58, rotate: -4, depth: 0.45, z: 1 },
      { src: "/images/banner/iphone-air.webp", alt: "iPhone Air bleu ciel", x: 58, y: 8, h: 74, rotate: 7, depth: 0.7, z: 1 },
      { src: "/images/banner/iphone17-black.webp", alt: "iPhone 17 noir", x: 33, y: 2, h: 92, rotate: -3, depth: 1, z: 2 },
    ],
  },
];

const themes = {
  orange: {
    bg: "bg-signal",
    text: "text-ink",
    muted: "text-ink/70",
    circleA: "bg-[#f39a52]",
    circleB: "bg-[#d9661c]",
    cta: "bg-ink text-white hover:bg-ink-soft",
    tag: "bg-ink text-white",
    dot: "bg-ink",
  },
  blue: {
    bg: "bg-brand",
    text: "text-white",
    muted: "text-white/80",
    circleA: "bg-[#2bb3d6]",
    circleB: "bg-[#0089b0]",
    cta: "bg-white text-ink hover:bg-paper",
    tag: "bg-signal text-ink",
    dot: "bg-white",
  },
  ink: {
    bg: "bg-ink",
    text: "text-white",
    muted: "text-white/70",
    circleA: "bg-[#1f2124]",
    circleB: "bg-[#25282c]",
    cta: "bg-signal text-ink hover:bg-[#f08c47]",
    tag: "bg-brand text-ink",
    dot: "bg-white",
  },
} as const;

const DURATION = 6500;
const spring = { type: "spring", stiffness: 120, damping: 16, mass: 0.9 } as const;

export function HeroBanner({ prices }: { prices: BannerPrices }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);

  const progress = useMotionValue(0);
  const progressWidth = useTransform(progress, (v) => `${v * 100}%`);

  const go = useCallback(
    (next: number, direction: number) => {
      setDir(direction);
      setIndex((next + slides.length) % slides.length);
      progress.set(0);
    },
    [progress]
  );

  // Autoplay — pauses on hover / focus, resumes where it stopped.
  useEffect(() => {
    if (paused || reduce) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const v = progress.get() + (now - last) / DURATION;
      last = now;
      if (v >= 1) {
        progress.set(0);
        setDir(1);
        setIndex((i) => (i + 1) % slides.length);
      } else {
        progress.set(v);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, reduce, progress]);

  // Mouse parallax, shared by every phone and scaled by its depth.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 90, damping: 18 });
  const sy = useSpring(my, { stiffness: 90, damping: 18 });

  function onMove(e: React.PointerEvent) {
    if (reduce || e.pointerType !== "mouse" || !stageRef.current) return;
    const r = stageRef.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }

  const slide = slides[index];
  const t = themes[slide.theme];
  const price = slide.price ? prices[slide.price] : undefined;

  return (
    <section aria-roledescription="carrousel" aria-label="Offres à la une" className="container-page pt-4 lg:pt-6">
      <div
        ref={stageRef}
        onPointerMove={onMove}
        onPointerLeave={() => {
          mx.set(0);
          my.set(0);
          setPaused(false);
        }}
        onPointerEnter={() => setPaused(true)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
        className={clsx(
          "relative isolate overflow-hidden rounded-[28px] transition-colors duration-700",
          t.bg
        )}
      >
        {/* Brand circles — the logo's two discs, drifting slowly behind the phones */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <motion.span
            className={clsx("absolute right-[-8%] top-[-30%] h-[120%] aspect-square rounded-full transition-colors duration-700", t.circleA)}
            animate={reduce ? undefined : { x: [0, 24, 0], y: [0, 18, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.span
            className={clsx("absolute bottom-[-45%] right-[22%] h-[90%] aspect-square rounded-full transition-colors duration-700", t.circleB)}
            animate={reduce ? undefined : { x: [0, -20, 0], y: [0, -14, 0] }}
            transition={{ duration: 17, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <motion.div
          className="grid min-h-[600px] grid-cols-1 sm:min-h-[560px] lg:min-h-[500px] lg:grid-cols-[0.95fr_1.05fr]"
          drag={reduce ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) go(index + 1, 1);
            else if (info.offset.x > 60) go(index - 1, -1);
          }}
        >
          {/* Copy */}
          <div className={clsx("relative z-10 flex flex-col justify-center px-6 pb-2 pt-8 sm:px-10 lg:py-14 lg:pl-14", t.text)}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={slide.key}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="font-mono text-[12px] uppercase tracking-[0.12em] opacity-75">{slide.eyebrow}</p>
                <h1 className="mt-4 text-[clamp(2.5rem,5vw,4.75rem)] font-bold leading-[0.95] tracking-[-0.05em]">
                  {slide.title.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h1>
                <p className={clsx("mt-5 max-w-[40ch] text-[16px] leading-relaxed", t.muted)}>{slide.text}</p>
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <Link href={slide.cta.href} className={clsx("btn h-[52px] px-6", t.cta)}>
                    {slide.cta.label} <ArrowRight className="h-4 w-4" />
                  </Link>
                  {price !== undefined && (
                    <span className="font-mono text-[13px]">
                      <span className="opacity-70">dès </span>
                      <span className="tabular text-[17px] font-semibold">{formatFCFA(price)}</span>
                    </span>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Phones */}
          <div className="relative mb-16 min-h-[300px] sm:min-h-[340px] lg:mb-0 lg:min-h-0">
            <AnimatePresence mode="popLayout" initial={false} custom={dir}>
              <motion.div key={slide.key} className="absolute inset-0" custom={dir}>
                {slide.phones.map((p, i) => (
                  <FloatingPhone key={p.src} phone={p} order={i} dir={dir} sx={sx} sy={sy} reduce={!!reduce} />
                ))}

                {/* Swinging price tag */}
                <motion.div
                  className="absolute right-[6%] top-[6%] z-20 origin-top lg:right-[8%] lg:top-[8%]"
                  initial={{ opacity: 0, y: -30, rotate: -25 }}
                  animate={reduce ? { opacity: 1, y: 0, rotate: 0 } : { opacity: 1, y: 0, rotate: [-25, 14, -8, 5, -2, 0] }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 1.4, delay: 0.35, ease: "easeOut" }}
                >
                  <span aria-hidden className="mx-auto block h-5 w-px bg-current opacity-40" />
                  <span
                    className={clsx(
                      "flex h-[92px] w-[92px] flex-col items-center justify-center rounded-full text-center font-mono text-[10.5px] font-medium uppercase leading-tight tracking-[0.06em] lg:h-[108px] lg:w-[108px] lg:text-[11.5px]",
                      t.tag
                    )}
                  >
                    {slide.tag}
                    {price !== undefined && (
                      <span className="tabular mt-1 text-[12px] font-semibold normal-case tracking-normal lg:text-[13px]">
                        dès {price.toLocaleString("fr-FR").replace(/ | /g, " ")} F
                      </span>
                    )}
                  </span>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Controls */}
        <div className={clsx("absolute inset-x-0 bottom-0 z-20 flex items-center gap-4 px-6 pb-5 sm:px-10 lg:pl-14", t.text)}>
          <div className="flex flex-1 gap-2 sm:max-w-[260px]" role="tablist" aria-label="Choisir une offre">
            {slides.map((s, i) => (
              <button
                key={s.key}
                role="tab"
                aria-selected={i === index}
                aria-label={`${s.title.join(" ")} (${i + 1} sur ${slides.length})`}
                onClick={() => go(i, i > index ? 1 : -1)}
                className="relative h-1 flex-1 overflow-hidden rounded-full bg-current/25"
              >
                <motion.span
                  className={clsx("absolute inset-y-0 left-0 rounded-full", t.dot)}
                  style={{ width: i === index ? progressWidth : i < index ? "100%" : "0%" }}
                />
              </button>
            ))}
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={() => go(index - 1, -1)}
              aria-label="Offre précédente"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-current/30 transition-colors hover:border-current"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => go(index + 1, 1)}
              aria-label="Offre suivante"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-current/30 transition-colors hover:border-current"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function FloatingPhone({
  phone,
  order,
  dir,
  sx,
  sy,
  reduce,
}: {
  phone: Phone;
  order: number;
  dir: number;
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  reduce: boolean;
}) {
  const px = useTransform(sx, (v) => v * 46 * phone.depth);
  const py = useTransform(sy, (v) => v * 30 * phone.depth);

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${phone.x}%`,
        top: `${phone.y}%`,
        height: `${phone.h}%`,
        zIndex: phone.z,
        x: reduce ? 0 : px,
        y: reduce ? 0 : py,
      }}
      initial={{ opacity: 0, x: dir * 160, rotate: phone.rotate + dir * 18, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, rotate: phone.rotate, scale: 1 }}
      exit={{ opacity: 0, x: -dir * 120, rotate: phone.rotate - dir * 10, transition: { duration: 0.35 } }}
      transition={{ ...spring, delay: 0.08 * order }}
    >
      {/* idle float — each phone on its own phase */}
      <motion.div
        className="h-full"
        animate={reduce ? undefined : { y: [0, -12, 0], rotate: [0, order % 2 ? 1.4 : -1.4, 0] }}
        transition={{ duration: 4.2 + order * 0.7, repeat: Infinity, ease: "easeInOut", delay: order * 0.5 }}
      >
        <Image
          src={phone.src}
          alt={phone.alt}
          width={900}
          height={900}
          sizes="(min-width: 1024px) 380px, 60vw"
          className="h-full w-auto max-w-none select-none object-contain drop-shadow-[0_28px_30px_rgba(0,0,0,0.28)]"
          draggable={false}
        />
      </motion.div>
    </motion.div>
  );
}
