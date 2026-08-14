"use client";

import { useEffect } from "react";

import { useCart } from "@/components/shop/use-cart";

/** Empties the basket once the order confirmation renders. */
export function ClearCartOnMount() {
  const { clear, ready } = useCart();

  useEffect(() => {
    if (ready) clear();
  }, [ready, clear]);

  return null;
}
