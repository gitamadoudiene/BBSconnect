import { PageHeader } from "@/components/dashboard/ui";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/dashboard/CategoryForm";
import { createCategoryAction } from "@/actions/categories";

export default async function NewCategoryPage() {
  const parents = await prisma.category.findMany({ where: { parentId: null }, orderBy: { position: "asc" } });

  return (
    <div>
      <PageHeader
        back={{ href: "/dashboard/categories", label: "Retour aux catégories" }}
        eyebrow="Catalogue"
        title="Nouvelle catégorie"
      />
      <CategoryForm action={createCategoryAction} parentOptions={parents} submitLabel="Créer la catégorie" />
    </div>
  );
}
