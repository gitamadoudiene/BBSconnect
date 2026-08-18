import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { productWithVariantsInclude, publishedFilter, fromPrice } from "@/lib/catalog";
import { formatFCFA } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowLink } from "@/components/ui/ArrowLink";

function specValue(specs: string, label: string) {
  const line = specs.split("\n").find((l) => l.trim().startsWith(label));
  return line ? line.split(":").slice(1).join(":").trim() : "";
}

export async function ComparisonSection() {
  const slugs = ["iphone-17", "iphone-air", "iphone-17-pro", "iphone-17-pro-max"];
  const products = await prisma.product.findMany({
    where: { slug: { in: slugs }, ...publishedFilter },
    include: productWithVariantsInclude,
  });

  const ordered = slugs.map((s) => products.find((p) => p.slug === s)).filter(Boolean) as typeof products;
  if (ordered.length === 0) return null;

  return (
    <section className="section-space-sm border-t border-line bg-white">
      <div className="container-page">
        <Reveal className="max-w-lg">
          <p className="text-eyebrow text-slate">Comparatif</p>
          <h2 className="text-h2 mt-4 text-ink">Quel iPhone est fait pour vous ?</h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ordered.map((p, i) => {
            const variant = p.variants[0];
            const primaryImage = variant?.images.find((im) => im.type === "PRIMARY")?.url ?? variant?.images[0]?.url;
            const storages = Array.from(new Set(p.variants.map((v) => v.storage).filter(Boolean)));

            return (
              <Reveal key={p.id} delay={i * 90}>
                <div className="flex h-full flex-col rounded-2xl border border-line p-5">
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-mist">
                    {primaryImage && (
                      <Image src={primaryImage} alt={p.name} fill sizes="(min-width: 1024px) 22vw, 45vw" className="object-cover" />
                    )}
                  </div>
                  <h3 className="mt-4 text-[15px] font-semibold text-ink">{p.name}</h3>
                  <p className="mt-1 text-[15px] font-semibold text-ink">
                    dès {formatFCFA(fromPrice(p))}
                  </p>

                  <dl className="mt-4 space-y-2 border-t border-line pt-4 text-[12.5px]">
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate">Écran</dt>
                      <dd className="text-right font-medium text-ink">{specValue(p.specs, "Écran")}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-slate">Appareil photo</dt>
                      <dd className="text-right font-medium text-ink">{specValue(p.specs, "Appareil photo")}</dd>
                    </div>
                    {storages.length > 0 && (
                      <div className="flex justify-between gap-2">
                        <dt className="text-slate">Stockage</dt>
                        <dd className="text-right font-medium text-ink">{storages.join(" · ")}</dd>
                      </div>
                    )}
                  </dl>

                  <ArrowLink href={`/boutique/${p.slug}`} className="mt-5 text-ink">
                    Découvrir
                  </ArrowLink>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
