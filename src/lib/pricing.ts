import "server-only";

import { formatMoney } from "@/lib/format-money";
import {
  configuredPacks,
  getStripe,
  isStripeConfigured,
  priceIdForPack,
} from "@/lib/stripe";

/** A pack's price as Stripe holds it. Amounts are minor units (rappen). */
export type PackPrice = {
  bottles: number;
  amount: number;
  currency: string;
};

/**
 * Read the live pack prices from Stripe.
 *
 * Stripe is the single source of truth: the same Prices that Checkout charges are
 * the ones rendered on the page, so the two cannot drift. Prices that are missing
 * or inactive are simply omitted, and the UI falls back to "price to follow".
 *
 * Returns [] when Stripe is unconfigured or the lookup fails — a pricing call must
 * never take a page down.
 */
export async function getPackPrices(): Promise<PackPrice[]> {
  if (!isStripeConfigured()) return [];

  const packs = configuredPacks();
  if (packs.length === 0) return [];

  // allSettled, not all: one unusable Price ID must only remove its own pack.
  // With Promise.all, a single rejection wiped every price off the page.
  const settled = await Promise.allSettled(
    packs.map(async (pack): Promise<PackPrice | null> => {
      const id = priceIdForPack(pack.bottles)!;
      const price = await getStripe().prices.retrieve(id);

      // An inactive price is the important case: Checkout refuses it
      // ("The price specified is inactive"), so a pack backed by one must not be
      // offered at all rather than failing at the last step.
      if (!price.active) {
        console.warn(`[pricing] ${pack.stripePriceEnv} (${id}) is inactive — hiding the ${pack.bottles}-pack`);
        return null;
      }
      if (typeof price.unit_amount !== "number") {
        console.warn(`[pricing] ${pack.stripePriceEnv} (${id}) has no unit_amount — hiding the ${pack.bottles}-pack`);
        return null;
      }

      return {
        bottles: pack.bottles,
        amount: price.unit_amount,
        currency: price.currency.toUpperCase(),
      };
    }),
  );

  const prices: PackPrice[] = [];
  settled.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `[pricing] could not read ${packs[index].stripePriceEnv}:`,
        result.reason instanceof Error ? result.reason.message : result.reason,
      );
      return;
    }
    if (result.value) prices.push(result.value);
  });

  return prices.sort((a, b) => a.bottles - b.bottles);
}

/** The cheapest pack, formatted — for callers that already hold the prices. */
export function entryPriceFrom(prices: PackPrice[], locale: string): string | null {
  if (prices.length === 0) return null;
  const cheapest = prices.reduce((min, p) => (p.amount < min.amount ? p : min));
  return formatMoney(cheapest.amount, cheapest.currency, locale);
}

/**
 * The "from CHF x" figure on the hero and shop teaser — the cheapest pack.
 * Null when unknown, so callers omit the figure rather than inventing one.
 */
export async function getEntryPrice(locale: string): Promise<string | null> {
  return entryPriceFrom(await getPackPrices(), locale);
}
