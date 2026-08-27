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

            {/* The bottle sits straight on the card. It was inside a bordered
                cream block, which at this aspect ratio left a thin bottle
                swimming in empty space — removing the block and going taller
                gives it the room the owner asked for. */}
            <div className="flex h-64 items-center justify-center">
              <Image
                src={bottle}
                alt=""
                sizes="14rem"
                placeholder="blur"
                className="h-full w-auto drop-shadow-[0_10px_24px_rgba(20,16,14,0.25)]"
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
