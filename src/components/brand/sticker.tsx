import Image from "next/image";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

import cherry from "../../../public/coffee-cherry-illustration.png";

/**
 * Rotated sticker badge — the graffiti-flyer device that carries the loud facts
 * ("33 cl", "über 50 % weniger Zucker", "ab CHF 24.90").
 */
export function Sticker({
  tone = "gold",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: "gold" | "cherry" | "cream" | "sunset" }) {
  // Black ink on every tone: cream on cherry is only 3.7:1, which fails AA at
  // this size, while ink on cherry is 5.2:1. It also matches the artwork, where
  // every outline and every piece of lettering is black.
  const tones = {
    gold: "bg-gold text-ink",
    cherry: "bg-cherry text-ink",
    cream: "bg-cream text-ink",
    sunset: "bg-sunset text-ink",
  } as const;

  return (
    <span
      className={cn(
        "font-display border-ink/85 inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-1.5",
        "text-sm font-extrabold tracking-tight",
        "shadow-[3px_3px_0_rgba(0,0,0,0.5)]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

/** The engraved coffee-cherry illustration, used as a decorative accent. */
export function CherryMark({
  className,
  ...props
}: Omit<ComponentProps<typeof Image>, "src" | "alt">) {
  return (
    <Image
      src={cherry}
      alt=""
      aria-hidden
      className={cn("pointer-events-none select-none", className)}
      {...props}
    />
  );
}
