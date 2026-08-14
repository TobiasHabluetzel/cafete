import "server-only";

import { configuredPacks, getStripe, isStripeConfigured, priceIdForPack } from "@/lib/stripe";

/**
 * The "from CHF x" figure shown on the hero and shop teaser, read from Stripe.
 *
 * This used to be a hardcoded string in the message catalogues, which drifted the
 * moment real prices existed — the site advertised CHF 24.90 while the 6-pack was
 * actually 24.50. Deriving it from the same Prices that Checkout charges makes
 * that impossible.
 *
 * Returns null when Stripe is not configured or the lookup fails; callers then
 * render their CTA without a price rather than inventing one.
 */
export async function getEntryPrice(locale: string): Promise<string | null> {
  if (!isStripeConfigured()) return null;

  const packs = configuredPacks();
  if (packs.length === 0) return null;

  try {
    const prices = await Promise.all(
      packs.map((pack) => getStripe().prices.retrieve(priceIdForPack(pack.bottles)!)),
    );

    const amounts = prices
      .filter((price) => price.active && typeof price.unit_amount === "number")
      .map((price) => ({
        amount: price.unit_amount as number,
        currency: price.currency.toUpperCase(),
      }));

    if (amounts.length === 0) return null;

    const cheapest = amounts.reduce((min, p) => (p.amount < min.amount ? p : min));

    return new Intl.NumberFormat(locale === "en" ? "en-CH" : "de-CH", {
      style: "currency",
      currency: cheapest.currency,
    }).format(cheapest.amount / 100);
  } catch (error) {
    // A pricing lookup must never take the homepage down.
    console.error("[pricing] could not read entry price from Stripe:", error);
    return null;
  }
}
