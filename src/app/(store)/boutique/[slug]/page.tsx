import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { productWithVariantsInclude, storefrontFilter, toProductCardData } from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductDetailView } from "@/components/store/ProductDetailView";
import { SectionHeading } from "@/components/home/Sections";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { AND: [{ slug }, storefrontFilter] },
    include: productWithVariantsInclude,
  });

  if (!product || product.variants.length === 0) notFound();

  const related = await prisma.product.findMany({
    where: { AND: [{ categoryId: product.categoryId, id: { not: product.id } }, storefrontFilter], variants: { some: {} } },
    take: 4,
    include: productWithVariantsInclude,
  });

  return (
    <div>
      <div className="container-page pt-6 lg:pt-8">
        <nav aria-label="Fil d’Ariane" className="font-mono text-[11.5px] text-slate">
          <Link href="/" className="hover:text-ink">Accueil</Link>
          <span className="mx-2">/</span>
          <Link href={`/boutique?categorie=${product.category.slug}`} className="hover:text-ink">
            {product.category.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>
      </div>

      <div className="container-page py-6 lg:py-10">
        <ProductDetailView product={product} />
      </div>

      {related.length > 0 && (
        <section className="section-space-sm bg-paper">
          <div className="container-page">
            <SectionHeading index="+" label="Même gamme" title="À comparer aussi." />
            <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 lg:gap-x-6">
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
