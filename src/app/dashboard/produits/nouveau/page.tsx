import { PageHeader } from "@/components/dashboard/ui";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/dashboard/ProductForm";
import { createProductAction } from "@/actions/products";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { position: "asc" } });

  return (
    <div>
      <PageHeader
        back={{ href: "/dashboard/produits", label: "Retour aux produits" }}
        eyebrow="Catalogue"
        title="Nouveau produit"
        description="Un modèle, ses coloris et ses capacités : chaque variante a son prix et son stock."
      />

      <ProductForm categories={categories} action={createProductAction} submitLabel="Créer le produit" />
    </div>
  );
}
