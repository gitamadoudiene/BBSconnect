import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireMerchant } from "@/lib/auth";
import { pickableProducts } from "@/lib/pickable";
import { updateCollectionAction } from "@/actions/collections";
import { CollectionForm } from "@/components/dashboard/CollectionForm";
import { PageHeader } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function EditCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireMerchant();
  const { id } = await params;
  const [collection, products] = await Promise.all([
    prisma.collection.findUnique({
      where: { id },
      include: { products: { orderBy: { position: "asc" }, select: { productId: true } } },
    }),
    pickableProducts(),
  ]);
  if (!collection) notFound();

  return (
    <div>
      <PageHeader back={{ href: "/dashboard/collections", label: "Retour aux collections" }} eyebrow="Collection" title={collection.name} />
      <CollectionForm
        products={products}
        action={updateCollectionAction.bind(null, collection.id)}
        submitLabel="Enregistrer"
        defaults={{
          name: collection.name,
          slug: collection.slug,
          description: collection.description,
          active: collection.active,
          onHome: collection.onHome,
          productIds: collection.products.map((p) => p.productId),
        }}
      />
    </div>
  );
}
