import { prisma } from "@/lib/prisma";
import type { PickableProduct } from "@/components/dashboard/CollectionForm";

/** Light product list for the dashboard pickers (collections, promotions). */
export async function pickableProducts(): Promise<PickableProduct[]> {
  const products = await prisma.product.findMany({
    orderBy: [{ brand: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      brand: true,
      status: true,
      category: { select: { name: true } },
      variants: {
        orderBy: { position: "asc" },
        select: { price: true, images: { orderBy: { position: "asc" }, take: 1, select: { url: true } } },
      },
    },
  });
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    status: p.status,
    category: p.category.name,
    price: p.variants.length ? Math.min(...p.variants.map((v) => v.price)) : null,
    image: p.variants.find((v) => v.images[0])?.images[0]?.url ?? null,
  }));
}
