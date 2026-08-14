import { notFound } from "next/navigation";

/**
 * Without this, an unmatched path like /de/nope falls through to Next's global
 * (unstyled) 404 instead of `[locale]/not-found.tsx`, because nothing inside the
 * `[locale]` segment matched. Static segments always win over a catch-all, so
 * this only ever handles genuinely unknown paths.
 */
export default function CatchAllNotFound(): never {
  notFound();
}
