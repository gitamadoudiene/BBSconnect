import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PhoneMock } from "@/components/ui/PhoneMock";
import { Reveal } from "@/components/ui/Reveal";

const phones = [
  { color: "#8f8477", rotate: "-rotate-6", translate: "translate-y-6", size: "h-[78%]", z: "z-10" },
  { color: "#20242b", rotate: "rotate-0", translate: "-translate-y-2", size: "h-full", z: "z-20" },
  { color: "#5a7a9e", rotate: "rotate-6", translate: "translate-y-10", size: "h-[74%]", z: "z-10" },
];

export function OfferSection() {
  return (
    <section className="section-space overflow-hidden bg-ink">
      <div className="container-page grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-accent">
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
          <div className="relative flex h-72 items-center justify-center sm:h-80 lg:h-96">
            {phones.map((p, i) => (
              <div
                key={i}
                className={`absolute ${p.size} w-32 ${p.translate} ${p.rotate} ${p.z} drop-shadow-2xl transition-transform duration-700 hover:!translate-y-0 hover:!rotate-0`}
                style={{ left: `${28 + i * 22}%`, marginLeft: "-4rem" }}
              >
                <PhoneMock color={p.color} variant="back" />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
