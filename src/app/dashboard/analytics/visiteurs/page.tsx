import clsx from "clsx";
import { Activity, Repeat, UserPlus, Users } from "lucide-react";
import { requireMerchant } from "@/lib/auth";
import { percentChange, periodLabels, resolvePeriod } from "@/lib/period";
import { countryName, deviceLabel, getBreakdowns, getTraffic } from "@/lib/analytics";
import { PeriodFilter } from "@/components/dashboard/PeriodFilter";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { TrafficChart } from "@/components/dashboard/TrafficChart";
import { BarList } from "@/components/dashboard/BarList";
import { CardTitle, PageHeader } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function VisitorsPage({ searchParams }: { searchParams: Promise<{ periode?: string }> }) {
  await requireMerchant();
  const period = resolvePeriod((await searchParams).periode);
  const [traffic, b] = await Promise.all([getTraffic(period), getBreakdowns(period)]);
  const newShare = traffic.visitors ? Math.round((traffic.newVisitors / traffic.visitors) * 100) : 0;

  return (
    <div>
      <PageHeader eyebrow={`Analytics · ${periodLabels[period]}`} title="Visiteurs" description="Qui vient sur la boutique, comment, et ce qu'ils regardent.">
        <PeriodFilter active={period} basePath="/dashboard/analytics/visiteurs" />
      </PageHeader>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex min-h-[176px] flex-col justify-between rounded-[22px] bg-ink p-6 text-white">
          <div className="flex items-start justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/50">En ce moment</p>
            <span className="relative flex h-3 w-3">
              {b.live > 0 && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25d366] opacity-60 motion-reduce:animate-none" />}
              <span className={clsx("relative inline-flex h-3 w-3 rounded-full", b.live > 0 ? "bg-[#25d366]" : "bg-white/30")} />
            </span>
          </div>
          <div>
            <p className="tabular text-[40px] font-bold leading-none tracking-[-0.05em]">{b.live}</p>
            <p className="mt-1 text-[13px] text-white/60">visiteur{b.live > 1 ? "s" : ""} sur les 5 dernières minutes</p>
          </div>
        </div>
        <KpiCard label="Visiteurs uniques" value={String(traffic.visitors)} change={percentChange(traffic.visitors, traffic.prevVisitors)} icon={Users} />
        <KpiCard label="Nouveaux" value={String(traffic.newVisitors)} icon={UserPlus} hint={`${newShare} % · ${traffic.returningVisitors} revenus`} />
        <KpiCard label="Visites" value={String(traffic.sessions)} change={percentChange(traffic.sessions, traffic.prevSessions)} icon={Repeat} />
      </div>

      <section className="db-card mb-4 p-6">
        <CardTitle
          action={
            <span className="font-mono text-[11px] text-slate">
              {traffic.pagesPerSession.toFixed(1)} pages / visite · {traffic.bounceRate.toFixed(0)} % de rebond
            </span>
          }
        >
          Visiteurs par {period === "year" ? "mois" : "jour"}
        </CardTitle>
        <TrafficChart data={traffic.series} height={300} />
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="db-card p-6">
          <CardTitle>Pages d&apos;entrée</CardTitle>
          <BarList rows={b.landings.map((l) => ({ label: l.path, value: l.sessions, href: l.path, mono: true }))} unit="visites" />
        </section>
        <section className="db-card p-6">
          <CardTitle>Sources de trafic</CardTitle>
          <BarList rows={b.referrers.map((r) => ({ label: r.source, value: r.sessions }))} unit="visites" />
        </section>
        <section className="db-card p-6">
          <CardTitle>Appareils</CardTitle>
          <BarList rows={b.devices.map((d) => ({ label: deviceLabel[d.device] ?? d.device, value: d.visitors }))} unit="visiteurs" />
        </section>
        <section className="db-card p-6">
          <CardTitle>Pays</CardTitle>
          <BarList rows={b.countries.map((c) => ({ label: countryName(c.country), value: c.visitors }))} unit="visiteurs" />
        </section>
      </div>

      <p className="mt-4 flex items-center gap-2 text-[12.5px] text-slate">
        <Activity className="h-3.5 w-3.5" />
        Mesure sans cookie : un identifiant aléatoire par navigateur, aucune adresse IP enregistrée. Robots et vos propres visites exclus.
      </p>
    </div>
  );
}
