import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DuoMark } from "@/components/ui/Logo";
import { SectionHeading } from "@/components/home/Sections";

const commitments = [
  {
    title: "Authentiques",
    text: "Des produits d'origine, sélectionnés et vérifiés avant chaque mise en vente.",
  },
  {
    title: "Garantis",
    text: "Tous nos produits sont garantis contre les défauts de fabrication.",
  },
  {
    title: "Livrés",
    text: "En 24 h à Dakar, et partout au Sénégal.",
  },
  {
    title: "Payés sereinement",
    text: "À la livraison, par Mobile Money (Orange Money, Wave) ou par carte.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-line">
        <div className="container-page grid grid-cols-1 gap-10 py-14 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:py-24">
          <div>
            <p className="text-eyebrow flex items-center gap-3 text-slate">
              <DuoMark size={26} /> À propos
            </p>
            <h1 className="text-display mt-8 max-w-[14ch] text-ink">Un seul métier : le téléphone.</h1>
          </div>
          <div className="space-y-5 text-[17px] leading-relaxed text-ink-soft">
            <p>
              BBS Connect est la boutique de Balla Business Service, à Dakar. Nous vendons des
              téléphones — iPhone, Samsung Galaxy, Google Pixel — et les accessoires qui vont avec.
              Rien d&apos;autre.
            </p>
            <p>
              Cette spécialisation nous permet de bien connaître chaque modèle, de vous conseiller
              avec précision et de vous accompagner après l&apos;achat.
            </p>
          </div>
        </div>
      </section>

      <section className="section-space">
        <div className="container-page">
          <SectionHeading index="01" label="Nos engagements" title="Ce que vous pouvez attendre de nous." />
          <ol className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-[24px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {commitments.map((c, i) => (
              <li key={c.title} className="flex flex-col bg-white p-6 lg:min-h-[220px] lg:p-7">
                <span className="font-mono text-[12px] text-accent">0{i + 1}</span>
                <h2 className="mt-8 text-[21px] font-bold tracking-[-0.03em] text-ink lg:mt-auto">{c.title}</h2>
                <p className="mt-2 text-[14.5px] leading-relaxed text-slate">{c.text}</p>
              </li>
            ))}
          </ol>

          <div className="mt-12 flex flex-wrap gap-3">
            <Link href="/boutique?categorie=smartphones" className="btn btn-primary">
              Voir les téléphones <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="btn btn-secondary">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
