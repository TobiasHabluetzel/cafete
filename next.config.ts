import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * Content Security Policy, production only.
 *
 * What the site actually loads: its own scripts, styles and fonts (next/font
 * self-hosts the Google fonts at build time), its own images plus the `data:`
 * blur placeholders, the homepage MP4, and fetches to its own API routes. Stripe
 * Checkout is a full-page redirect to stripe.com, so nothing of Stripe runs on
 * this origin. The third parties are the click-to-load YouTube iframe on a
 * portrait page and, when a pixel ID is configured, the Meta Pixel.
 *
 * `'unsafe-inline'` for scripts and styles is deliberate: Next's hydration data
 * is an inline script, and a per-request nonce would make every page dynamic.
 * The policy still pins where scripts may be *fetched* from, forbids plugins,
 * framing and base-URL hijacking, and limits fetch targets to this origin and Meta's pixel endpoints.
 *
 * Not applied in development, where React Fast Refresh needs eval and a
 * websocket. Railway builds with NODE_ENV=production, so the live site gets it.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  // connect.facebook.net / www.facebook.com: the Meta Pixel, only loaded when
  // NEXT_PUBLIC_META_PIXEL_ID is set (see src/lib/meta-pixel.ts).
  "script-src 'self' 'unsafe-inline' https://connect.facebook.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://www.facebook.com",
  "font-src 'self'",
  "media-src 'self'",
  "connect-src 'self' https://www.facebook.com https://connect.facebook.net",
  "frame-src https://www.youtube-nocookie.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  // A year of HTTPS-only for this host. No `preload`: the apex is served by
  // Infomaniak and would have to send the header too for preloading to be valid.
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Content-Security-Policy", value: contentSecurityPolicy }]
    : []),
];

const nextConfig: NextConfig = {
  // Traced, minimal server bundle — this is what the Railway Dockerfile ships.
  output: "standalone",
  // Nothing is gained by announcing the framework in every response.
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
