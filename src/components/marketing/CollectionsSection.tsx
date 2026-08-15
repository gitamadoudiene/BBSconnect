import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { images } from "@/lib/images";

const collections = [
  {
    badge: "PRO",
    title: "iPhone Pro",
    href: "/boutique?categorie=iphone-16",
    image: images.collectionPro,
    dark: true,
  },
  {
    badge: null,
    title: "iPhone",
    href: "/boutique",
    image: images.collectionClassic,
    dark: false,
  },
  {
    badge: null,
    title: "Bonnes affaires",
    href: "/boutique?deals=1",
    image: images.collectionLifestyle,
    dark: true,
  },
];

export function CollectionsSection() {
  return (
    <section id="collections" className="section-space bg-white">
      <div className="container-page">
        <Reveal className="max-w-lg">
          <p className="text-eyebrow text-slate">Nos collections</p>
          <h2 className="text-h2 mt-4 text-ink">Découvrez nos collections</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-slate">
            Choisissez l&apos;iPhone qui correspond à votre style.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {collections.map((c, i) => (
            <Reveal key={c.title} delay={i * 100}>
              <Link
                href={c.href}
                className="hover-zoom group relative block aspect-[16/13] overflow-hidden rounded-[28px] sm:aspect-[16/10] lg:aspect-[4/5]"
              >
                <Image
                  src={c.image}
                  alt={c.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, 90vw"
                  className="zoom-target object-cover"
                />
                <div
                  className={
                    c.dark
                      ? "absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
                      : "absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-transparent"
                  }
                />
                {c.badge && (
                  <span className="absolute left-6 top-6 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-wide text-ink">
                    {c.badge}
                  </span>
                )}
                <div className="absolute inset-x-6 bottom-6 flex items-end justify-between">
                  <h3 className="text-2xl font-semibold text-white">{c.title}</h3>
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Découvrir <ArrowRight className="h-4 w-4" />
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
