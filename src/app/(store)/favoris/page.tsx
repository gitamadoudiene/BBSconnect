"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { ProductCard, type ProductCardData } from "@/components/store/ProductCard";
import { useWishlistStore } from "@/store/wishlist";

export default function FavoritesPage() {
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const productIds = useWishlistStore((s) => s.productIds);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (productIds.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/products?ids=${productIds.join(",")}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products))
      .finally(() => setLoading(false));
  }, [mounted, productIds]);

  if (!mounted || loading) return null;

  if (products.length === 0) {
    return (
      <div className="container-page flex flex-col items-center justify-center py-24 text-center">
        <Heart className="mb-4 h-14 w-14 text-slate/40" strokeWidth={1.25} />
        <h1 className="text-h3 text-ink">Aucun favori pour le moment</h1>
        <p className="mt-2 text-sm text-slate">
          Cliquez sur le cœur d&apos;un produit pour l&apos;ajouter à votre liste d&apos;envies.
        </p>
        <Link href="/boutique" className="btn btn-primary mt-6">
          Voir la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10 lg:py-14">
      <h1 className="text-h1 mb-8 text-ink">Ma liste d&apos;envies</h1>
      <div className="grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-3 xl:grid-cols-4 lg:gap-x-10">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
