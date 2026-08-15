import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/dashboard/ProductForm";
import { createProductAction } from "@/actions/products";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <Link href="/dashboard/produits" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-brand-blue hover:underline">
        <ArrowLeft className="h-4 w-4" /> Retour aux produits
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-brand-navy">Nouveau produit</h1>

      <ProductForm categories={categories} action={createProductAction} submitLabel="Créer le produit" />
    </div>
  );
}
