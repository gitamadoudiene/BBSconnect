import Link from "next/link";
import clsx from "clsx";
import { Percent, ShoppingBag, ShoppingCart } from "lucide-react";
import { requireMerchant } from "@/lib/auth";
import { formatFCFA } from "@/lib/format";
import { periodLabels, resolvePeriod } from "@/lib/period";
import { getFunnel, getTraffic } from "@/lib/analytics";
import { PeriodFilter } from "@/components/dashboard/PeriodFilter";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { CardTitle, PageHeader } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

function pct(a: number, b: number) {
  return b ? (a / b) * 100 : 0;
}

export default async function ConversionsPage({ searchParams }: { searchParams: Promise<{ periode?: string }> }) {
  await requireMerchant();
  const period = resolvePeriod((await searchParams).periode);
  const [funnel, traffic] = await Promise.all([getFunnel(period), getTraffic(period)]);
  const steps = funnel.steps;
  const base = steps[0]!.value;
  const carted = steps[2]!.value;
  const purchased = steps[4]!.value;
  const abandonment = carted ? 100 - pct(purchased, carted) : 0;
  // Biggest drop between two consecutive steps = where to act first.
  const drops = steps.slice(1).map((s, i) => ({ from: steps[i]!, to: s, lost: steps[i]!.value - s.value }));
  const worst = drops.reduce((a, d) => (d.lost > a.lost ? d : a), drops[0]!);

  return (
    <div>
      <PageHeader eyebrow={`Analytics · ${periodLabels[period]}`} title="Conversions" description="De la visite à la commande : où les clients s'arrêtent.">
        <PeriodFilter active={period} basePath="/dashboard/analytics/conversions" />
      </PageHeader>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Taux de conversion" value={`${pct(funnel.orders, traffic.sessions).toFixed(1)} %`} icon={Percent} hint={`${funnel.orders} commandes · ${traffic.sessions} visites`} />
        <KpiCard label="Paniers abandonnés" value={`${abandonment.toFixed(0)} %`} icon={ShoppingCart} hint={`${carted} paniers · ${purchased} commandés`} />
        <KpiCard label="Panier moyen" value={funnel.orders ? formatFCFA(Math.round(funnel.revenue / funnel.orders)) : "—"} icon={ShoppingBag} hint={formatFCFA(funnel.revenue) + " au total"} />
      </div>

      <section className="db-card mb-4 p-6 lg:p-8">
        <CardTitle>Entonnoir de commande</CardTitle>
        <ol className="grid grid-cols-1 gap-3 md:grid-cols-5">
          {steps.map((s, i) => {
            const share = pct(s.value, base);
            const fromPrev = i === 0 ? 100 : pct(s.value, steps[i - 1]!.value);
            return (
              <li key={s.key} className={clsx("flex flex-col rounded-[18px] p-5", i === steps.length - 1 ? "bg-ink text-white" : "bg-paper text-ink")}>
                <span className={clsx("font-mono text-[11px]", i === steps.length - 1 ? "text-white/50" : "text-slate")}>0{i + 1}</span>
                <span className="mt-2 text-[14px] font-semibold leading-tight">{s.label}</span>
                <span className={clsx("text-[12px]", i === steps.length - 1 ? "text-white/60" : "text-slate")}>{s.hint}</span>
                <span className="tabular mt-6 text-[34px] font-bold leading-none tracking-[-0.05em]">{s.value}</span>
                <span className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/10">
                  <span className={clsx("block h-full rounded-full", i === steps.length - 1 ? "bg-signal" : "bg-accent")} style={{ width: `${share}%` }} />
                </span>
                <span className={clsx("mt-2 font-mono text-[11px]", i === steps.length - 1 ? "text-white/60" : "text-slate")}>
                  {i === 0 ? "100 %" : `${fromPrev.toFixed(0)} % de l'étape précédente`}
                </span>
              </li>
            );
          })}
        </ol>
        {base > 0 && worst.lost > 0 && (
          <p className="mt-5 rounded-[14px] bg-signal-tint px-4 py-3 text-[13.5px] text-ink">
            <span className="font-semibold">Plus grosse perte :</span> entre « {worst.from.label} » et « {worst.to.label} » ({worst.lost} visites).{" "}
            {worst.to.key === "viewed" && "Mettez des produits phares plus en avant sur l'accueil."}
            {worst.to.key === "carted" && "Vérifiez prix, photos et stock des fiches les plus vues."}
            {worst.to.key === "checkout" && "Le panier fait peut-être hésiter : frais de livraison, délais ?"}
            {worst.to.key === "purchased" && "Le formulaire de commande freine : proposez l'aide WhatsApp."}
          </p>
        )}
      </section>

      <section className="db-card overflow-hidden">
        <div className="px-6 pt-6">
          <CardTitle>Produits : vus, ajoutés, vendus</CardTitle>
        </div>
        {funnel.products.length === 0 ? (
          <p className="px-6 pb-6 text-[13.5px] text-slate">Pas encore de données sur cette période.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className="border-y border-line bg-paper/60 text-left">
                  <th className="db-th px-6 py-3">Produit</th>
                  <th className="db-th px-4 py-3 text-right">Vues</th>
                  <th className="db-th px-4 py-3 text-right">Ajouts panier</th>
                  <th className="db-th px-4 py-3 text-right">Vendus</th>
                  <th className="db-th px-6 py-3 text-right">Vue → panier</th>
                </tr>
              </thead>
              <tbody>
                {funnel.products.map((p) => {
                  const rate = pct(p.carts, p.views);
                  return (
                    <tr key={p.id} className="border-b border-line last:border-0">
                      <td className="px-6 py-3 font-medium text-ink">
                        {p.slug ? (
                          <Link href={`/boutique/${p.slug}`} target="_blank" className="hover:text-accent">{p.name}</Link>
                        ) : (
                          p.name
                        )}
                      </td>
                      <td className="tabular px-4 py-3 text-right font-mono text-[12.5px]">{p.views}</td>
                      <td className="tabular px-4 py-3 text-right font-mono text-[12.5px]">{p.carts}</td>
                      <td className="tabular px-4 py-3 text-right font-mono text-[12.5px]">{p.sold}</td>
                      <td className="px-6 py-3 text-right">
                        <span className={clsx("badge", rate >= 10 ? "bg-db-success-tint text-db-success" : rate > 0 ? "bg-accent-tint text-accent-deep" : "bg-paper text-slate")}>
                          {rate.toFixed(0)} %
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
