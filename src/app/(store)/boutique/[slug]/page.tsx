import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Lock, ShieldCheck, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PhoneMock } from "@/components/ui/PhoneMock";
import { ProductStage } from "@/components/ui/ProductStage";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductDetailActions } from "@/components/store/ProductDetailActions";
import { Reveal } from "@/components/ui/Reveal";
import { formatFCFA } from "@/lib/format";

export const dynamic = "force-dynamic";

const guarantees = [
  { icon: Truck, label: "Livraison rapide" },
  { icon: ShieldCheck, label: "Garantie disponible" },
  { icon: BadgeCheck, label: "Produit authentique" },
  { icon: Lock, label: "Paiement sécurisé" },
];

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id } },
    take: 4,
    include: { category: true },
  });

  const specLines = product.specs.split("\n").filter(Boolean);
  const views: Array<"back" | "front"> = ["back", "front"];

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
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_440px] lg:gap-16">
          <div className="grid grid-cols-[88px_1fr] gap-4 lg:gap-5">
            <div className="hidden flex-col gap-4 sm:flex">
              {views.map((v) => (
                <ProductStage key={v} className="aspect-square rounded-xl" rounded="rounded-xl">
                  <PhoneMock color={product.color} variant={v} />
                </ProductStage>
              ))}
            </div>
            <ProductStage className="aspect-[4/5] rounded-[28px] sm:aspect-square lg:aspect-[4/5]">
              <div className="h-full w-[60%]">
                <PhoneMock color={product.color} variant="back" />
              </div>
            </ProductStage>
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <span className="text-eyebrow text-accent">{product.category.name}</span>
            <h1 className="text-h1 mt-3 text-ink" style={{ fontSize: "clamp(1.75rem, 1.2vw + 1.4rem, 2.5rem)" }}>
              {product.name}
            </h1>
            <p className="mt-2 text-[13px] text-slate">SKU {product.sku}</p>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="text-[26px] font-semibold text-ink">{formatFCFA(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-base text-slate line-through">{formatFCFA(product.compareAtPrice)}</span>
              )}
            </div>

            <p className="mt-5 text-[14.5px] leading-relaxed text-slate">{product.description}</p>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1.5 text-[13.5px] text-ink">
              {product.storage && (
                <span>
                  <span className="text-slate">Stockage </span>
                  <span className="font-medium">{product.storage}</span>
                </span>
              )}
              <span>
                <span className="text-slate">Disponibilité </span>
                <span className={product.stock > 0 ? "font-medium text-ink" : "font-medium text-sale"}>
                  {product.stock > 0 ? `En stock (${product.stock})` : "Rupture de stock"}
                </span>
              </span>
            </div>

            <div className="mt-8">
              <ProductDetailActions
                productId={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                color={product.color}
                storage={product.storage}
                stock={product.stock}
              />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-line py-6">
              {guarantees.map((g) => (
                <div key={g.label} className="flex items-center gap-2.5 text-[13px] text-ink">
                  <g.icon className="h-4 w-4 shrink-0 text-slate" strokeWidth={1.5} />
                  {g.label}
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="mb-4 text-[13px] font-semibold uppercase tracking-wide text-ink">
                Caractéristiques techniques
              </h2>
              <ul className="space-y-2.5 text-[13.5px] text-ink/80">
                {specLines.map((line) => {
                  const [label, ...rest] = line.split(":");
                  return (
                    <li key={line} className="flex justify-between gap-4 border-b border-line/70 pb-2.5">
                      <span className="text-slate">{label}</span>
                      <span className="text-right font-medium text-ink">{rest.join(":").trim()}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section-space-sm border-t border-line bg-paper">
          <div className="container-page">
            <Reveal>
              <h2 className="text-h2 text-ink">Produits similaires</h2>
            </Reveal>
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4 lg:gap-x-10">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    price: p.price,
                    compareAtPrice: p.compareAtPrice,
                    color: p.color,
                    storage: p.storage,
                    stock: p.stock,
                    categoryName: p.category.name,
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
