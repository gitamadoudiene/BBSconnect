"use client";

import { MessageCircle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export function WhatsAppButton() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.a
      href="https://wa.me/221788379919"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Discuter sur WhatsApp"
      initial={{ opacity: 0, y: 16, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={reduceMotion ? undefined : { scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_-6px_rgba(37,211,102,0.6)] sm:bottom-7 sm:right-7"
    >
      {!reduceMotion && (
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366] opacity-40" />
      )}
      <MessageCircle className="h-7 w-7" strokeWidth={2} />
    </motion.a>
  );
}
