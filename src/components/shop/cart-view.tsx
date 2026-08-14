"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { ctaClass } from "@/components/brand/cta-button";
import { MAX_QUANTITY, useCart } from "@/components/shop/use-cart";
import { packSizes, site } from "@/config/site";
import { Link } from "@/i18n/navigation";

export function CartView() {
  const t = useTranslations("checkout");
  const tCart = useTranslations("cart");
  const tPacks = useTranslations("packs");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { lines, ready, totalBottles, setQuantity, remove } = useCart();
  const [status, setStatus] = useState<"idle" | "redirecting" | "error" | "unavailable">(
    "idle",
  );

  const labelFor = (bottles: number) => {
    const pack = packSizes.find((p) => p.bottles === bottles);
    return pack ? tPacks(pack.labelKey) : tPacks("bottles", { count: bottles });
  };

  async function checkout() {
    setStatus("redirecting");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: lines, locale }),
      });

      if (response.status === 503) {
        setStatus("unavailable");
        return;
      }
      const data = (await response.json()) as { url?: string };
      if (!response.ok || !data.url) {
        setStatus("error");
        return;
      }
      // Full navigation, not a router push — Stripe Checkout is off-origin.
      window.location.href = data.url;
    } catch {
      setStatus("error");
    }
  }

  // Render nothing cart-specific until localStorage has been read, so the
  // markup matches what the server sent.
  if (!ready) {
    return <p className="text-charcoal/60">{tCommon("loading")}</p>;
  }

  if (lines.length === 0) {
    return (
      <div>
        <p className="text-charcoal/80 max-w-prose text-lg leading-relaxed">
          {tCart("empty")}
        </p>
        <Link href="/shop" className={ctaClass({ size: "lg", className: "mt-8" })}>
          {tCart("continue")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <ul className="border-charcoal/15 divide-charcoal/10 divide-y border-y">
        {lines.map((line) => (
          <li
            key={line.bottles}
            className="flex flex-wrap items-center gap-4 py-5 sm:flex-nowrap"
          >
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-extrabold">
                {labelFor(line.bottles)}
              </p>
              <p className="text-charcoal/60 text-sm">
                {tPacks("bottles", { count: line.bottles * line.quantity })}
              </p>
            </div>

            <div className="border-charcoal/20 flex items-center rounded-full border">
              <button
                type="button"
                onClick={() => setQuantity(line.bottles, line.quantity - 1)}
                aria-label={`${t("quantity")} −`}
                className="hover:bg-charcoal/5 cursor-pointer rounded-l-full p-2.5"
              >
                <Minus className="size-4" aria-hidden />
              </button>
              <span
                className="w-10 text-center font-semibold tabular-nums"
                aria-label={t("quantity")}
              >
                {line.quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(line.bottles, line.quantity + 1)}
                disabled={line.quantity >= MAX_QUANTITY}
                aria-label={`${t("quantity")} +`}
                className="hover:bg-charcoal/5 cursor-pointer rounded-r-full p-2.5 disabled:opacity-40"
              >
                <Plus className="size-4" aria-hidden />
              </button>
            </div>

            <button
              type="button"
              onClick={() => remove(line.bottles)}
              aria-label={t("remove")}
              className="text-charcoal/50 hover:text-cherry-deep cursor-pointer p-2"
            >
              <Trash2 className="size-5" aria-hidden />
            </button>
          </li>
        ))}
      </ul>

      <p className="font-display mt-6 text-lg font-extrabold">
        {t("bottlesTotal", { count: totalBottles })}
      </p>
      <p className="text-charcoal/60 mt-1 text-sm">{t("lineTotalNote")}</p>

      <button
        type="button"
        onClick={checkout}
        disabled={status === "redirecting"}
        className={ctaClass({ size: "lg", className: "mt-8" })}
      >
        {status === "redirecting" ? t("redirecting") : t("goToCheckout")}
      </button>

      <p className="text-charcoal/55 mt-3 text-sm">{t("securePayment")}</p>

      {status === "unavailable" ? (
        <p role="status" className="text-charcoal/80 mt-4 max-w-prose text-sm">
          {t("notConfigured")}
        </p>
      ) : null}
      {status === "error" ? (
        <p role="alert" className="text-cherry-deep mt-4 max-w-prose text-sm">
          {t("error", { email: site.email })}
        </p>
      ) : null}
    </div>
  );
}
