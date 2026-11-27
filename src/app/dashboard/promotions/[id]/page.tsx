import Link from "next/link";
import { notFound } from "next/navigation";
import clsx from "clsx";
import { Play, Square, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireMerchant } from "@/lib/auth";
import { formatFCFA } from "@/lib/format";
import { expirePromotions, parseTarget, promoPrice, targetVariants } from "@/lib/promotions";
import { deletePromotionAction, endPromotionAction, startPromotionAction } from "@/actions/promotions";
import { ConfirmButton } from "@/components/dashboard/ConfirmButton";
import { CardTitle, Notice, PageHeader } from "@/components/dashboard/ui";
import { describeTarget, promoStatus } from "@/lib/promotionLabels";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ saved?: string; started?: string; ended?: string; skipped?: string; error?: string }>;

export default async function PromotionPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: SearchParams }) {
  await requireMerchant();
  await expirePromotions();
  const { id } = await params;
  const sp = await searchParams;
  const promo = await prisma.promotion.findUnique({
    where: { id },
    include: {
      items: {
        include: { variant: { include: { product: { select: { name: true, slug: true } } } } },
        orderBy: { variant: { product: { name: "asc" } } },
      },
    },
  });
  if (!promo) notFound();

  const categories = await prisma.category.findMany({ select: { id: true, name: true } });
  const catNames = new Map(categories.map((c) => [c.id, c.name]));

  // Draft: show what it would touch. Active/ended: what it actually touched.
  const preview = promo.status === "DRAFT" ? await targetVariants(parseTarget(promo.target), promo.id) : [];
  const rows =
    promo.status === "DRAFT"
      ? preview.map((v) => ({
          key: v.id,
          product: v.product.name,
          variant: [v.colorName, v.storage].filter(Boolean).join(" · "),
          before: v.price,
          after: promoPrice(v.price, promo.percent),
          note: null as string | null,
        }))
      : promo.items.map((i) => ({
          key: i.id,
          product: i.variant.product.name,
          variant: [i.variant.colorName, i.variant.storage].filter(Boolean).join(" · "),
          before: i.originalPrice,
          after: promoPrice(i.originalPrice, promo.percent),
          note:
            promo.status === "ACTIVE" && i.variant.price !== promoPrice(i.originalPrice, promo.percent)
              ? "prix modifié à la main"
              : null,
        }));
  const savings = rows.reduce((s, r) => s + (r.before - r.after), 0);

  return (
    <div>
      <PageHeader
        back={{ href: "/dashboard/promotions", label: "Retour aux promotions" }}
        eyebrow={`Promotion · ${describeTarget(promo.target, catNames)}`}
        title={
          <span>
            {promo.name} <span className="text-signal-deep">−{promo.percent} %</span>
          </span>
        }
      >
        <span className={clsx("badge", promoStatus[promo.status].className)}>{promoStatus[promo.status].label}</span>
        {promo.status !== "ACTIVE" && (
          <form action={startPromotionAction.bind(null, promo.id)}>
            <button className="btn btn-primary btn-sm">
              <Play className="h-4 w-4" /> {promo.status === "ENDED" ? "Relancer" : "Lancer"}
            </button>
          </form>
        )}
        {promo.status === "ACTIVE" && (
          <ConfirmButton
            action={endPromotionAction.bind(null, promo.id)}
            title="Terminer la promotion ?"
            description="Les prix d'origine sont rétablis immédiatement sur le site."
            confirmLabel="Terminer"
            trigger={
              <button className="btn btn-secondary btn-sm">
                <Square className="h-4 w-4" /> Terminer
              </button>
            }
          />
        )}
        <ConfirmButton
          action={deletePromotionAction.bind(null, promo.id)}
          title="Supprimer la promotion ?"
          description="Si elle est en cours, les prix d'origine sont d'abord rétablis."
          trigger={
            <button aria-label="Supprimer" className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-slate hover:border-db-danger hover:text-db-danger">
              <Trash2 className="h-4 w-4" />
            </button>
          }
        />
      </PageHeader>

      {sp.saved && <Notice tone="success">Promotion créée.</Notice>}
      {sp.started && <Notice tone="success">Promotion lancée sur {sp.started} variantes : les prix barrés sont en ligne.</Notice>}
      {sp.ended !== undefined && (
        <Notice tone="success">
          Promotion terminée : {sp.ended} prix rétablis
          {Number(sp.skipped) > 0 ? `, ${sp.skipped} laissés tels quels car modifiés à la main` : ""}.
        </Notice>
      )}
      {sp.error && <Notice tone="danger">{sp.error}</Notice>}

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="db-card p-6">
          <p className="db-eyebrow">Variantes</p>
          <p className="tabular mt-4 text-[30px] font-bold tracking-[-0.045em] text-ink">{rows.length}</p>
        </div>
        <div className="db-card p-6">
          <p className="db-eyebrow">Économie client cumulée</p>
          <p className="tabular mt-4 text-[30px] font-bold tracking-[-0.045em] text-ink">{formatFCFA(savings)}</p>
          <p className="font-mono text-[11.5px] text-slate">une unité de chaque variante</p>
        </div>
        <div className="db-card p-6">
          <p className="db-eyebrow">Fin</p>
          <p className="mt-4 text-[20px] font-bold tracking-[-0.03em] text-ink">
            {promo.endsAt ? promo.endsAt.toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Dakar" }) : "Manuelle"}
          </p>
          <p className="font-mono text-[11.5px] text-slate">{promo.endsAt ? "prix rétablis automatiquement" : "cliquez sur Terminer"}</p>
        </div>
      </div>

      <section className="db-card overflow-hidden">
        <div className="px-6 pt-6">
          <CardTitle>{promo.status === "DRAFT" ? "Ce qui sera remisé" : "Prix concernés"}</CardTitle>
        </div>
        {rows.length === 0 ? (
          <p className="px-6 pb-6 text-[13.5px] text-slate">Aucune variante concernée (peut-être déjà dans une autre promotion en cours).</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-y border-line bg-paper/60 text-left">
                  <th className="db-th px-6 py-3">Produit</th>
                  <th className="db-th px-4 py-3">Variante</th>
                  <th className="db-th px-4 py-3 text-right">Prix normal</th>
                  <th className="db-th px-6 py-3 text-right">Prix promo</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key} className="border-b border-line last:border-0">
                    <td className="px-6 py-3 font-medium text-ink">{r.product}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-slate">
                      {r.variant || "—"}
                      {r.note && <span className="ml-2 badge bg-signal-tint text-signal-deep">{r.note}</span>}
                    </td>
                    <td className="tabular whitespace-nowrap px-4 py-3 text-right text-slate line-through">{formatFCFA(r.before)}</td>
                    <td className="tabular whitespace-nowrap px-6 py-3 text-right font-semibold text-ink">{formatFCFA(r.after)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-4 text-[12.5px] text-slate">
        Astuce : la tuile « Offres du moment » de l&apos;accueil affiche automatiquement la plus forte remise. Voir les{" "}
        <Link href="/boutique?deals=1" target="_blank" className="text-ink underline underline-offset-4">offres sur le site</Link>.
      </p>
    </div>
  );
}
