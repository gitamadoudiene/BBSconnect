import Link from "next/link";
import clsx from "clsx";
import type { BannerPlacement } from "@prisma/client";
import { ArrowDown, ArrowUp, Download, Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireMerchant } from "@/lib/auth";
import { DEFAULT_BANNERS, bannerImages } from "@/lib/content";
import {
  deleteBannerAction,
  importDefaultBannersAction,
  moveBannerAction,
  toggleBannerAction,
} from "@/actions/banners";
import { ConfirmButton } from "@/components/dashboard/ConfirmButton";
import { CardTitle, Notice, PageHeader } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

const groups: { placement: BannerPlacement; title: string; text: string }[] = [
  {
    placement: "HERO",
    title: "Grande bannière animée",
    text: "Les diapositives tout en haut de l'accueil, avec téléphones animés et étiquette de prix.",
  },
  {
    placement: "TILE",
    title: "Petites bannières",
    text: "Les tuiles colorées sous la grande bannière. 4 tuiles remplissent une ligne.",
  },
];

function status(b: { active: boolean; startsAt: Date | null; endsAt: Date | null }, now: Date) {
  if (!b.active) return { label: "Masquée", className: "bg-paper text-slate" };
  if (b.endsAt && b.endsAt <= now) return { label: "Terminée", className: "bg-paper text-slate" };
  if (b.startsAt && b.startsAt > now) return { label: "Programmée", className: "bg-accent-tint text-accent-deep" };
  return { label: "En ligne", className: "bg-db-success-tint text-db-success" };
}

function fmt(d: Date | null) {
  return d ? d.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short", timeZone: "Africa/Dakar" }) : null;
}

function currentTime() {
  return new Date();
}

type SearchParams = Promise<{ saved?: string; deleted?: string; imported?: string }>;

export default async function BannersPage({ searchParams }: { searchParams: SearchParams }) {
  await requireMerchant();
  const params = await searchParams;
  const banners = await prisma.banner.findMany({ orderBy: [{ placement: "asc" }, { position: "asc" }] });
  const now = currentTime();

  return (
    <div>
      <PageHeader eyebrow="Boutique" title="Bannières" description="Ce que vos clients voient en premier sur la page d'accueil." />

      {params.saved && <Notice tone="success">Bannière enregistrée.</Notice>}
      {params.deleted && <Notice tone="success">Bannière supprimée.</Notice>}
      {params.imported && <Notice tone="success">Bannières importées : vous pouvez maintenant les modifier.</Notice>}

      <div className="space-y-4">
        {groups.map((g) => {
          const rows = banners.filter((b) => b.placement === g.placement);
          const defaults = DEFAULT_BANNERS.filter((b) => b.placement === g.placement);
          return (
            <section key={g.placement} className="db-card overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-4 p-6 pb-2">
                <div>
                  <CardTitle>{g.title}</CardTitle>
                  <p className="-mt-3 max-w-[56ch] text-[13.5px] text-slate">{g.text}</p>
                </div>
                <Link href={`/dashboard/bannieres/nouveau?type=${g.placement}`} className="btn btn-primary btn-sm">
                  <Plus className="h-4 w-4" /> Nouvelle bannière
                </Link>
              </div>

              {rows.length === 0 ? (
                <div className="m-6 mt-4 rounded-[18px] bg-paper p-5">
                  <p className="text-[14px] font-semibold text-ink">
                    Le site affiche les {defaults.length} bannières de lancement.
                  </p>
                  <p className="mt-1 text-[13.5px] text-slate">{defaults.map((d) => d.title.replace("\n", " ")).join(" · ")}</p>
                  <form action={importDefaultBannersAction.bind(null, g.placement)} className="mt-4">
                    <button className="btn btn-secondary btn-sm">
                      <Download className="h-4 w-4" /> Les importer pour les modifier
                    </button>
                  </form>
                </div>
              ) : (
                <ul className="mt-4 border-t border-line">
                  {rows.map((b, i) => {
                    const s = status(b, now);
                    const imgs = bannerImages(b.images);
                    return (
                      <li key={b.id} className="flex flex-wrap items-center gap-4 border-b border-line px-6 py-4 last:border-0">
                        <span className="font-mono text-[12px] text-slate">{String(i + 1).padStart(2, "0")}</span>
                        <span className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-paper">
                          {imgs[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={imgs[0].src} alt="" className="h-full w-full object-contain p-1" />
                          ) : null}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-slate">{b.eyebrow}</p>
                          <p className="truncate text-[15px] font-semibold tracking-[-0.02em] text-ink">{b.title.replace("\n", " ")}</p>
                          <p className="truncate font-mono text-[11px] text-slate">
                            {b.href}
                            {(b.startsAt || b.endsAt) && ` · ${fmt(b.startsAt) ?? "…"} → ${fmt(b.endsAt) ?? "…"}`}
                          </p>
                        </div>
                        <span className={clsx("badge", s.className)}>{s.label}</span>
                        <div className="flex items-center gap-1">
                          <form action={moveBannerAction.bind(null, b.id, -1)}>
                            <button
                              disabled={i === 0}
                              aria-label="Monter"
                              className="flex h-8 w-8 items-center justify-center rounded-full text-slate hover:bg-paper disabled:opacity-30"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </button>
                          </form>
                          <form action={moveBannerAction.bind(null, b.id, 1)}>
                            <button
                              disabled={i === rows.length - 1}
                              aria-label="Descendre"
                              className="flex h-8 w-8 items-center justify-center rounded-full text-slate hover:bg-paper disabled:opacity-30"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </button>
                          </form>
                          <form action={toggleBannerAction.bind(null, b.id)}>
                            <button
                              aria-label={b.active ? "Masquer" : "Afficher"}
                              title={b.active ? "Masquer" : "Afficher"}
                              className="flex h-8 w-8 items-center justify-center rounded-full text-slate hover:bg-paper"
                            >
                              {b.active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </form>
                          <Link href={`/dashboard/bannieres/${b.id}`} className="pill h-8">
                            <Pencil className="h-3.5 w-3.5" /> Modifier
                          </Link>
                          <ConfirmButton
                            action={deleteBannerAction.bind(null, b.id)}
                            title="Supprimer cette bannière ?"
                            description="Elle disparaît du site. Cette action est irréversible."
                            trigger={
                              <button
                                aria-label="Supprimer"
                                className="flex h-8 w-8 items-center justify-center rounded-full text-slate transition hover:bg-db-danger-tint hover:text-db-danger"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            }
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
