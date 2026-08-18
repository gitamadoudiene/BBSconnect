import { BadgeCheck, CreditCard, RefreshCcw, ShieldCheck, Truck } from "lucide-react";
import { AboutLogoMark } from "@/components/marketing/AboutLogoMark";

const values = [
  { icon: Truck, title: "Livraison partout", text: "Nous livrons dans toutes les régions du Sénégal, rapidement et en toute sécurité." },
  { icon: BadgeCheck, title: "99% de satisfaction", text: "Des milliers de clients satisfaits et un service après-vente réactif." },
  { icon: RefreshCcw, title: "Garantie produits", text: "Tous nos iPhone sont vérifiés et garantis contre les défauts de fabrication." },
  { icon: CreditCard, title: "Paiement sécurisé", text: "Paiement à la livraison, Mobile Money ou carte bancaire, en toute confiance." },
  { icon: ShieldCheck, title: "Qualité garantie", text: "Nous sélectionnons uniquement des produits authentiques et de qualité." },
];

export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-brand-border bg-brand-gray">
        <div className="container-page grid grid-cols-1 items-center gap-8 py-16 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-brand-blue">À propos</p>
            <h1 className="text-3xl font-extrabold text-brand-navy sm:text-4xl">
              Le meilleur de la technologie, pensé pour vous
            </h1>
            <p className="mt-4 text-brand-navy/70">
              BBSconnect est une boutique en ligne dédiée à la vente d&apos;iPhone et
              d&apos;accessoires au Sénégal. Notre mission : rendre la technologie Apple
              accessible avec des prix justes, un service fiable et une livraison rapide
              partout dans le pays.
            </p>
          </div>
          <AboutLogoMark />
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="mb-8 text-center text-2xl font-bold text-brand-navy">Pourquoi nous choisir</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="rounded-lg border border-brand-border p-6">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue">
                <v.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-1 font-semibold text-brand-navy">{v.title}</h3>
              <p className="text-sm text-brand-navy/60">{v.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
