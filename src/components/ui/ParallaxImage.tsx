"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

export function ParallaxImage({
  src,
  alt,
  className,
  intensity = 60,
}: {
  src: string;
  alt: string;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-intensity, intensity]);

  if (reduceMotion) {
    return (
      <div className={className} style={{ position: "absolute", inset: 0 }}>
        <Image src={src} alt={alt} fill sizes="100vw" className="object-cover" />
      </div>
    );
  }

  return (
    <div ref={ref} className={className} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <motion.div
        style={{ y, position: "absolute", inset: `-${intensity}px 0` }}
      >
        <Image src={src} alt={alt} fill sizes="100vw" className="object-cover" />
      </motion.div>
    </div>
  );
}
