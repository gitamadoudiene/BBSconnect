import Link from "next/link";
import { ArrowRight, Eye, MousePointerClick, Percent, ShoppingBag, Users } from "lucide-react";
import { requireMerchant } from "@/lib/auth";
import { formatFCFA } from "@/lib/format";
import { percentChange, periodLabels, resolvePeriod } from "@/lib/period";
import { countryName, deviceLabel, getBreakdowns, getFunnel, getTraffic } from "@/lib/analytics";
import { PeriodFilter } from "@/components/dashboard/PeriodFilter";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { TrafficChart } from "@/components/dashboard/TrafficChart";
import { BarList } from "@/components/dashboard/BarList";
import { CardTitle, PageHeader } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function AnalyticsOverviewPage({ searchParams }: { searchParams: Promise<{ periode?: string }> }) {
  await requireMerchant();
  const period = resolvePeriod((await searchParams).periode);
  const [traffic, breakdowns, funnel] = await Promise.all([getTraffic(period), getBreakdowns(period), getFunnel(period)]);
  const conversion = traffic.sessions ? (funnel.orders / traffic.sessions) * 100 : 0;
  const noData = traffic.visitors === 0;

  return (
    <div>
      <PageHeader eyebrow={`Analytics · ${periodLabels[period]}`} title="Vue globale" description="Fréquentation de la boutique et ce qu'elle rapporte.">
        <PeriodFilter active={period} basePath="/dashboard/analytics" />
      </PageHeader>

      {noData && (
        <div className="mb-4 rounded-[18px] bg-accent-tint p-5 text-[14px] text-ink">
          <p className="font-semibold">La mesure d&apos;audience vient de démarrer.</p>
          <p className="mt-1 text-slate">
            Les visites sont comptées à partir de maintenant, sans cookie ni donnée personnelle. Vos propres visites (connecté en
            commerçant) ne sont pas comptées.
          </p>
        </div>
      )}

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Visiteurs" value={String(traffic.visitors)} change={percentChange(traffic.visitors, traffic.prevVisitors)} icon={Users} />
        <KpiCard label="Pages vues" value={String(traffic.pageViews)} icon={Eye} hint={`${traffic.pagesPerSession.toFixed(1)} pages par visite`} />
        <KpiCard label="Taux de conversion" value={`${conversion.toFixed(1)} %`} icon={Percent} hint={`${funnel.orders} commande${funnel.orders > 1 ? "s" : ""} pour ${traffic.sessions} visites`} />
        <KpiCard label="Chiffre d'affaires" value={formatFCFA(funnel.revenue)} icon={ShoppingBag} hint={traffic.visitors ? `${formatFCFA(Math.round(funnel.revenue / traffic.visitors))} par visiteur` : "sur la période"} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section className="db-card p-6">
          <CardTitle
            action={
              <span className="flex items-center gap-3 font-mono text-[11px] text-slate">
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" /> Visiteurs</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-signal" /> Commandes</span>
              </span>
            }
          >
            Fréquentation
          </CardTitle>
          <TrafficChart data={traffic.series} />
        </section>

        <section className="db-card p-6">
          <CardTitle
            action={
              <Link href={`/dashboard/analytics/conversions?periode=${period}`} className="group inline-flex items-center gap-1 text-[13px] font-semibold text-ink">
                <span className="link-underline">Détail</span> <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            }
          >
            Parcours d&apos;achat
          </CardTitle>
          <ol className="space-y-3">
            {funnel.steps.map((s, i) => {
              const base = funnel.steps[0]!.value || 1;
              return (
                <li key={s.key}>
                  <div className="mb-1 flex items-center justify-between text-[13px]">
                    <span className="flex items-center gap-2 text-ink">
                      <span className="font-mono text-[11px] text-slate">0{i + 1}</span> {s.label}
                    </span>
                    <span className="tabular font-mono text-[12px] text-slate">{s.value}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-paper">
                    <div className={i === funnel.steps.length - 1 ? "h-full rounded-full bg-signal" : "h-full rounded-full bg-accent"} style={{ width: `${(s.value / base) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <section className="db-card p-6">
          <CardTitle>Pages les plus vues</CardTitle>
          <BarList rows={breakdowns.pages.map((p) => ({ label: p.path, value: p.views, href: p.path, mono: true }))} />
        </section>
        <section className="db-card p-6">
          <CardTitle>D&apos;où viennent-ils ?</CardTitle>
          <BarList rows={breakdowns.referrers.map((r) => ({ label: r.source, value: r.sessions }))} unit="visites" />
        </section>
        <section className="db-card p-6">
          <CardTitle
            action={
              <Link href={`/dashboard/analytics/visiteurs?periode=${period}`} className="group inline-flex items-center gap-1 text-[13px] font-semibold text-ink">
                <span className="link-underline">Visiteurs</span> <MousePointerClick className="h-3.5 w-3.5" />
              </Link>
            }
          >
            Appareils & pays
          </CardTitle>
          <BarList rows={breakdowns.devices.map((d) => ({ label: deviceLabel[d.device] ?? d.device, value: d.visitors }))} />
          <div className="mt-4 border-t border-line pt-4">
            <BarList rows={breakdowns.countries.map((c) => ({ label: countryName(c.country), value: c.visitors }))} />
          </div>
        </section>
      </div>
    </div>
  );
}
