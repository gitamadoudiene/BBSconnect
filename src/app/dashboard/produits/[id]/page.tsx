import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/dashboard/ProductForm";
import { updateProductAction } from "@/actions/products";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        variants: {
          orderBy: { position: "asc" },
          include: { images: { orderBy: { position: "asc" } } },
        },
      },
    }),
    prisma.category.findMany({ orderBy: { position: "asc" } }),
  ]);

  if (!product) notFound();

  const boundAction = updateProductAction.bind(null, product.id);

  return (
    <div>
      <Link href="/dashboard/produits" className="mb-4 inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline">
        <ArrowLeft className="h-4 w-4" /> Retour aux produits
      </Link>
      <h1 className="mb-6 text-[20px] font-semibold text-db-text">Modifier {product.name}</h1>

      <ProductForm
        categories={categories}
        action={boundAction}
        submitLabel="Enregistrer les modifications"
        productSlug={product.slug}
        defaultValues={{
          name: product.name,
          slug: product.slug,
          categoryId: product.categoryId,
          description: product.description,
          specs: product.specs,
          featured: product.featured,
          status: product.status,
          tags: product.tags ?? undefined,
          seoTitle: product.seoTitle ?? undefined,
          seoDescription: product.seoDescription ?? undefined,
          variants: product.variants,
        }}
      />
    </div>
  );
}
