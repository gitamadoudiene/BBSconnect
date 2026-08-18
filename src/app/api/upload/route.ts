import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/session";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 });
  }

  const now = new Date();
  const subdir = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;

  const uploaded: { url: string; name: string; size: number }[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const ext = ALLOWED_TYPES[file.type];
    if (!ext) {
      errors.push(`${file.name} : type de fichier non supporté (JPG, PNG ou WEBP uniquement)`);
      continue;
    }
    if (file.size > MAX_SIZE) {
      errors.push(`${file.name} : dépasse la taille maximale de 5 Mo`);
      continue;
    }

    const filename = `uploads/${subdir}/${randomUUID()}.${ext}`;
    const blob = await put(filename, file, { access: "public" });

    uploaded.push({
      url: blob.url,
      name: file.name,
      size: file.size,
    });
  }

  if (uploaded.length === 0) {
    return NextResponse.json({ error: errors[0] ?? "Échec de l'import", errors }, { status: 400 });
  }

  return NextResponse.json({ files: uploaded, errors: errors.length > 0 ? errors : undefined });
}
