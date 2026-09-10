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

import bottle from "../../../public/bottle-transparent.png";
import pack6 from "../../../public/pack-6.png";
import pack12 from "../../../public/pack-12.png";
import pack24 from "../../../public/pack-24.png";

/**
 * The actual pack quantities, as the owner asked — a 6-pack card now shows six
 * bottles rather than one. Falls back to the single transparent packshot for any
 * pack size that has no photograph yet.
 */
const PACK_IMAGES: Record<number, typeof bottle> = {
  6: pack6,
  12: pack12,
  24: pack24,
};

/**
 * Pack selector. Prices come from Stripe via props — the same Prices Checkout
 * charges — so what is advertised and what is billed cannot drift apart.
 */
export function PackPicker({
  packs,
  prices,
}: {
  packs: { bottles: number; labelKey: string; badge?: "bestseller" }[];
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

  /*
   * The cheapest per-bottle pack gets called out — the number that actually
   * helps someone choose between 6, 12 and 24.
   *
   * This deliberately considers every priced pack, including coming-soon ones.
   * It was briefly restricted to buyable packs on the theory that badging an
   * unavailable pack is a tease, but with the whole shop pre-launch that removed
   * the badge entirely. While nothing is buyable the badge is pure price
   * information, which is what the owner wanted back.
   */
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
            ) : pack.badge === "bestseller" ? (
              <Sticker
                tone="gold"
                className="absolute -top-3 right-4 -rotate-2 text-xs"
              >
                {t("bestseller")}
              </Sticker>
            ) : null}

            {/* The pack shots are landscape while the single bottle is tall, so
                the box is fixed and the image is contained rather than sized by
                height — otherwise a 6-bottle group would run off the card. */}
            <div className="flex h-52 items-center justify-center">
              <Image
                src={PACK_IMAGES[pack.bottles] ?? bottle}
                alt={tPacks("imageAlt", { pack: tPacks(pack.labelKey) })}
                sizes="(max-width: 1024px) 80vw, 20rem"
                placeholder="blur"
                className="max-h-full w-auto max-w-full object-contain drop-shadow-[0_10px_24px_rgba(20,16,14,0.25)]"
              />
            </div>

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
                  {/* Sits directly under the price rather than in the small print
                      below the grid, which is where it used to live. */}
                  <p className="mt-2">
                    <Sticker tone="cream" className="rotate-0 text-xs">
                      {t("shippingIncluded")}
                    </Sticker>
                  </p>
                </>
              ) : (
                <p className="label-caps text-sunset-ink">{t("priceTbd")}</p>
              )}
            </div>

            {price?.comingSoon ? (
              <p
                className={cn(
                  ctaClass({ variant: "outline", size: "md" }),
                  "text-charcoal/70 mt-5 w-full cursor-default border-charcoal/30",
                )}
              >
                {t("comingSoon")}
              </p>
            ) : (
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
            )}
          </li>
        );
      })}
    </ul>
  );
}
