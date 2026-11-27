import { NextResponse } from "next/server";
import { getMerchant } from "@/lib/auth";
import { BUILT_IN_MEDIA, listUploadedMedia } from "@/lib/media";

export async function GET() {
  if (!(await getMerchant())) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { items } = await listUploadedMedia();
  return NextResponse.json({ items: [...items, ...BUILT_IN_MEDIA] });
}
