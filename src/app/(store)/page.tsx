import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { productWithVariantsInclude, toProductCardData } from "@/lib/catalog";
import { ProductCard } from "@/components/store/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { Hero } from "@/components/marketing/Hero";
import { ShopByConditionSection } from "@/components/marketing/ShopByConditionSection";
import { TrustBar } from "@/components/marketing/TrustBar";
import { CollectionsSection } from "@/components/marketing/CollectionsSection";
import { ProBanner } from "@/components/marketing/ProBanner";
import { WhyUs } from "@/components/marketing/WhyUs";
import { NeedsSection } from "@/components/marketing/NeedsSection";
import { ComparisonSection } from "@/components/marketing/ComparisonSection";
import { OfferSection } from "@/components/marketing/OfferSection";
import { AccessoriesSection } from "@/components/marketing/AccessoriesSection";
import { LifestyleGrid } from "@/components/marketing/LifestyleGrid";
import { Newsletter } from "@/components/marketing/Newsletter";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const featured = await prisma.product.findMany({
    where: { featured: true },
    include: productWithVariantsInclude,
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  return (
    <div>
      <Hero />
      <ShopByConditionSection />
      <TrustBar />
      <CollectionsSection />

      <section className="section-space bg-white">
        <div className="container-page">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-eyebrow text-slate">Sélection</p>
              <h2 className="text-h2 mt-4 text-ink">Produits vedettes</h2>
            </div>
            <Link href="/boutique" className="link-underline hidden items-center gap-1.5 text-sm font-semibold text-ink sm:flex">
              Voir tout <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-10">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <ProductCard product={toProductCardData(p)} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <ProBanner />
      <WhyUs />
      <NeedsSection />
      <ComparisonSection />
      <OfferSection />
      <AccessoriesSection />
      <LifestyleGrid />
      <Newsletter />
    </div>
  );
}
