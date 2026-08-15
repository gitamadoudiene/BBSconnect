import Image from "next/image";
import { BadgeCheck, GraduationCap, ShieldCheck, Truck } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { images } from "@/lib/images";

const points = [
  {
    icon: BadgeCheck,
    title: "Authenticité",
    text: "Des produits soigneusement sélectionnés et vérifiés avant chaque mise en vente.",
  },
  {
    icon: GraduationCap,
    title: "Expertise",
    text: "Une équipe qui connaît réellement les produits Apple et vous conseille avec précision.",
  },
  {
    icon: ShieldCheck,
    title: "Garantie",
    text: "Un accompagnement complet après votre achat, en toute confiance.",
  },
  {
    icon: Truck,
    title: "Livraison",
    text: "Recevez votre commande rapidement, partout au Sénégal.",
  },
];

export function WhyUs() {
  return (
    <section className="section-space bg-white">
      <div className="container-page grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-mist lg:aspect-[5/6]">
            <Image
              src={images.whyUsLifestyle}
              alt="Utilisation d'un iPhone dans un environnement moderne et minimaliste"
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="text-eyebrow text-slate">Pourquoi BBS Connect</p>
            <h2 className="text-h2 mt-4 max-w-md text-ink">
              Une autre façon d&apos;acheter votre iPhone.
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
            {points.map((point, i) => (
              <Reveal key={point.title} delay={i * 80}>
                <point.icon className="h-6 w-6 text-ink" strokeWidth={1.5} />
                <h3 className="mt-4 text-[16px] font-semibold text-ink">{point.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-slate">{point.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
