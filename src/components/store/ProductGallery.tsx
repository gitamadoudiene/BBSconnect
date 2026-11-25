"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PhoneSilhouette } from "@/components/ui/PhoneSilhouette";

export type GalleryImage = { id: string; url: string; alt?: string | null };

export function ProductGallery({
  images,
  productName,
  color,
}: {
  images: GalleryImage[];
  productName: string;
  /** variant colour, used for the silhouette when there is no photo */
  color?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => setIndex(0), [images]);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/5] rounded-[24px] bg-paper sm:aspect-square lg:aspect-[4/5]">
        <PhoneSilhouette color={color} label="Photo à venir" />
      </div>
    );
  }

  const active = images[index] ?? images[0];

  function go(delta: number) {
    setIndex((i) => (i + delta + images.length) % images.length);
  }

  return (
    <div className={clsx("grid grid-cols-1 gap-4 sm:gap-5", images.length > 1 && "sm:grid-cols-[88px_1fr]")}>
      {images.length > 1 && (
        <div className="hidden flex-col gap-3 sm:flex">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setIndex(i)}
              className={clsx(
                "relative aspect-square overflow-hidden rounded-[14px] bg-paper outline-offset-2 transition",
                i === index ? "outline outline-[1.5px] outline-ink" : "opacity-70 hover:opacity-100"
              )}
            >
              <Image src={img.url} alt={img.alt ?? productName} fill sizes="88px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-paper sm:aspect-square lg:aspect-[4/5]">
        <div key={active.id} className="absolute inset-0">
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
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-ink"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label="Image suivante"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-ink"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:hidden">
              {images.map((img, i) => (
                <span
                  key={img.id}
                  className={clsx("h-1.5 rounded-full", i === index ? "w-5 bg-ink" : "w-1.5 bg-ink/25")}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
