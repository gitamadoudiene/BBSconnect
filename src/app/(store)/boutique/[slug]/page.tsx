import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { productWithVariantsInclude, toProductCardData } from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductDetailView } from "@/components/store/ProductDetailView";
import { Reveal } from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: productWithVariantsInclude,
  });

  if (!product || product.variants.length === 0) notFound();

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    take: 4,
    include: productWithVariantsInclude,
  });

  return (
    <div>
      <div className="container-page pt-8">
        <nav className="text-[13px] text-slate">
          <Link href="/" className="link-underline">Accueil</Link>
          <span className="mx-2">/</span>
          <Link href={`/boutique?categorie=${product.category.slug}`} className="link-underline">
            {product.category.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>
      </div>

      <div className="container-page py-8 lg:py-12">
        <ProductDetailView product={product} />
      </div>

      {related.length > 0 && (
        <section className="section-space-sm border-t border-line bg-paper">
          <div className="container-page">
            <Reveal>
              <h2 className="text-h2 text-ink">Produits similaires</h2>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4 lg:gap-x-10">
              {related.map((p) => (
                <ProductCard key={p.id} product={toProductCardData(p)} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
