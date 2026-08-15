"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";

export function CartCount() {
  const [mounted, setMounted] = useState(false);
  const count = useCartStore((s) => s.totalItems());

  useEffect(() => setMounted(true), []);

  return <>{mounted ? count : 0}</>;
}

export function WishlistCount() {
  const [mounted, setMounted] = useState(false);
  const count = useWishlistStore((s) => s.productIds.length);

  useEffect(() => setMounted(true), []);

  return <>{mounted ? count : 0}</>;
}
