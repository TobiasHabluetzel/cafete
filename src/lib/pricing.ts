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

  try {
    // Annotated because `packSizes` is `as const`, so `pack.bottles` is the
    // literal union 6 | 12 | 24 and would not widen to PackPrice on its own.
    const results: (PackPrice | null)[] = await Promise.all(
      packs.map(async (pack) => {
        const price = await getStripe().prices.retrieve(priceIdForPack(pack.bottles)!);
        if (!price.active || typeof price.unit_amount !== "number") return null;
        return {
          bottles: pack.bottles,
          amount: price.unit_amount,
          currency: price.currency.toUpperCase(),
        };
      }),
    );

    return results
      .filter((price): price is PackPrice => price !== null)
      .sort((a, b) => a.bottles - b.bottles);
  } catch (error) {
    console.error("[pricing] could not read pack prices from Stripe:", error);
    return [];
  }
}

/**
 * The "from CHF x" figure on the hero and shop teaser — the cheapest pack.
 * Null when unknown, so callers omit the figure rather than inventing one.
 */
export async function getEntryPrice(locale: string): Promise<string | null> {
  const prices = await getPackPrices();
  if (prices.length === 0) return null;

  const cheapest = prices.reduce((min, p) => (p.amount < min.amount ? p : min));
  return formatMoney(cheapest.amount, cheapest.currency, locale);
}
