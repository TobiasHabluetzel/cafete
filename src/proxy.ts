import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

// Next.js 16 renamed Middleware to Proxy — same functionality, new filename.
export const proxy = createMiddleware(routing);

export const config = {
  // Skip API routes, Next internals and anything with a file extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
