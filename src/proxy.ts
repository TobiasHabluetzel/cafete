import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, locales, routing, type Locale } from "./i18n/routing";

// Next.js 16 renamed Middleware to Proxy — same functionality, new filename.
const intl = createMiddleware(routing);

/**
 * The short path printed on the flyers and encoded in the QR code.
 *
 * Kept deliberately tiny: a shorter payload means fewer QR modules, which means
 * bigger modules at a given sticker size and a scan that still works from a
 * distance, at an angle, or through a scuff. It is also readable if someone types
 * it off the print instead of scanning.
 */
const QR_SHORTCUT = "/qr";

/** The landing page the shortcut resolves to, per locale. */
const LANDER = "/entdecken" as const;

function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

/**
 * Which language to send a scan to.
 *
 * A printed code has no locale in it, so this is the one place the site has to
 * guess. An earlier explicit choice wins (`NEXT_LOCALE` is the cookie next-intl
 * itself writes when someone uses the language switcher); otherwise the phone's
 * own `Accept-Language`, highest q-value first; otherwise German, since the
 * flyers are for Zürich.
 */
function preferredLocale(request: NextRequest): Locale {
  const chosen = request.cookies.get("NEXT_LOCALE")?.value;
  if (isLocale(chosen)) return chosen;

  const header = request.headers.get("accept-language");
  if (header) {
    const ranked = header
      .split(",")
      .map((part) => {
        const [tag, ...parameters] = part.trim().split(";");
        const q = parameters.find((parameter) => parameter.trim().startsWith("q="));
        return { tag: tag.trim().toLowerCase(), q: q ? Number(q.trim().slice(2)) : 1 };
      })
      .filter(({ tag, q }) => tag.length > 0 && Number.isFinite(q))
      .sort((a, b) => b.q - a.q);

    // `de-CH` and `de` both mean German; compare on the primary subtag only.
    for (const { tag } of ranked) {
      const base = tag.split("-")[0];
      if (isLocale(base)) return base;
    }
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // `/qr/` never reaches here: Next normalises the trailing slash away first.
  if (pathname === QR_SHORTCUT) {
    const locale = preferredLocale(request);
    const url = request.nextUrl.clone();
    // Assigning only the pathname keeps the query string, so a per-batch tag
    // like `/qr?src=sticker` survives the hop.
    url.pathname = `/${locale}${routing.pathnames[LANDER][locale]}`;
    // 307, not 308: the target of a code that is already printed on paper must
    // stay changeable. A permanent redirect would be cached in every phone that
    // ever scanned it, so repointing the campaign later would not reach them.
    return NextResponse.redirect(url);
  }

  /*
   * The launch event happened on 19 September 2026 and its page is gone, but the
   * URL was on social posts and in the RSVP confirmations, so it redirects to the
   * homepage rather than 404ing on anyone who follows an old link.
   *
   * 307 rather than 308 for the same reason as above: if a recap page ever takes
   * that address, a permanently cached redirect would keep people from reaching
   * it. Matches `/de/event` and `/en/event`, which share a slug.
   */
  if (/^\/(de|en)\/event\/?$/.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${pathname.split("/")[1]}`;
    return NextResponse.redirect(url);
  }

  return intl(request);
}

export const config = {
  // Skip API routes, Next internals and anything with a file extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
