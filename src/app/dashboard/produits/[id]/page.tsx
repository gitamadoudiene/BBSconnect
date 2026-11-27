import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/ui";
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
      <PageHeader
        back={{ href: "/dashboard/produits", label: "Retour aux produits" }}
        eyebrow="Catalogue · Modifier"
        title={product.name}
      />

      <ProductForm
        categories={categories}
        action={boundAction}
        submitLabel="Enregistrer les modifications"
        productSlug={product.slug}
        defaultValues={{
          name: product.name,
          slug: product.slug,
          categoryId: product.categoryId,
          brand: product.brand,
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
