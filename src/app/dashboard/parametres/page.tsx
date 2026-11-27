import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { requireMerchant } from "@/lib/auth";
import { SettingsForm } from "@/components/dashboard/SettingsForm";
import { CardTitle, PageHeader } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const merchant = await requireMerchant();

  return (
    <div>
      <PageHeader eyebrow="Compte" title="Profil" description="Les informations du compte marchand de la boutique." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <section className="db-card p-6 lg:p-8">
          <CardTitle>Informations</CardTitle>
          <SettingsForm name={merchant.name} email={merchant.email} phone={merchant.phone ?? ""} />
        </section>

        <Link
          href="/dashboard/securite"
          className="group flex flex-col justify-between gap-8 rounded-[22px] bg-ink p-6 text-white lg:p-8"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <ShieldCheck className="h-5 w-5" strokeWidth={1.8} />
          </span>
          <span>
            <span className="block text-[22px] font-bold leading-tight tracking-[-0.035em]">
              Mot de passe, adresse de connexion et appareils connectés.
            </span>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold">
              <span className="link-underline">Sécurité du compte</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
}
