import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids");
  if (!idsParam) return NextResponse.json({ products: [] });

  const ids = idsParam.split(",").filter(Boolean);
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: { category: true },
  });

  return NextResponse.json({ products });
}
