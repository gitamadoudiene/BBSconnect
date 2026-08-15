import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { accessoryImage } from "@/lib/images";
import { formatFCFA } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";

export async function AccessoriesSection() {
  const accessories = await prisma.product.findMany({
    where: { category: { slug: "accessoires" } },
    orderBy: { featured: "desc" },
    take: 4,
  });

  if (accessories.length === 0) return null;

  return (
    <section className="section-space-sm bg-white">
      <div className="container-page">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-eyebrow text-slate">Accessoires</p>
            <h2 className="text-h2 mt-4 text-ink">Complétez votre expérience</h2>
          </div>
          <Link href="/boutique?categorie=accessoires" className="link-underline hidden text-sm font-semibold text-ink sm:flex items-center gap-1.5">
            Voir tous les accessoires <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>

        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {accessories.map((item, i) => (
            <Reveal key={item.id} delay={i * 80}>
              <Link href={`/boutique/${item.slug}`} className="hover-zoom group block">
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-mist">
                  <Image
                    src={accessoryImage(item.sku)}
                    alt={item.name}
                    fill
                    sizes="(min-width: 1024px) 22vw, 45vw"
                    className="zoom-target object-cover"
                  />
                </div>
                <h3 className="mt-3 line-clamp-1 text-[14px] font-semibold text-ink">{item.name}</h3>
                <p className="text-[13.5px] text-slate">{formatFCFA(item.price)}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
