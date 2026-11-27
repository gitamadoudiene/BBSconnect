import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Folder, ImageOff, Plus, Trash2, XCircle } from "lucide-react";
import clsx from "clsx";
import { prisma } from "@/lib/prisma";
import { deleteCategoryAction } from "@/actions/categories";
import { ConfirmButton } from "@/components/dashboard/ConfirmButton";
import { EmptyState, Notice, PageHeader } from "@/components/dashboard/ui";

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
      <PageHeader
        eyebrow="Catalogue"
        title="Catégories"
        description={`${categories.length} catégorie${categories.length > 1 ? "s" : ""} · rayons et gammes de la boutique`}
      >
        <Link href="/dashboard/categories/nouveau" className="btn btn-primary btn-sm">
          <Plus className="h-4 w-4" /> Ajouter une catégorie
        </Link>
      </PageHeader>

      {banner && <Notice tone={banner.tone}>{banner.text}</Notice>}

      <div className="overflow-hidden db-card">
        {categories.length === 0 ? (
          <EmptyState
            icon={Folder}
            title="Aucune catégorie pour le moment"
            text="Créez votre première catégorie pour organiser votre catalogue."
            action={<Link href="/dashboard/categories/nouveau" className="btn btn-primary btn-sm"><Plus className="h-4 w-4" /> Ajouter une catégorie</Link>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-line bg-paper/60 text-left">
                  <th className="db-th px-4 py-3">Nom</th>
                  <th className="db-th px-4 py-3">Produits</th>
                  <th className="db-th px-4 py-3">Statut</th>
                  <th className="db-th px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {ordered.map((c) => (
                  <tr key={c.id} className="border-b border-line last:border-0 hover:bg-paper/50">
                    <td className="px-4 py-3.5">
                      <Link href={`/dashboard/categories/${c.id}`} className={clsx("flex items-center gap-3", c.parentId && "pl-6")}>
                        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[12px] bg-paper">
                          {c.image ? (
                            <Image src={c.image} alt={c.name} fill sizes="40px" className="object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ImageOff className="h-3.5 w-3.5 text-db-muted" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold tracking-[-0.01em] text-ink">{c.parentId ? <span className="text-line-strong">↳ </span> : null}{c.name}</p>
                          <p className="font-mono text-[11px] text-slate">/{c.slug}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="tabular px-4 py-3.5 font-mono text-[12.5px] text-ink">{c._count.products}</td>
                    <td className="px-4 py-3.5">
                      <span className={clsx("badge", c.active ? "bg-db-success-tint text-db-success" : "bg-paper text-slate")}>
                        {c.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/categories/${c.id}`}
                          className="pill h-8"
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
                              className="flex h-8 w-8 items-center justify-center rounded-full text-slate transition hover:bg-db-danger-tint hover:text-db-danger"
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
