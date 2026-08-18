"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export function SingleImageUploader({
  name,
  value,
  onChange,
  hint = "JPG, PNG, WEBP · 5 Mo maximum",
}: {
  name: string;
  value: string | null;
  onChange: (url: string | null) => void;
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Format non supporté (JPG, PNG ou WEBP uniquement)");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Le fichier dépasse 5 Mo");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("files", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Échec de l'import");
        return;
      }
      onChange(data.files[0].url);
    } catch {
      setError("Impossible de contacter le serveur");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={value ?? ""} />
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value ? (
        <div className="relative h-32 w-32 overflow-hidden rounded-xl bg-mist ring-1 ring-line">
          <Image src={value} alt="" fill sizes="128px" className="object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm"
            aria-label="Retirer l'image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-32 w-32 flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-db-border text-center transition hover:border-accent"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
          ) : (
            <>
              <ImagePlus className="h-5 w-5 text-db-muted" strokeWidth={1.5} />
              <span className="px-2 text-[11px] text-db-muted">{hint}</span>
            </>
          )}
        </button>
      )}
      {error && <p className="mt-1.5 text-[12px] font-medium text-db-danger">{error}</p>}
    </div>
  );
}
