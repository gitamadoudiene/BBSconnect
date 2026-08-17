"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { PhoneMock } from "@/components/ui/PhoneMock";
import { Reveal } from "@/components/ui/Reveal";

const phones = [
  { color: "#8f8477", rotate: -6, offsetY: 24, size: "h-[78%]", z: "z-10", depth: 26 },
  { color: "#20242b", rotate: 0, offsetY: -8, size: "h-full", z: "z-20", depth: 10 },
  { color: "#5a7a9e", rotate: 6, offsetY: 40, size: "h-[74%]", z: "z-10", depth: 34 },
];

function Phone({ p, index, progress }: { p: (typeof phones)[number]; index: number; progress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  const reduceMotion = useReducedMotion();
  const y = useTransform(progress, [0, 1], [p.depth, -p.depth]);

  return (
    <motion.div
      style={reduceMotion ? { top: p.offsetY } : { y, top: p.offsetY }}
      className={`absolute ${p.size} w-32 ${p.z} drop-shadow-2xl transition-transform duration-500 hover:!rotate-0`}
      initial={false}
      animate={{ rotate: p.rotate }}
      whileHover={{ rotate: 0 }}
      data-index={index}
    >
      <PhoneMock color={p.color} variant="back" />
    </motion.div>
  );
}

export function OfferSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });

  return (
    <section className="section-space overflow-hidden bg-ink">
      <div className="container-page grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <span className="glass-pill-dark inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide text-accent">
            Offres de la semaine
          </span>
          <h2 className="text-h1 mt-6 text-white">
            Votre prochain iPhone
            <br />
            est peut-être ici.
          </h2>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/60">
            Profitez de nos offres disponibles cette semaine, sur une sélection d&apos;iPhone
            soigneusement choisie.
          </p>
          <Link href="/boutique?deals=1" className="btn btn-inverse mt-9">
            Voir les offres <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <Reveal delay={120}>
          <div ref={ref} className="relative flex h-72 items-center justify-center sm:h-80 lg:h-96">
            {phones.map((p, i) => (
              <div key={i} className="absolute" style={{ left: `${28 + i * 22}%`, marginLeft: "-4rem" }}>
                <Phone p={p} index={i} progress={scrollYProgress} />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
