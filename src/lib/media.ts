import { list } from "@vercel/blob";
import { prisma } from "@/lib/prisma";

export type MediaItem = {
  url: string;
  name: string;
  size: number | null;
  uploadedAt: string | null;
  /** Shipped with the site (read-only) vs uploaded to the blob store. */
  builtIn: boolean;
};

/** Product cut-outs bundled with the site — usable in banners, not deletable. */
export const BUILT_IN_MEDIA: MediaItem[] = [
  "iphone17pro-orange",
  "iphone17pro-deepblue",
  "iphone17pro-silver",
  "iphone17-black",
  "iphone17-white",
  "iphone-air",
  "iphone12-range",
  "galaxy-zfold",
  "galaxy-duo",
  "case-magsafe",
].map((n) => ({ url: `/images/banner/${n}.webp`, name: `${n}.webp`, size: null, uploadedAt: null, builtIn: true }));

/** Uploaded images. If the blob store can't be listed (missing or revoked
 *  token), falls back to the images the catalogue references, with a warning. */
export async function listUploadedMedia(): Promise<{ items: MediaItem[]; warning: string | null }> {
  const items: MediaItem[] = [];
  let warning: string | null = null;
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    warning = "Stockage d'images non configuré (BLOB_READ_WRITE_TOKEN manquant).";
  } else {
    try {
      let cursor: string | undefined;
      do {
        const page = await list({ cursor, limit: 1000, prefix: "uploads/" });
        for (const b of page.blobs) {
          items.push({
            url: b.url,
            name: b.pathname.split("/").pop() ?? b.pathname,
            size: b.size,
            uploadedAt: b.uploadedAt.toISOString(),
            builtIn: false,
          });
        }
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);
    } catch {
      warning = "Le stockage d'images Vercel Blob refuse l'accès : vérifiez la clé BLOB_READ_WRITE_TOKEN. Seules les images déjà utilisées sont listées.";
    }
  }
  // Anything the catalogue points at but the listing missed.
  const known = new Set(items.map((i) => i.url));
  for (const url of (await mediaUsage()).keys()) {
    if (known.has(url) || url.startsWith("/")) continue;
    known.add(url);
    items.push({ url, name: url.split("/").pop() ?? url, size: null, uploadedAt: null, builtIn: false });
  }
  items.sort((a, b) => (b.uploadedAt ?? "").localeCompare(a.uploadedAt ?? ""));
  return { items, warning };
}

/** Where an image is used — so the library never deletes a live picture. */
export async function mediaUsage(): Promise<Map<string, string[]>> {
  const [images, categories, banners] = await Promise.all([
    prisma.productImage.findMany({ select: { url: true, variant: { select: { product: { select: { name: true } } } } } }),
    prisma.category.findMany({ where: { image: { not: null } }, select: { image: true, name: true } }),
    prisma.banner.findMany({ select: { images: true, eyebrow: true } }),
  ]);
  const usage = new Map<string, string[]>();
  const add = (url: string, label: string) => {
    const list = usage.get(url) ?? [];
    if (!list.includes(label)) list.push(label);
    usage.set(url, list);
  };
  for (const i of images) add(i.url, i.variant.product.name);
  for (const c of categories) add(c.image!, `Catégorie ${c.name}`);
  for (const b of banners) {
    if (!Array.isArray(b.images)) continue;
    for (const im of b.images as { src?: string }[]) if (im?.src) add(im.src, `Bannière ${b.eyebrow}`);
  }
  return usage;
}
