import { prisma } from "@/lib/prisma";
import { requireMerchant } from "@/lib/auth";
import { pickableProducts } from "@/lib/pickable";
import { PromotionForm } from "@/components/dashboard/PromotionForm";
import { PageHeader } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function NewPromotionPage() {
  await requireMerchant();
  const [products, brandRows, categories] = await Promise.all([
    pickableProducts(),
    prisma.product.findMany({ distinct: ["brand"], select: { brand: true }, orderBy: { brand: "asc" } }),
    prisma.category.findMany({ orderBy: { position: "asc" }, select: { id: true, name: true, parent: { select: { name: true } } } }),
  ]);

  return (
    <div>
      <PageHeader back={{ href: "/dashboard/promotions", label: "Retour aux promotions" }} eyebrow="Promotions" title="Nouvelle promotion" />
      <PromotionForm
        products={products}
        brands={brandRows.map((b) => b.brand)}
        categories={categories.map((c) => ({ id: c.id, name: c.name, parent: c.parent?.name ?? null }))}
      />
    </div>
  );
}
