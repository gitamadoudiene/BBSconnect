"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type GalleryImage = { id: string; url: string; alt?: string | null };

export function ProductGallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => setIndex(0), [images]);

  if (images.length === 0) {
    return <div className="aspect-[4/5] rounded-[28px] bg-mist" />;
  }

  const active = images[index] ?? images[0];

  function go(delta: number) {
    setIndex((i) => (i + delta + images.length) % images.length);
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[88px_1fr] sm:gap-5">
      {images.length > 1 && (
        <div className="hidden flex-col gap-3 sm:flex">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setIndex(i)}
              className={clsx(
                "relative aspect-square overflow-hidden rounded-xl bg-mist ring-1 transition",
                i === index ? "ring-ink" : "ring-transparent hover:ring-line"
              )}
            >
              <Image src={img.url} alt={img.alt ?? productName} fill sizes="88px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] bg-mist sm:aspect-square lg:aspect-[4/5]">
        <div key={active.id} className="animate-gallery-in absolute inset-0">
          <Image
            src={active.url}
            alt={active.alt ?? productName}
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 90vw"
            className="object-cover"
          />
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={() => go(-1)}
              aria-label="Image précédente"
              className="glass absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink transition hover:scale-105"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Image suivante"
              className="glass absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink transition hover:scale-105"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:hidden">
              {images.map((img, i) => (
                <span
                  key={img.id}
                  className={clsx("h-1.5 rounded-full transition-all", i === index ? "w-5 bg-white" : "w-1.5 bg-white/50")}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
