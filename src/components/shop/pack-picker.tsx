"use client";

import { Check, Plus } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { ctaClass } from "@/components/brand/cta-button";
import { Sticker } from "@/components/brand/sticker";
import { useCart } from "@/components/shop/use-cart";
import type { PackPrice } from "@/lib/pricing";
import { formatMoney } from "@/lib/format-money";
import { cn } from "@/lib/utils";

import bottle from "../../../public/bottle-photo.jpg";

/**
 * Pack selector. Prices come from Stripe via props — the same Prices Checkout
 * charges — so what is advertised and what is billed cannot drift apart.
 */
export function PackPicker({
  packs,
  prices,
}: {
  packs: { bottles: number; labelKey: string }[];
  prices: PackPrice[];
}) {
  const t = useTranslations("checkout");
  const tPacks = useTranslations("packs");
  const locale = useLocale();
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState<number | null>(null);

  function onAdd(bottles: number) {
    add(bottles);
    setJustAdded(bottles);
    window.setTimeout(() => {
      setJustAdded((current) => (current === bottles ? null : current));
    }, 1600);
  }

  // The cheapest per-bottle pack gets called out, which is the number that
  // actually helps someone choose between 6, 12 and 24.
  const perBottle = (price: PackPrice) => price.amount / price.bottles;
  const bestValue =
    prices.length > 1
      ? prices.reduce((min, p) => (perBottle(p) < perBottle(min) ? p : min)).bottles
      : null;

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {packs.map((pack) => {
        const added = justAdded === pack.bottles;
        const price = prices.find((p) => p.bottles === pack.bottles);

        return (
          <li
            key={pack.bottles}
            className="border-ink/85 relative flex flex-col rounded-lg border-2 bg-white p-5 shadow-[5px_5px_0_rgba(0,0,0,0.35)]"
          >
            {price && pack.bottles === bestValue ? (
              <Sticker
                tone="cherry"
                className="absolute -top-3 right-4 rotate-2 text-xs"
              >
                {t("bestValue")}
              </Sticker>
            ) : null}

            <Image
              src={bottle}
              alt=""
              sizes="20rem"
              placeholder="blur"
              className="border-ink/20 h-44 w-full rounded-md border object-cover"
            />

            <h3 className="text-h3 mt-5">{tPacks(pack.labelKey)}</h3>
            <p className="text-charcoal/60 mt-1 text-sm">
              {tPacks("bottles", { count: pack.bottles })}
            </p>

            <div className="mt-4">
              {price ? (
                <>
                  <p className="font-display text-charcoal text-2xl font-extrabold tabular-nums">
                    {formatMoney(price.amount, price.currency, locale)}
                  </p>
                  <p className="text-charcoal/60 mt-0.5 text-sm tabular-nums">
                    {t("perBottle", {
                      price: formatMoney(perBottle(price), price.currency, locale),
                    })}
                  </p>
                </>
              ) : (
                <p className="label-caps text-sunset-ink">{t("priceTbd")}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => onAdd(pack.bottles)}
              aria-live="polite"
              className={cn(
                ctaClass({ variant: added ? "dark" : "solid", size: "md" }),
                "mt-5 w-full",
              )}
            >
              {added ? (
                <>
                  <Check className="size-5" aria-hidden />
                  {t("added")}
                </>
              ) : (
                <>
                  <Plus className="size-5" aria-hidden />
                  {t("addToCart")}
                </>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
