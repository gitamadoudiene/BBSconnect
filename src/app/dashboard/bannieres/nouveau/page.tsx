import { requireMerchant } from "@/lib/auth";
import { HERO_THEMES, MAX_IMAGES, TILE_THEMES } from "@/lib/content";
import { createBannerAction } from "@/actions/banners";
import { BannerForm } from "@/components/dashboard/BannerForm";
import { PageHeader } from "@/components/dashboard/ui";

export default async function NewBannerPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  await requireMerchant();
  const placement = (await searchParams).type === "TILE" ? "TILE" : "HERO";
  return (
    <div>
      <PageHeader
        back={{ href: "/dashboard/bannieres", label: "Retour aux bannières" }}
        eyebrow="Bannières"
        title={placement === "HERO" ? "Nouvelle diapositive" : "Nouvelle petite bannière"}
      />
      <BannerForm
        placement={placement}
        themes={placement === "HERO" ? HERO_THEMES : TILE_THEMES}
        maxImages={MAX_IMAGES[placement]}
        action={createBannerAction}
        submitLabel="Créer la bannière"
      />
    </div>
  );
}
