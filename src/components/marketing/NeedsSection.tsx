import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { images } from "@/lib/images";

const needs = [
  {
    title: "Pour la photo",
    text: "Un système photo capable de capturer chaque instant.",
    href: "/boutique?categorie=iphone-16",
    image: images.needPhotography,
  },
  {
    title: "Pour la performance",
    text: "La puissance nécessaire pour ne jamais ralentir.",
    href: "/boutique?categorie=iphone-15",
    image: images.needPerformance,
  },
  {
    title: "Pour le quotidien",
    text: "Fiable, élégant, parfait pour un usage de tous les jours.",
    href: "/boutique?categorie=iphone-13",
    image: images.needEveryday,
  },
  {
    title: "Meilleur rapport qualité/prix",
    text: "L'expérience iPhone, sans dépasser votre budget.",
    href: "/boutique?categorie=iphone-11",
    image: images.needValue,
  },
];

export function NeedsSection() {
  return (
    <section className="section-space bg-paper">
      <div className="container-page">
        <Reveal className="max-w-lg">
          <p className="text-eyebrow text-slate">Notre sélection</p>
          <h2 className="text-h2 mt-4 text-ink">Trouvez l&apos;iPhone qui vous correspond.</h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {needs.map((need, i) => (
            <Reveal key={need.title} delay={i * 80}>
              <Link href={need.href} className="hover-zoom group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                  <Image
                    src={need.image}
                    alt={need.title}
                    fill
                    sizes="(min-width: 1024px) 22vw, 45vw"
                    className="zoom-target object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-ink">{need.title}</h3>
                <p className="mt-1 hidden text-[13px] leading-relaxed text-slate sm:block">{need.text}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
