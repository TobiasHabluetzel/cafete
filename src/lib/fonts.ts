import { Baloo_2, Geist, Geist_Mono } from "next/font/google";

/**
 * Display face — rounded, bubbly and energetic, echoing the
 * "Fruity · Fizzy · Focus" banner. The CAFÉTÉ wordmark itself is always the
 * supplied image asset, never a webfont.
 */
export const fontDisplay = Baloo_2({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
  display: "swap",
});

/** Body / UI — clean geometric sans. */
export const fontBody = Geist({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const fontMono = Geist_Mono({
  variable: "--font-mono-stack",
  subsets: ["latin"],
  display: "swap",
});

export const fontVariables = [
  fontDisplay.variable,
  fontBody.variable,
  fontMono.variable,
].join(" ");
