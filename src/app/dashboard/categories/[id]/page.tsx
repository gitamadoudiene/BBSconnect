import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard/ui";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/dashboard/CategoryForm";
import { updateCategoryAction } from "@/actions/categories";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [category, parents] = await Promise.all([
    prisma.category.findUnique({ where: { id } }),
    prisma.category.findMany({ where: { parentId: null, id: { not: id } }, orderBy: { position: "asc" } }),
  ]);

  if (!category) notFound();

  const boundAction = updateCategoryAction.bind(null, category.id);

  return (
    <div>
      <PageHeader
        back={{ href: "/dashboard/categories", label: "Retour aux catégories" }}
        eyebrow="Catalogue · Modifier"
        title={category.name}
      />
      <CategoryForm
        action={boundAction}
        parentOptions={parents}
        submitLabel="Enregistrer les modifications"
        defaultValues={{
          name: category.name,
          slug: category.slug,
          description: category.description ?? undefined,
          image: category.image,
          parentId: category.parentId,
          brand: category.brand,
          active: category.active,
        }}
      />
    </div>
  );
}
