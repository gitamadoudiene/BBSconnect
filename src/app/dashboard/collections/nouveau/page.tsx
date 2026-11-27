import { requireMerchant } from "@/lib/auth";
import { pickableProducts } from "@/lib/pickable";
import { createCollectionAction } from "@/actions/collections";
import { CollectionForm } from "@/components/dashboard/CollectionForm";
import { PageHeader } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function NewCollectionPage() {
  await requireMerchant();
  const products = await pickableProducts();
  return (
    <div>
      <PageHeader back={{ href: "/dashboard/collections", label: "Retour aux collections" }} eyebrow="Catalogue" title="Nouvelle collection" />
      <CollectionForm products={products} action={createCollectionAction} submitLabel="Créer la collection" />
    </div>
  );
}
