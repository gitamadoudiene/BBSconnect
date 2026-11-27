import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, ShieldCheck, Truck, Wallet } from "lucide-react";
import { formatFCFA } from "@/lib/format";

/** Numbered section heading — the site reads like a well-made spec sheet. */
export function SectionHeading({
  index,
  label,
  title,
  action,
}: {
  index: string;
  label: string;
  title: React.ReactNode;
  action?: { label: string; href: string };
}) {
  return (
    <div className="grid grid-cols-1 gap-6 border-t border-ink pt-5 md:grid-cols-[180px_1fr_auto] md:items-start">
      <p className="text-eyebrow flex gap-3 text-slate">
        <span className="text-ink">{index}</span>
        {label}
      </p>
      <h2 className="text-h2 max-w-[22ch] text-ink">{title}</h2>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-ink md:mt-2"
        >
          <span className="link-underline">{action.label}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export type BudgetBand = { label: string; caption: string; href: string; count: number };

export function BudgetGrid({ bands, index = "02" }: { bands: BudgetBand[]; index?: string }) {
  return (
    <section className="section-space">
      <div className="container-page">
        <SectionHeading index={index} label="Par budget" title="Partez de votre budget, on s'occupe du reste." />
        <div className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {bands.map((b) => (
            <Link
              key={b.label}
              href={b.href}
              className="group flex min-h-[188px] flex-col justify-between rounded-[24px] border border-line p-5 transition-colors hover:border-ink lg:min-h-[220px] lg:p-6"
            >
              <span className="flex items-start justify-between font-mono text-[11.5px] text-slate">
                <span className="uppercase tracking-[0.08em]">{b.caption}</span>
                <ArrowUpRight className="h-4 w-4 text-ink transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
              <span>
                <span className="tabular block text-[clamp(1.6rem,2.6vw,2.4rem)] font-bold leading-none tracking-[-0.045em] text-ink">
                  {b.label}
                </span>
                <span className="mt-1 block font-mono text-[12px] text-slate">F CFA</span>
                <span className="mt-4 block text-[14px] font-medium text-ink">
                  {b.count} modèle{b.count > 1 ? "s" : ""}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export type SeriesRow = { name: string; slug: string; count: number; from: number | null };

export function SeriesIndex({ groups, index = "03" }: { groups: { brand: string; rows: SeriesRow[] }[]; index?: string }) {
  return (
    <section className="section-space bg-paper">
      <div className="container-page">
        <SectionHeading index={index} label="Les gammes" title="Toutes les générations, rangées comme il faut." />
        <div className="mt-10 grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
          {groups.map((g) => (
            <div key={g.brand}>
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-slate">{g.brand}</p>
              <ul className="mt-3 border-t border-line-strong">
                {g.rows.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/boutique?categorie=${r.slug}`}
                      className="group grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-line-strong py-3.5"
                    >
                      <span className="text-[18px] font-semibold tracking-[-0.025em] text-ink group-hover:text-accent">
                        {r.name}
                      </span>
                      <span className="tabular font-mono text-[12px] text-slate">
                        {r.count} modèle{r.count > 1 ? "s" : ""}
                      </span>
                      <span className="tabular w-[128px] text-right font-mono text-[12px] text-ink">
                        {r.from !== null ? `dès ${formatFCFA(r.from)}` : "—"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const promises = [
  {
    icon: BadgeCheck,
    title: "Authentique",
    text: "Des produits d'origine, sélectionnés et vérifiés avant chaque mise en vente.",
  },
  {
    icon: ShieldCheck,
    title: "Garanti",
    text: "Garantis contre les défauts de fabrication, avec un interlocuteur qui répond après l'achat.",
  },
  {
    icon: Truck,
    title: "Livré en 24 h",
    text: "Livraison rapide à Dakar, expédition partout au Sénégal.",
  },
  {
    icon: Wallet,
    title: "Payé à la livraison",
    text: "Payez à la réception, ou par Mobile Money (Orange Money, Wave).",
  },
];

export function Promises({ index = "05" }: { index?: string }) {
  return (
    <section className="section-space">
      <div className="container-page">
        <SectionHeading index={index} label="Nos engagements" title="Acheter un téléphone ne devrait pas être un pari." />
        <ol className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-[24px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {promises.map((p, i) => (
            <li key={p.title} className="flex flex-col bg-white p-6 lg:min-h-[240px] lg:p-7">
              <span className="flex items-start justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-tint text-accent">
                  <p.icon className="h-[22px] w-[22px]" strokeWidth={1.7} />
                </span>
                <span className="font-mono text-[12px] text-slate">0{i + 1}</span>
              </span>
              <h3 className="mt-8 text-[21px] font-bold tracking-[-0.03em] text-ink lg:mt-auto">{p.title}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-slate">{p.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function AdviceBand() {
  return (
    <section className="pb-16 lg:pb-24">
      <div className="container-page">
        <div className="grid grid-cols-1 items-end gap-8 rounded-[28px] bg-accent p-7 text-white md:grid-cols-[1fr_auto] lg:p-12">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-white/70">Conseil</p>
            <h2 className="text-h2 mt-4 max-w-[20ch]">Vous hésitez entre deux modèles ? Parlons-en.</h2>
            <p className="mt-4 max-w-[48ch] text-[16px] leading-relaxed text-white/80">
              Un conseiller BBS Connect compare pour vous autonomie, photo, stockage et budget, et vous
              répond sur WhatsApp.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://wa.me/221788379919"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-inverse"
            >
              Écrire sur WhatsApp <ArrowRight className="h-4 w-4" />
            </a>
            <a href="tel:+221788379919" className="btn btn-ghost-light tabular">
              78 837 99 19
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
