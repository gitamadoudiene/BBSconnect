import Link from "next/link";
import { ArrowUpRight, Image as ImageIcon, Layers } from "lucide-react";
import { requireMerchant } from "@/lib/auth";
import { HOME_SECTIONS, getAnnouncement, getHomeLayout } from "@/lib/content";
import { AnnouncementForm, HomeLayoutEditor } from "@/components/dashboard/HomeLayoutEditor";
import { CardTitle, PageHeader } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function HomepageSettingsPage() {
  await requireMerchant();
  const [layout, announcement] = await Promise.all([getHomeLayout(), getAnnouncement()]);
  const meta = new Map(HOME_SECTIONS.map((s) => [s.id, s]));
  const initial = layout.map((s) => ({ ...s, label: meta.get(s.id)!.label, hint: meta.get(s.id)!.hint }));
  const defaults = HOME_SECTIONS.map((s) => ({ id: s.id, label: s.label, hint: s.hint, visible: true }));

  return (
    <div>
      <PageHeader eyebrow="Boutique" title="Page d'accueil" description="Choisissez les sections affichées et leur ordre.">
        <Link href="/" target="_blank" className="btn btn-secondary btn-sm">
          Voir l&apos;accueil <ArrowUpRight className="h-4 w-4" />
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
        <section className="db-card p-6 lg:p-8">
          <CardTitle>Sections, de haut en bas</CardTitle>
          <HomeLayoutEditor initial={initial} defaults={defaults} />
        </section>

        <div className="space-y-4">
          <section className="db-card p-6">
            <CardTitle>Bandeau d&apos;annonce</CardTitle>
            <p className="-mt-2 mb-4 text-[13.5px] text-slate">
              La ligne grise tout en haut du site (ordinateur). Laissez vide pour la masquer.
            </p>
            <AnnouncementForm text={announcement} />
          </section>

          <section className="db-card p-6">
            <CardTitle>Contenu des sections</CardTitle>
            <ul className="space-y-2">
              {[
                { href: "/dashboard/bannieres", icon: ImageIcon, label: "Bannières", text: "Grande bannière et petites tuiles" },
                { href: "/dashboard/collections", icon: Layers, label: "Collections", text: "Sélections affichées sur l'accueil" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="group flex items-center gap-3 rounded-[14px] border border-line p-3.5 transition-colors hover:border-ink">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-tint text-accent">
                      <l.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-[14px] font-semibold text-ink">{l.label}</span>
                      <span className="block text-[12.5px] text-slate">{l.text}</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-slate transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
