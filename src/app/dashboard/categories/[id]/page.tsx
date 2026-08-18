import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
      <Link href="/dashboard/categories" className="mb-4 inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline">
        <ArrowLeft className="h-4 w-4" /> Retour aux catégories
      </Link>
      <h1 className="mb-6 text-[20px] font-semibold text-db-text">Modifier {category.name}</h1>
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
          active: category.active,
        }}
      />
    </div>
  );
}
