import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { HeaderClient, type NavSeries } from "./HeaderClient";

export async function Header() {
  const [series, session] = await Promise.all([
    prisma.category.findMany({
      where: { active: true, parent: { slug: "smartphones" } },
      orderBy: { position: "asc" },
      select: { name: true, slug: true },
    }),
    getSession(),
  ]);

  return <HeaderClient series={series as NavSeries[]} session={session} />;
}
