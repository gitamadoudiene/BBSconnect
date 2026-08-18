"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import clsx from "clsx";

const slides = [
  {
    eyebrow: "Nouvelle collection",
    title: ["L'iPhone.", "Dans sa meilleure version."],
    subtitle:
      "Découvrez les dernières générations d'iPhone, sélectionnées pour leur performance, leur design et leur expérience.",
    primary: { label: "Découvrir les iPhone", href: "/boutique" },
    secondary: { label: "Voir les offres", href: "/boutique?deals=1" },
  },
  {
    eyebrow: "iPhone Pro",
    title: ["La puissance,", "sans compromis."],
    subtitle:
      "Le système photo Pro, la puce la plus rapide jamais conçue pour un iPhone, et un châssis en titane taillé pour durer.",
    primary: { label: "Découvrir iPhone Pro", href: "/boutique?categorie=iphone-17" },
    secondary: { label: "Voir les offres", href: "/boutique?deals=1" },
  },
  {
    eyebrow: "Offres BBS Connect",
    title: ["Votre prochain iPhone", "vous attend."],
    subtitle:
      "Profitez de nos meilleures offres de la semaine sur une sélection d'iPhone soigneusement choisie.",
    primary: { label: "Voir les offres", href: "/boutique?deals=1" },
    secondary: { label: "Explorer la boutique", href: "/boutique" },
  },
];

const textUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
} as const;

const easeOut = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const springX = useSpring(mvX, { stiffness: 150, damping: 20 });
  const springY = useSpring(mvY, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [3, -3]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-3, 3]);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [paused]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduceMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mvX.set((e.clientX - rect.left) / rect.width - 0.5);
    mvY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    setPaused(false);
    mvX.set(0);
    mvY.set(0);
  }

  const slide = slides[active];

  return (
    <section
      className="relative overflow-hidden bg-paper"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div className="container-page grid min-h-[560px] grid-cols-1 items-center gap-10 py-16 lg:min-h-[720px] lg:grid-cols-[1fr_1.05fr] lg:gap-8 lg:py-20">
        <div className="relative z-10 max-w-xl">
          <motion.p
            key={`eyebrow-${active}`}
            initial={textUp.hidden}
            animate={textUp.visible}
            transition={{ duration: 0.6, delay: 0, ease: easeOut }}
            className="text-eyebrow text-accent"
          >
            {slide.eyebrow}
          </motion.p>
          <motion.h1
            key={`title-${active}`}
            initial={textUp.hidden}
            animate={textUp.visible}
            transition={{ duration: 0.6, delay: 0.12, ease: easeOut }}
            className="text-display mt-5 text-ink"
          >
            {slide.title[0]}
            <br />
            {slide.title[1]}
          </motion.h1>
          <motion.p
            key={`subtitle-${active}`}
            initial={textUp.hidden}
            animate={textUp.visible}
            transition={{ duration: 0.6, delay: 0.24, ease: easeOut }}
            className="mt-6 max-w-md text-[16px] leading-relaxed text-slate"
          >
            {slide.subtitle}
          </motion.p>

          <motion.div
            key={`cta-${active}`}
            initial={textUp.hidden}
            animate={textUp.visible}
            transition={{ duration: 0.6, delay: 0.36, ease: easeOut }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link href={slide.primary.href} className="btn btn-primary">
              {slide.primary.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={slide.secondary.href} className="btn btn-secondary">
              {slide.secondary.label}
            </Link>
          </motion.div>

          <div className="mt-14 flex items-center gap-2.5">
            {slides.map((s, i) => (
              <button
                key={s.eyebrow}
                aria-label={`Aller à la diapositive ${i + 1}`}
                onClick={() => setActive(i)}
                className={clsx(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === active ? "w-8 bg-ink" : "w-1.5 bg-line hover:bg-slate"
                )}
              />
            ))}
          </div>
        </div>

        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className="relative mx-auto aspect-[5/5] w-full max-w-md lg:max-w-none"
          style={{ perspective: 1000 }}
        >
          <div className="pointer-events-none absolute -inset-x-10 -inset-y-16 -z-10 rounded-full bg-[radial-gradient(50%_50%_at_50%_45%,rgba(11,112,225,0.10),transparent_70%)]" />
          <span className="glass absolute -right-2 -top-2 z-20 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide text-ink">
            Nouveau
          </span>
          <motion.div
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="absolute inset-0 overflow-hidden rounded-[32px]"
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              className="h-full w-full object-cover"
              aria-label="Présentation vidéo de l'iPhone 17"
            >
              <source src="/images/xlarge.mp4" type="video/mp4" />
            </video>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
