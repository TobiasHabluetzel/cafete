"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { CartView } from "@/components/shop/cart-view";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { PackPrice } from "@/lib/pricing";

const OPEN_EVENT = "cafete:open-cart";

/** Opens the drawer from anywhere: the cart icon, or a pack just added. */
export function openCartDrawer() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

/**
 * The cart as a panel over the current page, so adding something does not throw
 * the visitor out of what they were looking at. /warenkorb stays as the full page.
 *
 * Prices load when it first opens: the layout is shared by static pages, which
 * should not have to ask Stripe for prices nobody may ever need.
 */
export function CartDrawer() {
  const t = useTranslations("cart");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [prices, setPrices] = useState<PackPrice[] | null>(null);

  useEffect(() => {
    const show = () => {
      setOpen(true);
      fetch("/api/prices")
        .then((response) => (response.ok ? response.json() : { prices: [] }))
        .then((data: { prices: PackPrice[] }) => setPrices(data.prices))
        .catch(() => setPrices([]));
    };
    window.addEventListener(OPEN_EVENT, show);
    return () => window.removeEventListener(OPEN_EVENT, show);
  }, []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="bg-cream text-charcoal w-[92vw] sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-charcoal text-3xl font-extrabold">
            {t("title")}
          </SheetTitle>
        </SheetHeader>
        {/* Any link inside leaves the page, so the panel should not stay open over the next one. */}
        <div
          data-lenis-prevent
          className="flex-1 overflow-y-auto px-4 pb-8"
          onClickCapture={(event) => {
            if ((event.target as HTMLElement).closest("a")) setOpen(false);
          }}
        >
          {prices ? (
            <CartView prices={prices} compact />
          ) : (
            <p className="text-charcoal/60">{tCommon("loading")}</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
