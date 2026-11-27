"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Check, Copy, ImagePlus, Loader2, Lock, Trash2, X } from "lucide-react";
import { deleteMediaAction } from "@/actions/media";
import type { MediaItem } from "@/lib/media";

async function uploadFiles(files: FileList | File[]) {
  const body = new FormData();
  for (const f of Array.from(files)) body.append("files", f);
  const res = await fetch("/api/upload", { method: "POST", body });
  const json = (await res.json()) as { files?: { url: string }[]; error?: string; errors?: string[] };
  return { urls: json.files?.map((f) => f.url) ?? [], error: json.error ?? json.errors?.[0] };
}

function formatSize(n: number | null) {
  if (n === null) return "";
  return n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} Mo` : `${Math.round(n / 1024)} Ko`;
}

function UploadButton({ onDone, className }: { onDone: (urls: string[], error?: string) => void; className?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={async (e) => {
          if (!e.target.files?.length) return;
          setBusy(true);
          const { urls, error } = await uploadFiles(e.target.files);
          setBusy(false);
          e.target.value = "";
          onDone(urls, error);
        }}
      />
      <button type="button" onClick={() => input.current?.click()} disabled={busy} className={clsx("btn btn-primary btn-sm", className)}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
        {busy ? "Import…" : "Importer des images"}
      </button>
    </>
  );
}

function Thumb({ item }: { item: MediaItem }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary blob URLs, thumbnails only
    <img src={item.url} alt={item.name} loading="lazy" className="h-full w-full object-contain p-3" />
  );
}

/* ---------------------------------------------------------------- page --- */

export function MediaLibrary({ items, usage }: { items: MediaItem[]; usage: Record<string, string[]> }) {
  const router = useRouter();
  const [message, setMessage] = useState<{ tone: "success" | "danger"; text: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | "uploaded" | "builtin" | "unused">("all");

  const shown = items.filter((i) =>
    filter === "uploaded" ? !i.builtIn : filter === "builtin" ? i.builtIn : filter === "unused" ? !i.builtIn && !usage[i.url] : true
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="rail flex gap-2 overflow-x-auto">
          {(
            [
              ["all", "Toutes"],
              ["uploaded", "Importées"],
              ["builtin", "Fournies avec le site"],
              ["unused", "Non utilisées"],
            ] as const
          ).map(([k, label]) => (
            <button key={k} type="button" onClick={() => setFilter(k)} className={clsx("pill", filter === k && "pill-active")}>
              {label}
            </button>
          ))}
        </div>
        <UploadButton
          onDone={(urls, error) => {
            setMessage(error ? { tone: "danger", text: error } : { tone: "success", text: `${urls.length} image(s) importée(s)` });
            router.refresh();
          }}
        />
      </div>

      {message && (
        <p
          role="status"
          className={clsx(
            "mb-4 rounded-[14px] px-4 py-3 text-[13.5px] font-medium",
            message.tone === "success" ? "bg-db-success-tint text-db-success" : "bg-db-danger-tint text-db-danger"
          )}
        >
          {message.text}
        </p>
      )}

      {shown.length === 0 ? (
        <div className="db-card flex flex-col items-center px-6 py-16 text-center">
          <ImagePlus className="mb-3 h-8 w-8 text-slate" strokeWidth={1.5} />
          <p className="text-[15px] font-semibold text-ink">Aucune image ici</p>
          <p className="mt-1 text-[13.5px] text-slate">JPG, PNG ou WEBP, 5 Mo maximum. Préférez des produits détourés sur fond transparent.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {shown.map((item) => {
            const used = usage[item.url];
            return (
              <li key={item.url} className="db-card group overflow-hidden">
                <div className="relative aspect-square bg-paper">
                  <Thumb item={item} />
                  {item.builtIn && (
                    <span className="absolute left-2 top-2 badge bg-white/90 text-slate">
                      <Lock className="h-3 w-3" /> Site
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate font-mono text-[11px] text-ink" title={item.name}>{item.name}</p>
                  <p className="mt-0.5 truncate text-[11.5px] text-slate" title={used?.join(", ")}>
                    {used ? `Utilisée · ${used[0]}${used.length > 1 ? ` +${used.length - 1}` : ""}` : item.builtIn ? "Image du site" : `Non utilisée · ${formatSize(item.size)}`}
                  </p>
                  <div className="mt-2.5 flex gap-1.5">
                    <button
                      type="button"
                      onClick={async () => {
                        await navigator.clipboard.writeText(item.url.startsWith("/") ? location.origin + item.url : item.url);
                        setCopied(item.url);
                        setTimeout(() => setCopied(null), 1500);
                      }}
                      className="pill h-8 flex-1 justify-center"
                    >
                      {copied === item.url ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied === item.url ? "Copiée" : "Lien"}
                    </button>
                    {!item.builtIn && (
                      <button
                        type="button"
                        disabled={pending || !!used}
                        title={used ? "Utilisée : retirez-la d'abord des produits ou bannières" : "Supprimer"}
                        aria-label="Supprimer l'image"
                        onClick={() => {
                          if (!confirm("Supprimer définitivement cette image ?")) return;
                          startTransition(async () => {
                            const r = await deleteMediaAction(item.url);
                            setMessage(r?.error ? { tone: "danger", text: r.error } : { tone: "success", text: "Image supprimée" });
                            router.refresh();
                          });
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-slate transition hover:border-db-danger hover:text-db-danger disabled:opacity-30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- picker --- */

export function MediaPicker({ onPick, onClose }: { onPick: (url: string) => void; onClose: () => void }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/media")
      .then((res) => res.json() as Promise<{ items?: MediaItem[]; error?: string }>)
      .then((json) => {
        if (cancelled) return;
        if (json.items) setItems(json.items);
        else setError(json.error ?? "Impossible de charger la médiathèque");
      })
      .catch(() => !cancelled && setError("Impossible de charger la médiathèque"));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-4" role="dialog" aria-modal="true" aria-label="Médiathèque">
      <div className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-[22px] bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
          <div>
            <p className="db-eyebrow">Médiathèque</p>
            <p className="text-[18px] font-bold tracking-[-0.03em] text-ink">Choisir une image</p>
          </div>
          <div className="flex items-center gap-2">
            <UploadButton
              onDone={(urls, err) => {
                if (err) setError(err);
                if (urls[0]) onPick(urls[0]);
              }}
            />
            <button type="button" onClick={onClose} aria-label="Fermer" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-paper">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto p-6">
          {error && <p className="mb-4 rounded-[12px] bg-db-danger-tint px-4 py-3 text-[13.5px] text-db-danger">{error}</p>}
          {!items ? (
            <p className="flex items-center gap-2 text-[13.5px] text-slate">
              <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
            </p>
          ) : (
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {items.map((item) => (
                <li key={item.url}>
                  <button
                    type="button"
                    onClick={() => onPick(item.url)}
                    className="block aspect-square w-full overflow-hidden rounded-[16px] border border-line bg-paper transition hover:border-ink"
                    title={item.name}
                  >
                    <Thumb item={item} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
