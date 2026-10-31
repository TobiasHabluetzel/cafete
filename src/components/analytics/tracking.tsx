"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { captureAttribution } from "@/lib/attribution";
import { META_PIXEL_ID, trackPixel, type PixelEvent } from "@/lib/meta-pixel";

/**
 * Mounted once in the locale layout: remembers campaign tags from the landing
 * URL and, if a pixel ID is configured, loads the Meta Pixel and reports a
 * PageView on every client-side navigation.
 */
export function Tracking() {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    captureAttribution(window.location.search);
    // The loader script sends the initial PageView itself; only later route
    // changes need one from here, or the first page would count twice.
    if (first.current) {
      first.current = false;
      return;
    }
    trackPixel("PageView");
  }, [pathname]);

  if (!META_PIXEL_ID) return null;

  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', ${JSON.stringify(META_PIXEL_ID)});
fbq('track', 'PageView');`}
    </Script>
  );
}

/** Fires one pixel event when a page renders, e.g. ViewContent on /shop or Purchase on the order page. */
export function TrackOnMount({
  event,
  params,
  eventId,
}: {
  event: PixelEvent;
  params?: Record<string, unknown>;
  eventId?: string;
}) {
  useEffect(() => {
    // The pixel script loads after hydration; give it a moment rather than lose the event.
    // The cleanup cancels the pending send, so a remount fires it exactly once.
    const timer = window.setTimeout(() => trackPixel(event, params, eventId), 1200);
    return () => window.clearTimeout(timer);
  }, [event, params, eventId]);
  return null;
}
