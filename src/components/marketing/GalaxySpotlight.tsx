import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { formatFCFA } from "@/lib/format";

export type SpotlightProduct = {
  slug: string;
  name: string;
  price: number;
  image?: string;
  tagline: string;
};

export function GalaxySpotlight({ products }: { products: SpotlightProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-[#04070f] text-white section-space">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-60 -top-20 h-[820px] w-[820px] rounded-full bg-[radial-gradient(closest-side,#22d3ee,transparent)] opacity-25" />
        <div className="absolute -right-60 -bottom-20 h-[820px] w-[820px] rounded-full bg-[radial-gradient(closest-side,#6366f1,transparent)] opacity-30" />
        <div className="hero-grid absolute inset-0" />
      </div>

      <div className="container-page relative">
        <Reveal className="grid grid-cols-1 items-end gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3.5 py-1.5 text-[12px] font-semibold tracking-wide text-cyan-200">
              Nouveau chez BBS Connect
            </span>
            <h2 className="mt-6 text-[clamp(2.5rem,5vw,5rem)] font-extrabold leading-[0.95] tracking-[-0.04em]">
              Samsung Galaxy.
              <br />
              <span
                className="hero-gradient-text"
                style={{ backgroundImage: "linear-gradient(100deg,#22d3ee,#3b82f6 50%,#a78bfa)" }}
              >
                L&apos;autre légende.
              </span>
            </h2>
          </div>
          <div className="lg:pb-3">
            <p className="max-w-md text-[16px] leading-relaxed text-white/60">
              Galaxy AI, capteurs 200 Mpx, écrans pliables : les flagships Samsung rejoignent notre
              sélection, avec la même exigence d&apos;authenticité et de garantie.
            </p>
            <Link
              href="/boutique?marque=samsung"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-[14px] font-bold text-[#04070f] transition hover:-translate-y-0.5"
            >
              Tous les Galaxy <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        <div className="rail -mx-6 mt-14 flex gap-5 overflow-x-auto px-6 pb-4 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
          {products.map((p, i) => (
            <Reveal key={p.slug} delay={i * 100} className="w-[78vw] shrink-0 sm:w-[46vw] lg:w-auto">
              <Link
                href={`/boutique/${p.slug}`}
                className="group relative block overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.03] p-2 transition duration-500 hover:-translate-y-1.5 hover:border-cyan-300/40 hover:shadow-[0_30px_80px_-30px_rgba(34,211,238,0.45)]"
              >
                <div className="hover-zoom relative aspect-[4/5] overflow-hidden rounded-[24px] bg-[#0b0f1a]">
                  {p.image && (
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(min-width: 1024px) 30vw, 80vw"
                      className="zoom-target object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/30 backdrop-blur-md transition duration-300 group-hover:rotate-45 group-hover:bg-white group-hover:text-black">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                  <div className="absolute inset-x-5 bottom-5">
                    <p className="text-[12px] font-medium uppercase tracking-wider text-cyan-200/80">{p.tagline}</p>
                    <h3 className="mt-1 text-[24px] font-extrabold tracking-[-0.02em]">{p.name}</h3>
                    <p className="mt-1 text-[14px] text-white/70">
                      À partir de <span className="font-semibold text-white">{formatFCFA(p.price)}</span>
                    </p>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
