import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireMerchant } from "@/lib/auth";
import { HERO_THEMES, MAX_IMAGES, TILE_THEMES, bannerImages } from "@/lib/content";
import { updateBannerAction } from "@/actions/banners";
import { BannerForm } from "@/components/dashboard/BannerForm";
import { PageHeader } from "@/components/dashboard/ui";

/** datetime-local value — Dakar is UTC+0 all year. */
function local(d: Date | null) {
  return d ? d.toISOString().slice(0, 16) : "";
}

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireMerchant();
  const { id } = await params;
  const b = await prisma.banner.findUnique({ where: { id } });
  if (!b) notFound();

  return (
    <div>
      <PageHeader
        back={{ href: "/dashboard/bannieres", label: "Retour aux bannières" }}
        eyebrow={b.placement === "HERO" ? "Grande bannière" : "Petite bannière"}
        title={b.title.replace("\n", " ")}
      />
      <BannerForm
        placement={b.placement}
        themes={b.placement === "HERO" ? HERO_THEMES : TILE_THEMES}
        maxImages={MAX_IMAGES[b.placement]}
        action={updateBannerAction.bind(null, b.id)}
        submitLabel="Enregistrer"
        defaults={{
          eyebrow: b.eyebrow,
          title: b.title,
          text: b.text,
          ctaLabel: b.ctaLabel,
          href: b.href,
          tag: b.tag,
          theme: b.theme,
          images: bannerImages(b.images),
          showPrice: b.showPrice,
          active: b.active,
          startsAt: local(b.startsAt),
          endsAt: local(b.endsAt),
        }}
      />
    </div>
  );
}
