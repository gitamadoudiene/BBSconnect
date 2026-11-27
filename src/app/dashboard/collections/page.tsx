import Link from "next/link";
import clsx from "clsx";
import { ArrowUpRight, Home, Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireMerchant } from "@/lib/auth";
import { deleteCollectionAction } from "@/actions/collections";
import { ConfirmButton } from "@/components/dashboard/ConfirmButton";
import { EmptyState, Notice, PageHeader } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function CollectionsPage({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  await requireMerchant();
  const params = await searchParams;
  const collections = await prisma.collection.findMany({
    orderBy: { position: "asc" },
    include: {
      _count: { select: { products: true } },
      products: {
        orderBy: { position: "asc" },
        take: 4,
        select: {
          product: {
            select: {
              id: true,
              variants: { take: 1, orderBy: { position: "asc" }, select: { images: { take: 1, orderBy: { position: "asc" }, select: { url: true } } } },
            },
          },
        },
      },
    },
  });

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Collections"
        description="Des sélections de produits choisies à la main : « Spécial rentrée », « Moins de 200 000 F », « Meilleures ventes »…"
      >
        <Link href="/dashboard/collections/nouveau" className="btn btn-primary btn-sm">
          <Plus className="h-4 w-4" /> Nouvelle collection
        </Link>
      </PageHeader>

      {params.saved && <Notice tone="success">Collection enregistrée.</Notice>}
      {params.deleted && <Notice tone="success">Collection supprimée.</Notice>}

      {collections.length === 0 ? (
        <div className="db-card">
          <EmptyState
            icon={Layers}
            title="Aucune collection pour le moment"
            text="Regroupez des produits pour une opération commerciale, puis affichez-les sur l'accueil ou partagez leur lien."
            action={
              <Link href="/dashboard/collections/nouveau" className="btn btn-primary btn-sm">
                <Plus className="h-4 w-4" /> Créer une collection
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {collections.map((c) => (
            <li key={c.id} className="db-card flex flex-col overflow-hidden">
              <div className="grid h-36 grid-cols-4 gap-1 bg-paper p-3">
                {Array.from({ length: 4 }).map((_, i) => {
                  const url = c.products[i]?.product.variants[0]?.images[0]?.url;
                  return (
                    <span key={i} className="flex items-center justify-center overflow-hidden rounded-[10px] bg-white">
                      {url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt="" className="h-full w-full object-contain p-1.5" />
                      )}
                    </span>
                  );
                })}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={clsx("badge", c.active ? "bg-db-success-tint text-db-success" : "bg-paper text-slate")}>
                    {c.active ? "Active" : "Inactive"}
                  </span>
                  {c.onHome && (
                    <span className="badge bg-accent-tint text-accent-deep">
                      <Home className="h-3 w-3" /> Accueil
                    </span>
                  )}
                </div>
                <p className="mt-3 text-[18px] font-bold tracking-[-0.03em] text-ink">{c.name}</p>
                <p className="font-mono text-[11.5px] text-slate">
                  {c._count.products} produit{c._count.products > 1 ? "s" : ""} · /{c.slug}
                </p>
                {c.description && <p className="mt-2 line-clamp-2 text-[13.5px] text-slate">{c.description}</p>}
                <div className="mt-auto flex items-center gap-1.5 pt-5">
                  <Link href={`/dashboard/collections/${c.id}`} className="pill h-9 flex-1 justify-center">
                    <Pencil className="h-3.5 w-3.5" /> Modifier
                  </Link>
                  <Link href={`/boutique?collection=${c.slug}`} target="_blank" aria-label="Voir sur la boutique" className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink hover:border-ink">
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <ConfirmButton
                    action={deleteCollectionAction.bind(null, c.id)}
                    title="Supprimer cette collection ?"
                    description="Les produits restent dans le catalogue ; seule la sélection disparaît."
                    trigger={
                      <button aria-label="Supprimer" className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-slate transition hover:border-db-danger hover:text-db-danger">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    }
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
