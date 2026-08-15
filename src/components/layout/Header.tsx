import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { HeaderClient } from "./HeaderClient";

export async function Header() {
  const [categories, session] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    getSession(),
  ]);

  return <HeaderClient categories={categories} session={session} />;
}
