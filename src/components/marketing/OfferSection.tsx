import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { ParallaxImage } from "@/components/ui/ParallaxImage";

export function OfferSection() {
  return (
    <section className="section-space overflow-hidden bg-ink">
      <div className="container-page grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <span className="glass-pill-dark inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide text-accent">
            Offres de la semaine
          </span>
          <h2 className="text-h1 mt-6 text-white">
            Votre prochain iPad
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
          <div className="relative h-80 overflow-hidden rounded-[28px] sm:h-80 lg:h-[450px]">
            <ParallaxImage
              src="/images/Apple-IPad-Pro-with-M1.jpg"
              alt="Sélection d'offres BBS Connect"
              intensity={40}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
