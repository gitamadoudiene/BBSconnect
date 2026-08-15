import { BadgeCheck, Headset, Lock, ShieldCheck, Truck } from "lucide-react";

const items = [
  { icon: BadgeCheck, label: "Produits authentiques" },
  { icon: Lock, label: "Paiement sécurisé" },
  { icon: Truck, label: "Livraison rapide" },
  { icon: ShieldCheck, label: "Garantie disponible" },
  { icon: Headset, label: "Assistance BBS Connect" },
];

export function TrustBar() {
  return (
    <section className="border-b border-line bg-white">
      <div className="container-page flex flex-wrap items-center justify-center gap-x-12 gap-y-6 py-10 lg:py-12">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3 text-ink">
            <item.icon className="h-[18px] w-[18px] shrink-0 text-slate" strokeWidth={1.5} />
            <span className="text-[13.5px] font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
