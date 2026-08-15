import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone, Share2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="container-page py-16 lg:py-24">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <Logo dark />
            <p className="mt-6 max-w-xs text-[14px] leading-relaxed text-white/55">
              Votre référence pour les iPhone et produits Apple au Sénégal — sélection
              rigoureuse, expertise produit et accompagnement après-vente.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="#" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition hover:border-white/40">
                <Share2 className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition hover:border-white/40">
                <MessageCircle className="h-4 w-4" />
              </a>
              <a href="#" aria-label="WhatsApp" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition hover:border-white/40">
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-eyebrow mb-6 text-white/45">Shop</h3>
            <ul className="space-y-3.5 text-[14px] text-white/70">
              <li><Link href="/boutique" className="link-underline">iPhone</Link></li>
              <li><Link href="/boutique?deals=1" className="link-underline">Offres</Link></li>
              <li><Link href="/boutique?categorie=accessoires" className="link-underline">Accessoires</Link></li>
              <li><Link href="/boutique?tri=new" className="link-underline">Nouveautés</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-eyebrow mb-6 text-white/45">BBS Connect</h3>
            <ul className="space-y-3.5 text-[14px] text-white/70">
              <li><Link href="/a-propos" className="link-underline">À propos</Link></li>
              <li><Link href="/contact" className="link-underline">Contact</Link></li>
              <li><Link href="/contact" className="link-underline">Livraison</Link></li>
              <li><Link href="/contact" className="link-underline">Garantie</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-eyebrow mb-6 text-white/45">Aide</h3>
            <ul className="space-y-3.5 text-[14px] text-white/70">
              <li><Link href="/contact" className="link-underline">FAQ</Link></li>
              <li><Link href="/compte" className="link-underline">Suivre ma commande</Link></li>
              <li><Link href="/contact" className="link-underline">Politique de retour</Link></li>
              <li><Link href="/contact" className="link-underline">Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-[13px] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} BBS Connect. Tous droits réservés.</p>
          <div className="flex flex-wrap items-center gap-5">
            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Dakar, Sénégal</span>
            <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> contact@bbsconnect.sn</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
