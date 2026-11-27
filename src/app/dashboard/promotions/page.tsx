import Link from "next/link";
import clsx from "clsx";
import { BadgePercent, Plus, Tag, Timer } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireMerchant } from "@/lib/auth";
import { expirePromotions } from "@/lib/promotions";
import { describeTarget, promoStatus } from "@/lib/promotionLabels";
import { EmptyState, Notice, PageHeader } from "@/components/dashboard/ui";
import { KpiCard } from "@/components/dashboard/KpiCard";

export const dynamic = "force-dynamic";

export default async function PromotionsPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  await requireMerchant();
  await expirePromotions();
  const params = await searchParams;
  const [promotions, categories] = await Promise.all([
    prisma.promotion.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { _count: { select: { items: true } } },
    }),
    prisma.category.findMany({ select: { id: true, name: true } }),
  ]);
  const catNames = new Map(categories.map((c) => [c.id, c.name]));
  const active = promotions.filter((p) => p.status === "ACTIVE");
  const discounted = active.reduce((s, p) => s + p._count.items, 0);
  const nextEnd = active.filter((p) => p.endsAt).sort((a, b) => +a.endsAt! - +b.endsAt!)[0];

  return (
    <div>
      <PageHeader
        eyebrow="Boutique"
        title="Promotions"
        description="Une remise en pourcentage : l'ancien prix s'affiche barré, puis revient automatiquement à la fin."
      >
        <Link href="/dashboard/promotions/nouveau" className="btn btn-primary btn-sm">
          <Plus className="h-4 w-4" /> Nouvelle promotion
        </Link>
      </PageHeader>

      {params.deleted && <Notice tone="success">Promotion supprimée, les prix d&apos;origine sont rétablis.</Notice>}

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="En cours" value={String(active.length)} icon={BadgePercent} hint={`${promotions.length} promotion${promotions.length > 1 ? "s" : ""} au total`} />
        <KpiCard label="Variantes remisées" value={String(discounted)} icon={Tag} hint="prix barrés visibles sur le site" />
        <KpiCard
          label="Prochaine fin"
          value={nextEnd ? nextEnd.endsAt!.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", timeZone: "Africa/Dakar" }) : "—"}
          icon={Timer}
          hint={nextEnd ? nextEnd.name : "aucune fin programmée"}
        />
      </div>

      <div className="db-card overflow-hidden">
        {promotions.length === 0 ? (
          <EmptyState
            icon={BadgePercent}
            title="Aucune promotion"
            text="Lancez une remise sur une marque, une gamme ou quelques modèles ; elle apparaît aussi dans « Offres » sur le site."
            action={
              <Link href="/dashboard/promotions/nouveau" className="btn btn-primary btn-sm">
                <Plus className="h-4 w-4" /> Créer une promotion
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-b border-line bg-paper/60 text-left">
                  <th className="db-th px-6 py-3">Promotion</th>
                  <th className="db-th px-4 py-3">Remise</th>
                  <th className="db-th px-4 py-3">Cible</th>
                  <th className="db-th px-4 py-3">Statut</th>
                  <th className="db-th px-6 py-3 text-right">Fin</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((p) => (
                  <tr key={p.id} className="border-b border-line last:border-0 hover:bg-paper/50">
                    <td className="px-6 py-3.5">
                      <Link href={`/dashboard/promotions/${p.id}`} className="font-semibold tracking-[-0.01em] text-ink hover:text-accent">
                        {p.name}
                      </Link>
                      <p className="font-mono text-[11px] text-slate">
                        {p.status === "DRAFT" ? "créée le " : "lancée le "}
                        {(p.startedAt ?? p.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                        {p._count.items ? ` · ${p._count.items} variantes` : ""}
                      </p>
                    </td>
                    <td className="tabular px-4 py-3.5 text-[16px] font-bold tracking-[-0.03em] text-signal-deep">−{p.percent} %</td>
                    <td className="px-4 py-3.5 text-ink">{describeTarget(p.target, catNames)}</td>
                    <td className="px-4 py-3.5">
                      <span className={clsx("badge", promoStatus[p.status].className)}>{promoStatus[p.status].label}</span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5 text-right font-mono text-[11.5px] text-slate">
                      {p.endsAt ? p.endsAt.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Dakar" }) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
