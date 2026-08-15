import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/dashboard/ProductForm";
import { updateProductAction } from "@/actions/products";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product) notFound();

  const boundAction = updateProductAction.bind(null, product.id);

  return (
    <div>
      <Link href="/dashboard/produits" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-brand-blue hover:underline">
        <ArrowLeft className="h-4 w-4" /> Retour aux produits
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-brand-navy">Modifier {product.name}</h1>

      <ProductForm
        categories={categories}
        action={boundAction}
        submitLabel="Enregistrer les modifications"
        defaultValues={{
          name: product.name,
          sku: product.sku,
          categoryId: product.categoryId,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          stock: product.stock,
          color: product.color,
          storage: product.storage,
          description: product.description,
          specs: product.specs,
          featured: product.featured,
        }}
      />
    </div>
  );
}
