import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import clsx from "clsx";
import { Reveal } from "@/components/ui/Reveal";
import { pexels } from "@/lib/images";

export type Universe = {
  slug: string;
  name: string;
  description?: string | null;
  image?: string | null;
  count: number;
};

/** Fallback imagery per top-level category — a category image set in the
 * dashboard always wins over these. */
const fallbackImages: Record<string, string> = {
  smartphones: pexels("30466736", 1400),
  tablettes: pexels("13791390", 1000),
  ordinateurs: pexels("6581378", 1000),
  montres: pexels("5081914", 1000),
  audio: pexels("6857559", 1000),
  gaming: pexels("32967534", 1200),
  accessoires: pexels("9204671", 1000),
};

const layout: Record<number, string> = {
  0: "md:col-span-2 md:row-span-2",
  1: "",
  2: "",
  3: "",
  4: "",
  5: "md:col-span-2",
  6: "md:col-span-2",
};

export function UniverseBento({ universes }: { universes: Universe[] }) {
  if (universes.length === 0) return null;

  return (
    <section className="section-space bg-[#05060a] text-white">
      <div className="container-page">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-eyebrow text-white/45">Nos univers</p>
            <h2 className="mt-4 max-w-2xl text-[clamp(2rem,3.4vw,3.5rem)] font-extrabold leading-[1.02] tracking-[-0.03em]">
              Bien plus que des iPhone.
              <span className="text-white/35"> Toute la tech qui compte.</span>
            </h2>
          </div>
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:border-white/40"
          >
            Tout le catalogue <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <div className="mt-12 grid auto-rows-[220px] grid-cols-1 gap-4 sm:grid-cols-2 md:auto-rows-[240px] md:grid-cols-4">
          {universes.map((u, i) => (
            <Reveal key={u.slug} delay={i * 60} className={clsx(layout[i] ?? "", "h-full")}>
              <Link
                href={`/boutique?categorie=${u.slug}`}
                className="hover-zoom group relative flex h-full flex-col justify-end overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0d0f16]"
              >
                <Image
                  src={u.image || fallbackImages[u.slug] || fallbackImages.smartphones}
                  alt={u.name}
                  fill
                  sizes={i === 0 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 100vw"}
                  className="zoom-target object-cover opacity-75 transition-opacity duration-500 group-hover:opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <span className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/30 backdrop-blur-md transition duration-300 group-hover:rotate-45 group-hover:bg-white group-hover:text-black">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
                <div className="relative p-6 lg:p-7">
                  <span className="font-mono text-[11px] text-white/50">
                    {String(u.count).padStart(2, "0")} produit{u.count > 1 ? "s" : ""}
                  </span>
                  <h3
                    className={clsx(
                      "mt-1 font-extrabold tracking-[-0.02em]",
                      i === 0 ? "text-[clamp(2rem,3vw,3rem)]" : "text-[22px]"
                    )}
                  >
                    {u.name}
                  </h3>
                  {i === 0 && u.description && (
                    <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-white/65">{u.description}</p>
                  )}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
