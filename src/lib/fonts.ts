import { Bricolage_Grotesque, Geist } from "next/font/google";

/**
 * Display face — modern with some character, so the hand-drawn logo and the
 * bubble slogan stay the loud parts of the brand. Set slightly condensed through
 * its width axis (see `font-stretch` on the body). The CAFÉTÉ wordmark itself is
 * always the supplied image asset, never a webfont.
 */
export const fontDisplay = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  axes: ["opsz", "wdth"],
  display: "swap",
});

/** Body / UI — clean geometric sans. */
export const fontBody = Geist({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const fontVariables = [
  fontDisplay.variable,
  fontBody.variable,
].join(" ");
