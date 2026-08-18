"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Check, Eye, ImagePlus, Loader2, Star, Trash2, X } from "lucide-react";
import clsx from "clsx";

export type UploaderImage = {
  key: string; // stable client-side key (url is fine once uploaded)
  url: string;
  isPrimary: boolean;
};

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export function ImageUploader({
  images,
  onChange,
  label = "Images",
  hint = "Ajoutez plusieurs photos de qualité.",
}: {
  images: UploaderImage[];
  onChange: (images: UploaderImage[]) => void;
  label?: string;
  hint?: string;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const files = Array.from(fileList);
    const valid: File[] = [];
    for (const f of files) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        setError(`${f.name} : format non supporté (JPG, PNG ou WEBP uniquement)`);
        continue;
      }
      if (f.size > MAX_SIZE) {
        setError(`${f.name} : dépasse 5 Mo`);
        continue;
      }
      valid.push(f);
    }
    if (valid.length === 0) return;

    setUploadingCount(valid.length);
    const formData = new FormData();
    valid.forEach((f) => formData.append("files", f));

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Échec de l'import");
        return;
      }
      const newImages: UploaderImage[] = data.files.map((f: { url: string }) => ({
        key: f.url,
        url: f.url,
        isPrimary: false,
      }));
      const merged = [...images, ...newImages];
      if (!merged.some((i) => i.isPrimary) && merged.length > 0) merged[0].isPrimary = true;
      onChange(merged);
      if (data.errors) setError(data.errors[0]);
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
      setUploadingCount(0);
    }
  }

  function setPrimary(key: string) {
    onChange(images.map((i) => ({ ...i, isPrimary: i.key === key })));
  }

  function remove(key: string) {
    const filtered = images.filter((i) => i.key !== key);
    if (filtered.length > 0 && !filtered.some((i) => i.isPrimary)) filtered[0].isPrimary = true;
    onChange(filtered);
  }

  function copyUrl(url: string) {
    navigator.clipboard?.writeText(window.location.origin + url).catch(() => {});
  }

  function handleDragStart(index: number) {
    dragIndex.current = index;
  }

  function handleDropReorder(index: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === index) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    onChange(next);
  }

  return (
    <div>
      <p className="text-[13px] font-medium text-ink">{label}</p>
      <p className="mb-3 text-[12.5px] text-slate">{hint}</p>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={clsx(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition",
          dragging ? "border-accent bg-accent-tint" : "border-line hover:border-slate"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploadingCount > 0 ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
            <p className="text-[13px] font-medium text-ink">
              Import de {uploadingCount} image{uploadingCount > 1 ? "s" : ""}…
            </p>
          </>
        ) : (
          <>
            <ImagePlus className="h-6 w-6 text-slate" strokeWidth={1.5} />
            <p className="text-[13px] font-medium text-ink">
              <span className="text-accent">+ Ajouter des images</span> · glissez-déposez ici
            </p>
            <p className="text-[12px] text-slate">JPG, PNG, WEBP · 5 Mo maximum</p>
          </>
        )}
      </div>

      {error && <p className="mt-2 text-[12.5px] font-medium text-sale">{error}</p>}

      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {images.map((img, i) => (
            <div
              key={img.key}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDropReorder(i)}
              className="group relative aspect-square cursor-grab overflow-hidden rounded-lg bg-mist ring-1 ring-line active:cursor-grabbing"
            >
              <Image src={img.url} alt="" fill sizes="120px" className="object-cover" />

              {img.isPrimary && (
                <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-ink/90 px-2 py-0.5 text-[10px] font-semibold text-white">
                  <Star className="h-2.5 w-2.5 fill-white" /> Principale
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-gradient-to-t from-black/70 via-black/40 to-transparent px-1 pb-1.5 pt-5">
                {!img.isPrimary && (
                  <button
                    type="button"
                    title="Définir comme image principale"
                    aria-label="Définir comme image principale"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPrimary(img.key);
                    }}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition hover:bg-white"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  title="Voir en grand"
                  aria-label="Voir en grand"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightbox(img.url);
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm transition hover:bg-white"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Supprimer"
                  aria-label="Supprimer"
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(img.key);
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-sale shadow-sm transition hover:bg-sale hover:text-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-8"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute right-6 top-6 text-white"
            onClick={() => setLightbox(null)}
            aria-label="Fermer"
          >
            <X className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              copyUrl(lightbox);
            }}
            className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-2 text-[12.5px] font-medium text-ink shadow-sm transition hover:bg-white"
          >
            <Check className="h-3.5 w-3.5" /> Copier l&apos;URL
          </button>
          <div className="relative h-full max-h-[80vh] w-full max-w-2xl">
            <Image src={lightbox} alt="" fill sizes="800px" className="object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
