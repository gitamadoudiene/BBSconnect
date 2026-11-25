import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { HeaderClient } from "./HeaderClient";

export async function Header() {
  const [categories, session] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null, active: true },
      orderBy: { position: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        children: {
          where: { active: true },
          orderBy: { position: "asc" },
          select: { id: true, name: true, slug: true },
        },
      },
    }),
    getSession(),
  ]);

  return <HeaderClient categories={categories} session={session} />;
}
