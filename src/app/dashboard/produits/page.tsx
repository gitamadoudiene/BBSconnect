import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatFCFA } from "@/lib/format";
import { deleteProductAction } from "@/actions/products";
import { PhoneMock } from "@/components/ui/PhoneMock";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ q?: string; error?: string; deleted?: string }>;

export default async function DashboardProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const products = await prisma.product.findMany({
    where: params.q ? { name: { contains: params.q } } : undefined,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Produits</h1>
          <p className="text-sm text-brand-navy/60">{products.length} produit(s) au catalogue</p>
        </div>
        <Link
          href="/dashboard/produits/nouveau"
          className="flex items-center gap-2 rounded-md bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-dark"
        >
          <Plus className="h-4 w-4" /> Nouveau produit
        </Link>
      </div>

      {params.error === "has-orders" && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Impossible de supprimer ce produit : il fait partie de commandes existantes.
        </div>
      )}
      {params.deleted && (
        <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          Produit supprimé avec succès.
        </div>
      )}

      <form className="mb-4">
        <input
          type="search"
          name="q"
          defaultValue={params.q}
          placeholder="Rechercher un produit..."
          className="w-full max-w-sm rounded-md border border-brand-border px-3 py-2 text-sm outline-none focus:border-brand-blue"
        />
      </form>

      <div className="overflow-x-auto rounded-lg border border-brand-border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-gray text-left text-xs uppercase text-brand-navy/50">
              <th className="p-3">Produit</th>
              <th className="p-3">Catégorie</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Prix</th>
              <th className="p-3">Stock</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-brand-border/60 last:border-0">
                <td className="flex items-center gap-3 p-3">
                  <div className="h-12 w-8 shrink-0 rounded bg-brand-gray p-1">
                    <PhoneMock color={p.color} variant="back" />
                  </div>
                  <div>
                    <p className="line-clamp-1 font-medium text-brand-navy">{p.name}</p>
                    {p.storage && <p className="text-xs text-brand-navy/50">{p.storage}</p>}
                  </div>
                </td>
                <td className="p-3 text-brand-navy/70">{p.category.name}</td>
                <td className="p-3 text-brand-navy/50">{p.sku}</td>
                <td className="p-3 font-medium text-brand-navy">{formatFCFA(p.price)}</td>
                <td className="p-3">
                  <span className={p.stock <= 5 ? "font-semibold text-amber-600" : "text-brand-navy/70"}>
                    {p.stock}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/dashboard/produits/${p.id}`}
                      aria-label="Modifier"
                      className="rounded-md p-2 text-brand-navy/60 hover:bg-brand-blue-light hover:text-brand-blue"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <form action={deleteProductAction.bind(null, p.id)}>
                      <button
                        aria-label="Supprimer"
                        className="rounded-md p-2 text-brand-navy/60 hover:bg-red-50 hover:text-brand-red"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="p-8 text-center text-sm text-brand-navy/50">Aucun produit trouvé.</p>
        )}
      </div>
    </div>
  );
}
