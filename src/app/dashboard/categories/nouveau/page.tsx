import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/dashboard/CategoryForm";
import { createCategoryAction } from "@/actions/categories";

export default async function NewCategoryPage() {
  const parents = await prisma.category.findMany({ where: { parentId: null }, orderBy: { position: "asc" } });

  return (
    <div>
      <Link href="/dashboard/categories" className="mb-4 inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline">
        <ArrowLeft className="h-4 w-4" /> Retour aux catégories
      </Link>
      <h1 className="mb-6 text-[20px] font-semibold text-db-text">Nouvelle catégorie</h1>
      <CategoryForm action={createCategoryAction} parentOptions={parents} submitLabel="Créer la catégorie" />
    </div>
  );
}
