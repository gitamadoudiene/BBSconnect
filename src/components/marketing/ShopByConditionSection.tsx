import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { images } from "@/lib/images";

const options = [
  {
    badge: "NEUF",
    title: "iPhone scellés",
    text: "Sous blister, garantie constructeur complète.",
    href: "/boutique",
    image: images.sealedBox,
    dark: true,
  },
  {
    badge: "VALEUR SÛRE",
    title: "iPhone reconditionnés",
    text: "Contrôlés et garantis, à prix plus doux.",
    href: "/boutique?deals=1",
    image: images.refurbished,
    dark: false,
  },
  {
    badge: null,
    title: "Accessoires",
    text: "Écouteurs, chargeurs, coques et protections.",
    href: "/boutique?categorie=accessoires",
    image: images.accessoryAirpods,
    dark: true,
  },
];

export function ShopByConditionSection() {
  return (
    <section className="section-space-sm bg-white">
      <div className="container-page">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {options.map((o, i) => (
            <Reveal key={o.title} delay={i * 90}>
              <Link
                href={o.href}
                className="hover-zoom glass-sheen group relative block aspect-[4/3] overflow-hidden rounded-[24px]"
              >
                <Image
                  src={o.image}
                  alt={o.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, 90vw"
                  className="zoom-target object-cover"
                />
                <div
                  className={
                    o.dark
                      ? "absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent"
                      : "absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent"
                  }
                />
                {o.badge && (
                  <span className="glass absolute left-5 top-5 rounded-full px-3 py-1 text-[10.5px] font-semibold tracking-wide text-ink">
                    {o.badge}
                  </span>
                )}
                <div className="absolute inset-x-5 bottom-5">
                  <h3 className="text-xl font-semibold text-white">{o.title}</h3>
                  <p className="mt-1 text-[13px] text-white/75">{o.text}</p>
                  <span className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Découvrir <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
