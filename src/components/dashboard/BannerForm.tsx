"use client";

import { useActionState, useState } from "react";
import clsx from "clsx";
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from "lucide-react";
import type { BannerFormState } from "@/actions/banners";
import type { BannerImage } from "@/lib/content";
import { MediaPicker } from "./MediaLibrary";

type Theme = { id: string; label: string; swatch: string };

export type BannerDefaults = {
  eyebrow?: string;
  title?: string;
  text?: string | null;
  ctaLabel?: string | null;
  href?: string;
  tag?: string | null;
  theme?: string;
  images?: BannerImage[];
  showPrice?: boolean;
  active?: boolean;
  startsAt?: string;
  endsAt?: string;
};

const previewBg: Record<string, string> = {
  orange: "bg-signal text-ink",
  blue: "bg-brand text-white",
  ink: "bg-ink text-white",
  sky: "bg-accent-tint text-ink",
  paper: "bg-paper text-ink",
  peach: "bg-signal-tint text-ink",
};

export function BannerForm({
  placement,
  themes,
  maxImages,
  action,
  defaults = {},
  submitLabel,
}: {
  placement: "HERO" | "TILE";
  themes: Theme[];
  maxImages: number;
  action: (state: BannerFormState, formData: FormData) => Promise<BannerFormState>;
  defaults?: BannerDefaults;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [theme, setTheme] = useState(defaults.theme ?? themes[0]!.id);
  const [images, setImages] = useState<BannerImage[]>(defaults.images ?? []);
  const [picking, setPicking] = useState(false);
  const [eyebrow, setEyebrow] = useState(defaults.eyebrow ?? "");
  const [title, setTitle] = useState(defaults.title ?? "");
  const isHero = placement === "HERO";

  const update = (i: number, patch: Partial<BannerImage>) =>
    setImages((list) => list.map((im, j) => (j === i ? { ...im, ...patch } : im)));
  const move = (i: number, d: -1 | 1) =>
    setImages((list) => {
      const next = [...list];
      const j = i + d;
      if (j < 0 || j >= next.length) return list;
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
      <input type="hidden" name="placement" value={placement} />
      <input type="hidden" name="theme" value={theme} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      <div className="space-y-4">
        <section className="db-card space-y-4 p-6 lg:p-8">
          <h2 className="db-eyebrow">Textes</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="eyebrow" className="field-label">Surtitre *</label>
              <input id="eyebrow" name="eyebrow" required maxLength={60} value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} placeholder="Nouveau · Apple" className="field field-sm" />
            </div>
            {isHero && (
              <div>
                <label htmlFor="tag" className="field-label">Étiquette de prix</label>
                <input id="tag" name="tag" maxLength={24} defaultValue={defaults.tag ?? ""} placeholder="Nouveau" className="field field-sm" />
              </div>
            )}
          </div>
          <div>
            <label htmlFor="title" className="field-label">Titre *</label>
            <textarea
              id="title"
              name="title"
              required
              maxLength={90}
              rows={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isHero ? "iPhone 17 Pro\nest arrivé." : "L'iPhone le plus fin."}
              className="field field-sm"
            />
            <p className="mt-1.5 text-[12px] text-slate">
              {isHero ? "Allez à la ligne pour couper le titre en deux." : "Astuce : écrivez {remise} pour afficher la plus forte remise en cours."}
            </p>
          </div>
          <div>
            <label htmlFor="text" className="field-label">{isHero ? "Texte" : "Sous-titre (remplace le prix)"}</label>
            <textarea id="text" name="text" maxLength={300} rows={isHero ? 3 : 1} defaultValue={defaults.text ?? ""} className="field field-sm" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="href" className="field-label">Lien *</label>
              <input id="href" name="href" required defaultValue={defaults.href ?? ""} placeholder="/boutique?marque=samsung" className="field field-sm font-mono text-[12.5px]" />
            </div>
            <div>
              <label htmlFor="ctaLabel" className="field-label">Texte du bouton</label>
              <input id="ctaLabel" name="ctaLabel" maxLength={40} defaultValue={defaults.ctaLabel ?? ""} placeholder={isHero ? "Découvrir" : "J'en profite"} className="field field-sm" />
            </div>
          </div>
          <label className="flex items-start gap-3 rounded-[14px] bg-paper p-3.5 text-[13.5px] text-ink">
            <input type="checkbox" name="showPrice" defaultChecked={defaults.showPrice ?? true} className="mt-0.5 h-4 w-4 accent-[var(--ink)]" />
            <span>
              Afficher le prix « dès … »
              <span className="block text-[12.5px] text-slate">Calculé automatiquement : le plus bas prix des produits vers lesquels pointe le lien.</span>
            </span>
          </label>
        </section>

        <section className="db-card p-6 lg:p-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="db-eyebrow">Images ({images.length}/{maxImages})</h2>
            {images.length < maxImages && (
              <button type="button" onClick={() => setPicking(true)} className="pill h-9">
                <ImagePlus className="h-4 w-4" /> Ajouter
              </button>
            )}
          </div>
          {images.length === 0 ? (
            <button
              type="button"
              onClick={() => setPicking(true)}
              className="flex w-full flex-col items-center gap-2 rounded-[18px] border-2 border-dashed border-line px-6 py-10 text-center text-[13.5px] text-slate transition hover:border-ink"
            >
              <ImagePlus className="h-6 w-6" />
              Choisir une image de produit détouré
            </button>
          ) : (
            <ul className="space-y-3">
              {images.map((im, i) => (
                <li key={`${im.src}-${i}`} className="flex items-center gap-3 rounded-[16px] border border-line p-3">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[12px] bg-paper">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={im.src} alt="" className="h-full w-full object-contain p-1" />
                  </span>
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-slate">
                      {isHero ? (i === 0 ? "Image principale (devant)" : `Arrière-plan ${i}`) : `Image ${i + 1}`}
                    </p>
                    <input
                      value={im.alt}
                      onChange={(e) => update(i, { alt: e.target.value })}
                      placeholder="Description : iPhone 17 Pro orange"
                      aria-label="Description de l'image"
                      className="field field-sm h-9"
                    />
                  </div>
                  {!isHero && images.length === 1 && (
                    <select
                      value={im.size ?? "m"}
                      onChange={(e) => update(i, { size: e.target.value as BannerImage["size"] })}
                      aria-label="Taille de l'image"
                      className="field field-sm h-9 w-auto"
                    >
                      <option value="s">Petite</option>
                      <option value="m">Moyenne</option>
                      <option value="l">Grande</option>
                    </select>
                  )}
                  <div className="flex flex-col gap-1">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Monter" className="flex h-7 w-7 items-center justify-center rounded-full text-slate hover:bg-paper disabled:opacity-30">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} aria-label="Descendre" className="flex h-7 w-7 items-center justify-center rounded-full text-slate hover:bg-paper disabled:opacity-30">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImages((l) => l.filter((_, j) => j !== i))}
                    aria-label="Retirer l'image"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate hover:bg-db-danger-tint hover:text-db-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-[12.5px] text-slate">
            Produits seuls, sur fond transparent (PNG ou WEBP détourés). La mise en place est automatique selon le nombre d&apos;images.
          </p>
        </section>
      </div>

      <div className="space-y-4">
        <section className="db-card p-6">
          <h2 className="db-eyebrow mb-4">Aperçu</h2>
          <div className={clsx("relative overflow-hidden rounded-[18px] p-5", isHero ? "h-[220px]" : "h-[180px]", previewBg[theme])}>
            <div className="relative z-10 max-w-[60%]">
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] opacity-70">{eyebrow || "Surtitre"}</p>
              <p className={clsx("mt-1.5 whitespace-pre-line font-bold leading-[1.02] tracking-[-0.04em]", isHero ? "text-[24px]" : "text-[18px]")}>
                {title || "Titre de la bannière"}
              </p>
            </div>
            {images.slice(0, maxImages).map((im, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={im.src}
                alt=""
                className={clsx(
                  "absolute object-contain drop-shadow-[0_12px_14px_rgba(0,0,0,0.25)]",
                  i === 0 ? "-bottom-2 right-[8%] z-[2] h-[88%]" : i === 1 ? "-bottom-4 right-[34%] z-[1] h-[70%] -rotate-6" : "-bottom-4 -right-2 z-[1] h-[70%] rotate-6"
                )}
              />
            ))}
          </div>
          <p className="mt-2 text-[12px] text-slate">Aperçu simplifié : l&apos;animation et la position exacte s&apos;affichent sur le site.</p>
        </section>

        <section className="db-card space-y-4 p-6">
          <h2 className="db-eyebrow">Couleur</h2>
          <div className="flex flex-wrap gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                aria-pressed={theme === t.id}
                className={clsx("pill h-10 pl-1.5", theme === t.id && "pill-active")}
              >
                <span className="h-7 w-7 rounded-full border border-black/10" style={{ background: t.swatch }} />
                {t.label}
              </button>
            ))}
          </div>
        </section>

        <section className="db-card space-y-4 p-6">
          <h2 className="db-eyebrow">Publication</h2>
          <label className="flex items-center gap-3 text-[14px] text-ink">
            <input type="checkbox" name="active" defaultChecked={defaults.active ?? true} className="h-4 w-4 accent-[var(--ink)]" />
            Visible sur le site
          </label>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label htmlFor="startsAt" className="field-label">Début (optionnel)</label>
              <input id="startsAt" name="startsAt" type="datetime-local" defaultValue={defaults.startsAt ?? ""} className="field field-sm" />
            </div>
            <div>
              <label htmlFor="endsAt" className="field-label">Fin (optionnel)</label>
              <input id="endsAt" name="endsAt" type="datetime-local" defaultValue={defaults.endsAt ?? ""} className="field field-sm" />
            </div>
            <p className="text-[12.5px] text-slate">Heure de Dakar. Pratique pour une offre limitée : la bannière apparaît et disparaît seule.</p>
          </div>
          {state?.error && <p role="alert" className="rounded-[12px] bg-db-danger-tint px-3.5 py-2.5 text-[13.5px] font-medium text-db-danger">{state.error}</p>}
          <button type="submit" disabled={pending} className="btn btn-primary w-full">
            {pending ? "Enregistrement…" : submitLabel}
          </button>
        </section>
      </div>

      {picking && (
        <MediaPicker
          onClose={() => setPicking(false)}
          onPick={(url) => {
            setImages((l) => [...l, { src: url, alt: "", ...(isHero ? {} : { size: "m" as const }) }].slice(0, maxImages));
            setPicking(false);
          }}
        />
      )}
    </form>
  );
}
