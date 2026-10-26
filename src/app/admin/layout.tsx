import type { Metadata } from "next";

import { fontVariables } from "@/lib/fonts";

import "../globals.css";

/**
 * The admin lives outside `[locale]`, so it needs its own document shell — the
 * root `html`/`body` belong to the locale layout.
 *
 * Deliberately not part of the i18n tree: it is an internal tool, not a page of
 * the site. Keeping it out means no slug in the routing map, nothing in the
 * sitemap, and no hreflang pointing at a login screen.
 */
export const metadata: Metadata = {
  title: "CAFÉTÉ Admin",
  // Belt and braces alongside the robots.txt rule — this must never be indexed.
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${fontVariables} h-full`} suppressHydrationWarning>
      <body className="bg-cream text-charcoal min-h-full antialiased">{children}</body>
    </html>
  );
}
