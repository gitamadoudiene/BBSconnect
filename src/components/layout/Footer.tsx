import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const columns = [
  {
    title: "Téléphones",
    links: [
      { label: "iPhone", href: "/boutique?categorie=smartphones&marque=apple" },
      { label: "Android", href: "/boutique?categorie=smartphones&os=android" },
      { label: "Samsung Galaxy", href: "/boutique?categorie=smartphones&marque=samsung" },
      { label: "Offres du moment", href: "/boutique?deals=1" },
    ],
  },
  {
    title: "Accessoires",
    links: [
      { label: "Coques & protection", href: "/boutique?categorie=coques-protection" },
      { label: "Charge & énergie", href: "/boutique?categorie=charge-energie" },
      { label: "Écouteurs & audio", href: "/boutique?categorie=ecouteurs-audio" },
      { label: "Tous les accessoires", href: "/boutique?categorie=accessoires" },
    ],
  },
  {
    title: "BBS Connect",
    links: [
      { label: "À propos", href: "/a-propos" },
      { label: "Suivre ma commande", href: "/compte" },
      { label: "Livraison & paiement", href: "/contact" },
      { label: "Nous contacter", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="container-page pb-10 pt-16 lg:pt-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Logo dark />
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-white/60">
              Le spécialiste du téléphone à Dakar. Des modèles authentiques, vérifiés et garantis,
              livrés chez vous.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="https://wa.me/221788379919" target="_blank" rel="noopener noreferrer" className="btn btn-inverse btn-sm">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <a href="tel:+221788379919" className="btn btn-ghost-light btn-sm tabular">
                <Phone className="h-4 w-4" /> 78 837 99 19
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/40">{col.title}</h3>
                <ul className="mt-5 space-y-3 text-[14.5px] text-white/75">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="link-underline hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 border-t border-white/10 pt-8 font-mono text-[12px] text-white/45 md:grid-cols-3">
          <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> Dakar, Sénégal</p>
          <p className="tabular flex flex-wrap items-center gap-2 md:justify-center">
            <Phone className="h-3.5 w-3.5" /> 78 837 99 19 · 75 459 68 30 ·
            <Mail className="h-3.5 w-3.5" />
            <a href="mailto:ballabusinessservice@gmail.com" className="hover:text-white/80">
              ballabusinessservice@gmail.com
            </a>
          </p>
          <p className="md:text-right">© {new Date().getFullYear()} BBS Connect — Balla Business Service</p>
        </div>
      </div>
    </footer>
  );
}
