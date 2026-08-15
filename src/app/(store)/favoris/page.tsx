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
      .then((data) => {
        setProducts(
          data.products.map((p: ProductCardData & { category: { name: string } }) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price,
            compareAtPrice: p.compareAtPrice,
            color: p.color,
            storage: p.storage,
            stock: p.stock,
            categoryName: p.category.name,
          }))
        );
      })
      .finally(() => setLoading(false));
  }, [mounted, productIds]);

  if (!mounted || loading) return null;

  if (products.length === 0) {
    return (
      <div className="container-page flex flex-col items-center justify-center py-24 text-center">
        <Heart className="mb-4 h-14 w-14 text-brand-navy/20" />
        <h1 className="text-xl font-bold text-brand-navy">Aucun favori pour le moment</h1>
        <p className="mt-2 text-sm text-brand-navy/60">
          Cliquez sur le cœur d&apos;un produit pour l&apos;ajouter à votre liste d&apos;envies.
        </p>
        <Link
          href="/boutique"
          className="mt-6 rounded-md bg-brand-blue px-6 py-3 text-sm font-semibold text-white hover:bg-brand-blue-dark"
        >
          Voir la boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="mb-6 text-2xl font-bold text-brand-navy">Ma liste d&apos;envies</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
