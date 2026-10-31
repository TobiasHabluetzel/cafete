import { createHash } from "node:crypto";

import type Stripe from "stripe";

import { site } from "@/config/site";

/**
 * Meta Conversions API — the server-side half of the Purchase event.
 *
 * Browsers with ad blockers or strict tracking protection never load the pixel,
 * so a Reel that sells would look as if it did not. Reporting the purchase from
 * the Stripe webhook as well closes that gap; Meta matches the two by `event_id`
 * (the Checkout Session ID, also used by the order page) and counts it once.
 *
 * Needs both `NEXT_PUBLIC_META_PIXEL_ID` and `META_CAPI_TOKEN` (Events Manager →
 * Settings → Conversions API → Generate access token). Without them this does
 * nothing. Personal data is only ever sent SHA-256 hashed, as Meta requires.
 */
const GRAPH_VERSION = "v21.0";

function sha256(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export async function sendPurchaseToMeta(session: Stripe.Checkout.Session) {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_TOKEN;
  if (!pixelId || !token || session.payment_status !== "paid") return;

  const email = session.customer_details?.email;
  const address = session.customer_details?.address;
  const fbclid = session.metadata?.fbclid;

  const userData: Record<string, unknown> = {
    ...(email ? { em: [sha256(email)] } : {}),
    ...(address?.postal_code ? { zp: [sha256(address.postal_code)] } : {}),
    ...(address?.country ? { country: [sha256(address.country)] } : {}),
    // The click ID from the Reel/ad link, in the `fbc` format Meta expects.
    ...(fbclid ? { fbc: `fb.1.${session.created * 1000}.${fbclid}` } : {}),
  };

  const body = {
    data: [
      {
        event_name: "Purchase",
        event_time: session.created,
        event_id: session.id,
        action_source: "website",
        event_source_url: `${site.url}/shop`,
        user_data: userData,
        custom_data: {
          currency: (session.currency ?? "chf").toUpperCase(),
          value: (session.amount_total ?? 0) / 100,
          ...(session.metadata?.utm_campaign ? { campaign: session.metadata.utm_campaign } : {}),
        },
      },
    ],
    ...(process.env.META_CAPI_TEST_CODE ? { test_event_code: process.env.META_CAPI_TEST_CODE } : {}),
  };

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(token)}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
  );
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${(await response.text()).slice(0, 300)}`);
  }
}
