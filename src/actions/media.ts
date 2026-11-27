"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { requireMerchant } from "@/lib/auth";
import { mediaUsage } from "@/lib/media";

export type MediaActionState = { error?: string; success?: string } | undefined;

export async function deleteMediaAction(url: string): Promise<MediaActionState> {
  await requireMerchant();
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return { error: "Adresse invalide" };
  }
  if (!host.endsWith(".public.blob.vercel-storage.com")) {
    return { error: "Seules les images importées peuvent être supprimées" };
  }
  const used = (await mediaUsage()).get(url);
  if (used?.length) {
    return { error: `Image utilisée par : ${used.slice(0, 3).join(", ")}${used.length > 3 ? "…" : ""}` };
  }
  await del(url);
  revalidatePath("/dashboard/medias");
  return { success: "Image supprimée" };
}
