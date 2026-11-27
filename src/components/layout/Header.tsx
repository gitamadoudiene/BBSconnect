import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getAnnouncement } from "@/lib/content";
import { HeaderClient, type NavSeries } from "./HeaderClient";

export async function Header() {
  const [series, session, announcement] = await Promise.all([
    prisma.category.findMany({
      where: { active: true, parent: { slug: "smartphones" } },
      orderBy: { position: "asc" },
      select: { name: true, slug: true },
    }),
    getSession(),
    getAnnouncement(),
  ]);

  return <HeaderClient series={series as NavSeries[]} session={session} announcement={announcement} />;
}
