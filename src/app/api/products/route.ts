import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productWithVariantsInclude, publishedFilter, toProductCardData } from "@/lib/catalog";

export async function GET(request: NextRequest) {
  const idsParam = request.nextUrl.searchParams.get("ids");
  if (!idsParam) return NextResponse.json({ products: [] });

  const ids = idsParam.split(",").filter(Boolean);
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, ...publishedFilter },
    include: productWithVariantsInclude,
  });

  return NextResponse.json({ products: products.map(toProductCardData) });
}
