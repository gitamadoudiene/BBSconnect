import { requireMerchant } from "@/lib/auth";
import { BUILT_IN_MEDIA, listUploadedMedia, mediaUsage } from "@/lib/media";
import { MediaLibrary } from "@/components/dashboard/MediaLibrary";
import { Notice, PageHeader } from "@/components/dashboard/ui";

export const dynamic = "force-dynamic";

export default async function MediasPage() {
  await requireMerchant();
  const [{ items: uploaded, warning }, usage] = await Promise.all([listUploadedMedia(), mediaUsage()]);
  const items = [...uploaded, ...BUILT_IN_MEDIA];
  const unused = uploaded.filter((m) => !usage.has(m.url)).length;

  return (
    <div>
      <PageHeader
        eyebrow="Boutique"
        title="Médias"
        description={`${uploaded.length} image${uploaded.length > 1 ? "s" : ""} importée${uploaded.length > 1 ? "s" : ""}${unused ? ` · ${unused} non utilisée${unused > 1 ? "s" : ""}` : ""} · photos produits, bannières et catégories.`}
      />
      {warning && <Notice tone="danger">{warning}</Notice>}
      <MediaLibrary items={items} usage={Object.fromEntries(usage)} />
    </div>
  );
}
