"use client";

import { Check, Plus } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { ctaClass } from "@/components/brand/cta-button";
import { Sticker } from "@/components/brand/sticker";
import { useCart } from "@/components/shop/use-cart";
import { cn } from "@/lib/utils";

import bottle from "../../../public/bottle-photo.jpg";

/**
 * Pack selector. Prices are deliberately absent — Stripe is the source of truth
 * for the catalogue, and showing a price the repo believes in risks it drifting
 * out of sync with what the customer is actually charged.
 */
export function PackPicker({
  packs,
}: {
  packs: { bottles: number; labelKey: string }[];
}) {
  const t = useTranslations("checkout");
  const tPacks = useTranslations("packs");
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState<number | null>(null);

  function onAdd(bottles: number) {
    add(bottles);
    setJustAdded(bottles);
    window.setTimeout(() => {
      setJustAdded((current) => (current === bottles ? null : current));
    }, 1600);
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {packs.map((pack) => {
        const added = justAdded === pack.bottles;
        return (
          <li
            key={pack.bottles}
            className="border-ink/85 flex flex-col rounded-lg border-2 bg-white p-5 shadow-[5px_5px_0_rgba(0,0,0,0.35)]"
          >
            <Image
              src={bottle}
              alt=""
              sizes="20rem"
              placeholder="blur"
              className="border-ink/20 h-44 w-full rounded-md border object-cover"
            />

            <h3 className="text-h3 mt-5">{tPacks(pack.labelKey)}</h3>
            <p className="mt-1">
              <Sticker tone="cream" className="rotate-0 text-xs">
                {tPacks("bottles", { count: pack.bottles })}
              </Sticker>
            </p>

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
