"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import clsx from "clsx";
import { images } from "@/lib/images";

const slides = [
  {
    eyebrow: "Nouvelle collection",
    title: ["L'iPhone.", "Dans sa meilleure version."],
    subtitle:
      "Découvrez les dernières générations d'iPhone, sélectionnées pour leur performance, leur design et leur expérience.",
    primary: { label: "Découvrir les iPhone", href: "/boutique" },
    secondary: { label: "Voir les offres", href: "/boutique?deals=1" },
    image: images.heroSlides[0],
  },
  {
    eyebrow: "iPhone Pro",
    title: ["La puissance,", "sans compromis."],
    subtitle:
      "Le système photo Pro, la puce la plus rapide jamais conçue pour un iPhone, et un châssis en titane taillé pour durer.",
    primary: { label: "Découvrir iPhone Pro", href: "/boutique?categorie=iphone-16" },
    secondary: { label: "Voir les offres", href: "/boutique?deals=1" },
    image: images.heroSlides[1],
  },
  {
    eyebrow: "Offres BBS Connect",
    title: ["Votre prochain iPhone", "vous attend."],
    subtitle:
      "Profitez de nos meilleures offres de la semaine sur une sélection d'iPhone soigneusement choisie.",
    primary: { label: "Voir les offres", href: "/boutique?deals=1" },
    secondary: { label: "Explorer la boutique", href: "/boutique" },
    image: images.heroSlides[2],
  },
];

export function Hero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(id);
  }, [paused]);

  const slide = slides[active];

  return (
    <section
      className="relative overflow-hidden bg-paper"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container-page grid min-h-[560px] grid-cols-1 items-center gap-10 py-16 lg:min-h-[720px] lg:grid-cols-[1fr_1.05fr] lg:gap-8 lg:py-20">
        <div className="relative z-10 max-w-xl">
          <p key={`eyebrow-${active}`} className="text-eyebrow animate-hero-in text-accent">
            {slide.eyebrow}
          </p>
          <h1 key={`title-${active}`} className="text-display animate-hero-in mt-5 text-ink">
            {slide.title[0]}
            <br />
            {slide.title[1]}
          </h1>
          <p key={`subtitle-${active}`} className="animate-hero-in mt-6 max-w-md text-[16px] leading-relaxed text-slate">
            {slide.subtitle}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href={slide.primary.href} className="btn btn-primary">
              {slide.primary.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={slide.secondary.href} className="btn btn-secondary">
              {slide.secondary.label}
            </Link>
          </div>

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

        <div className="relative mx-auto aspect-[4/5] w-full max-w-md lg:max-w-none">
          <div className="pointer-events-none absolute -inset-x-10 -inset-y-16 -z-10 rounded-full bg-[radial-gradient(50%_50%_at_50%_45%,rgba(20,110,245,0.10),transparent_70%)]" />
          {slides.map((s, i) => (
            <div
              key={s.image}
              className={clsx(
                "absolute inset-0 overflow-hidden rounded-[32px] transition-opacity duration-700",
                i === active ? "opacity-100" : "opacity-0"
              )}
            >
              <Image
                src={s.image}
                alt=""
                fill
                priority={i === 0}
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
