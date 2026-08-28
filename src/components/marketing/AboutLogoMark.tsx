"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";

const easeOut = [0.16, 1, 0.3, 1] as const;

export function AboutLogoMark() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto aspect-square w-64 sm:w-72">
      <div className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(11,112,225,0.16),transparent_70%)]" />

      <motion.div
        aria-hidden
        className="absolute inset-6 rounded-full border border-accent/25"
        initial={{ opacity: 0.35, scale: 1 }}
        animate={reduceMotion ? { opacity: 0.5 } : { opacity: [0.35, 0.7, 0.35], scale: [1, 1.06, 1] }}
        transition={reduceMotion ? { duration: 0.6 } : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: easeOut }}
        className="absolute inset-0"
      >
        <div className="glass glass-sheen h-full w-full rounded-[32px]">
          <div className={clsx("flex h-full w-full flex-col items-center justify-center px-8", !reduceMotion && "animate-float")}>
            <Image
              src="/images/logobbs.jpeg"
              alt="Balla Business Service"
              width={619}
              height={246}
              className="w-full max-w-[220px] object-contain select-none"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
