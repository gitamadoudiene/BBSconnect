import Link from "next/link";
import { ArrowRight, ArrowUpRight, Search } from "lucide-react";
import { DuoMark } from "@/components/ui/Logo";
import { formatFCFA } from "@/lib/format";

export type BrandRow = { label: string; href: string; count: number; from: number | null };

export function HomeHero({
  brands,
  accessories,
  popular,
  totalModels,
}: {
  brands: BrandRow[];
  accessories: BrandRow;
  popular: { name: string; slug: string }[];
  totalModels: number;
}) {
  return (
    <section className="border-b border-line">
      <div className="container-page grid grid-cols-1 gap-12 py-12 lg:grid-cols-[1.12fr_1fr] lg:items-stretch lg:gap-16 lg:py-16">
        {/* Copy + search */}
        <div className="flex flex-col">
          <p className="flex items-center gap-3 text-eyebrow text-slate">
            <DuoMark size={26} />
            Le spécialiste du téléphone · Dakar
          </p>

          <h2 className="text-h1 mt-6 max-w-[14ch] text-ink">Quel téléphone cherchez-vous ?</h2>

          <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-ink-soft">
            Neufs, authentiques et garantis. Livrés en 24 h à Dakar, payés à la livraison.
          </p>

          <form action="/boutique" method="get" role="search" className="mt-7 flex max-w-xl gap-2">
            <label htmlFor="hero-search" className="sr-only">
              Rechercher un modèle
            </label>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
              <input
                id="hero-search"
                name="q"
                type="search"
                placeholder="Quel modèle cherchez-vous ?"
                className="field h-[52px] pl-11"
              />
            </div>
            <button type="submit" className="btn btn-accent h-[52px] px-4 sm:px-[1.375rem]" aria-label="Rechercher">
              <span className="hidden sm:inline">Rechercher</span>
              <ArrowRight className="h-5 w-5 sm:hidden" />
            </button>
          </form>

          {popular.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="mr-1 font-mono text-[11px] uppercase tracking-[0.08em] text-slate">Demandés</span>
              {popular.map((p) => (
                <Link key={p.slug} href={`/boutique/${p.slug}`} className="chip">
                  {p.name}
                </Link>
              ))}
            </div>
          )}

          <dl className="mt-auto grid grid-cols-3 gap-4 border-t border-line pt-6 lg:mt-14">
            <Fact term="Modèles en stock" value={String(totalModels)} />
            <Fact term="Livraison Dakar" value="24 h" />
            <Fact term="Paiement" value="À la livraison" />
          </dl>
        </div>

        {/* The counter — brands at a glance, live from the catalogue */}
        <div className="flex flex-col rounded-[28px] bg-ink p-2 text-white">
          <div className="flex items-center justify-between px-5 pb-4 pt-5">
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/45">Le comptoir</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/45">Modèles · Dès</span>
          </div>

          <ul className="flex flex-1 flex-col">
            {brands.map((b) => (
              <li key={b.label} className="flex-1 border-t border-white/[0.08] first:border-t-0">
                <Link
                  href={b.href}
                  className="group flex h-full min-h-[104px] items-center justify-between gap-4 rounded-[20px] px-5 transition-colors hover:bg-ink-soft"
                >
                  <span className="text-[clamp(2rem,3.4vw,3.25rem)] font-bold leading-none tracking-[-0.045em]">
                    {b.label}
                  </span>
                  <span className="flex items-center gap-5">
                    <span className="text-right font-mono text-[12.5px] leading-relaxed text-white/60">
                      <span className="tabular block text-white">
                        {b.count} modèle{b.count > 1 ? "s" : ""}
                      </span>
                      {b.from !== null && <span className="tabular">dès {formatFCFA(b.from)}</span>}
                    </span>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-ink">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href={accessories.href}
            className="group mt-1 flex items-center justify-between rounded-[20px] bg-white/[0.06] px-5 py-4 transition-colors hover:bg-white/[0.1]"
          >
            <span className="text-[17px] font-semibold tracking-[-0.02em]">{accessories.label}</span>
            <span className="font-mono text-[12px] text-white/60">
              <span className="tabular text-white">{accessories.count}</span> réf.
              {accessories.from !== null && <> · dès {formatFCFA(accessories.from)}</>}
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Fact({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-slate">{term}</dt>
      <dd className="tabular mt-1.5 text-[17px] font-semibold tracking-[-0.02em] text-ink sm:text-[20px]">{value}</dd>
    </div>
  );
}
