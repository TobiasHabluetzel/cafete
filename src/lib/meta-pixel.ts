/**
 * Thin wrapper around the Meta (Facebook/Instagram) Pixel.
 *
 * Everything here is a no-op until `NEXT_PUBLIC_META_PIXEL_ID` is set, so the
 * shop behaves exactly as before on any deployment without it. The pixel lets
 * Instagram see which Reels and ads lead to purchases, and is what makes paid
 * promotion of a Reel optimisable at all.
 *
 * Purchase is sent twice on purpose — from the browser on the order page and from
 * the Stripe webhook via the Conversions API — with the Checkout Session ID as the
 * shared `eventID`, so Meta deduplicates them and still counts orders whose
 * browser blocked the script.
 */

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

type Fbq = (command: string, ...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: Fbq;
  }
}

export type PixelEvent = "PageView" | "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase";

export function trackPixel(event: PixelEvent, params?: Record<string, unknown>, eventId?: string) {
  if (!META_PIXEL_ID || typeof window === "undefined" || !window.fbq) return;
  if (eventId) {
    window.fbq("track", event, params ?? {}, { eventID: eventId });
  } else if (params) {
    window.fbq("track", event, params);
  } else {
    window.fbq("track", event);
  }
}
