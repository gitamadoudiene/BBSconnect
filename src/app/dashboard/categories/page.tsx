import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Folder, ImageOff, Plus, Trash2, XCircle } from "lucide-react";
import clsx from "clsx";
import { prisma } from "@/lib/prisma";
import { deleteCategoryAction } from "@/actions/categories";
import { ConfirmButton } from "@/components/dashboard/ConfirmButton";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ error?: string; deleted?: string; created?: string; updated?: string }>;

export default async function CategoriesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const categories = await prisma.category.findMany({
    orderBy: { position: "asc" },
    include: { _count: { select: { products: true, children: true } } },
  });

  const roots = categories.filter((c) => !c.parentId);
  const byParent = new Map<string, typeof categories>();
  for (const c of categories) {
    if (!c.parentId) continue;
    byParent.set(c.parentId, [...(byParent.get(c.parentId) ?? []), c]);
  }

  const ordered = roots.flatMap((r) => [r, ...(byParent.get(r.id) ?? [])]);

  const banner =
    params.deleted ? { icon: CheckCircle2, text: "Catégorie supprimée.", tone: "success" as const } :
    params.created ? { icon: CheckCircle2, text: "Catégorie créée avec succès.", tone: "success" as const } :
    params.updated ? { icon: CheckCircle2, text: "Catégorie mise à jour.", tone: "success" as const } :
    params.error === "has-products" ? { icon: XCircle, text: "Impossible de supprimer : des produits utilisent cette catégorie.", tone: "danger" as const } :
    params.error === "has-children" ? { icon: XCircle, text: "Impossible de supprimer : cette catégorie a des sous-catégories.", tone: "danger" as const } :
    null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-semibold text-db-text">Catégories</h1>
          <p className="text-[13px] text-db-muted">{categories.length} catégorie{categories.length > 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/dashboard/categories/nouveau"
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-accent-deep"
        >
          <Plus className="h-4 w-4" /> Ajouter une catégorie
        </Link>
      </div>

      {banner && (
        <div
          className={clsx(
            "mb-4 flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-[13px]",
            banner.tone === "success" ? "border-db-success/20 bg-db-success-tint text-db-success" : "border-db-danger/20 bg-db-danger-tint text-db-danger"
          )}
        >
          <banner.icon className="h-4 w-4 shrink-0" />
          {banner.text}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-db-border bg-db-card">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <Folder className="mb-3 h-9 w-9 text-db-muted" strokeWidth={1.5} />
            <p className="text-[14px] font-medium text-db-text">Aucune catégorie pour le moment</p>
            <p className="mt-1 text-[13px] text-db-muted">Créez votre première catégorie pour organiser votre catalogue.</p>
            <Link
              href="/dashboard/categories/nouveau"
              className="mt-4 rounded-lg bg-accent px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-accent-deep"
            >
              Ajouter une catégorie
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-db-border bg-db-bg text-left text-[11px] uppercase tracking-wide text-db-muted">
                  <th className="p-3">Nom</th>
                  <th className="p-3">Produits</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ordered.map((c) => (
                  <tr key={c.id} className="border-b border-db-border/70 last:border-0 hover:bg-db-bg/50">
                    <td className="p-3">
                      <Link href={`/dashboard/categories/${c.id}`} className={clsx("flex items-center gap-3", c.parentId && "pl-6")}>
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-db-bg">
                          {c.image ? (
                            <Image src={c.image} alt={c.name} fill sizes="40px" className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ImageOff className="h-3.5 w-3.5 text-db-muted" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-db-text">{c.parentId ? "↳ " : ""}{c.name}</p>
                          <p className="text-[11.5px] text-db-muted">/{c.slug}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="p-3 text-db-muted">{c._count.products}</td>
                    <td className="p-3">
                      <span className={clsx("rounded-full px-2.5 py-1 text-[11px] font-semibold", c.active ? "bg-db-success-tint text-db-success" : "bg-db-bg text-db-muted")}>
                        {c.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/categories/${c.id}`}
                          className="rounded-lg px-2.5 py-1.5 text-[12.5px] font-medium text-accent hover:bg-accent-tint"
                        >
                          Modifier
                        </Link>
                        <ConfirmButton
                          action={deleteCategoryAction.bind(null, c.id)}
                          title="Supprimer cette catégorie ?"
                          description="Cette action est irréversible."
                          trigger={
                            <button
                              aria-label="Supprimer"
                              className="rounded-lg p-2 text-db-muted transition hover:bg-db-danger-tint hover:text-db-danger"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          }
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
