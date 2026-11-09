import type { ComponentProps, ReactNode } from "react";

import Image from "next/image";

import bottle from "../../../public/bottle-transparent.png";
import { cn } from "@/lib/utils";

const tones = {
  cream: "bg-cream text-charcoal",
  white: "bg-white text-charcoal",
  charcoal: "bg-charcoal text-cream",
  night: "bg-night text-cream",
  // Charcoal, not cream, on orange: cream is only 2.3:1 there.
  sunset: "bg-sunset text-charcoal",
  sunsetGradient: "bg-sunset-gradient text-charcoal",
} as const;

export function Section({
  tone = "cream",
  className,
  children,
  ...props
}: ComponentProps<"section"> & { tone?: keyof typeof tones }) {
  return (
    <section className={cn(tones[tone], "py-16 lg:py-24", className)} {...props}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

export function SectionHeader({
  label,
  title,
  intro,
  align = "left",
  labelClassName = "text-sunset-ink",
  className,
}: {
  label?: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  /** Override for dark sections, where sunset-deep has too little contrast. */
  labelClassName?: string;
  className?: string;
}) {
  return (
    <header
      className={cn(
        align === "center" && "mx-auto max-w-3xl text-center",
        className,
      )}
    >
      {label ? <p className={cn("label-caps", labelClassName)}>{label}</p> : null}
      <h2 className="text-h1 mt-3 text-balance">{title}</h2>
      {intro ? (
        <p
          className={cn(
            "mt-5 max-w-prose text-lg leading-relaxed opacity-80",
            align === "center" && "mx-auto",
          )}
        >
          {intro}
        </p>
      ) : null}
    </header>
  );
}

const HEAD_BUBBLES = [
  { left: 8, size: 14, duration: 9, delay: -2 },
  { left: 24, size: 24, duration: 12, delay: -7 },
  { left: 41, size: 10, duration: 8, delay: -4 },
  { left: 57, size: 18, duration: 11, delay: -1 },
  { left: 72, size: 28, duration: 13, delay: -9 },
  { left: 90, size: 15, duration: 10, delay: -5 },
];

/**
 * Page-level heading block for the sub-pages: the homepage poster at a smaller
 * scale. `compact` is for long titles such as the legal pages.
 */
export function PageHeader({
  label,
  title,
  intro,
  children,
  showBottle = false,
  compact = false,
}: {
  label?: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  showBottle?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="page-head">
      <div aria-hidden className="hero-rays-frame">
        <div className="hero-rays rays animate-spin-rays" />
      </div>
      <div aria-hidden className="hero-bubbles">
        {HEAD_BUBBLES.map((bubble) => (
          <span
            key={bubble.left}
            className="hero-bubble"
            style={{
              left: `${bubble.left}%`,
              width: bubble.size,
              height: bubble.size,
              animationDuration: `${bubble.duration}s`,
              animationDelay: `${bubble.delay}s`,
            }}
          />
        ))}
      </div>

      {showBottle ? (
        <div aria-hidden className="page-head-bottle page-head-bottle-rise">
          <Image src={bottle} alt="" priority sizes="(max-width: 640px) 40vw, 20rem" className="h-full w-auto" />
        </div>
      ) : null}

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        {label ? <p className="label-caps text-cherry-ink">{label}</p> : null}
        <h1 className={cn("page-title", compact && "page-title--compact", showBottle && "max-w-[72%]")}>
          {title}
        </h1>
        {intro ? (
          <p className={cn("page-head-intro mt-6 max-w-2xl text-lg leading-snug font-medium text-balance lg:text-2xl", showBottle && "max-w-[58%] lg:max-w-2xl")}>
            {intro}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}

/*
 * `PlaceholderNotice` lived here — a yellow-bordered banner warning that a legal
 * text was not yet binding. All four legal pages carry the owner's reviewed texts
 * as of 2026-09-16, so it has no callers and is gone. Recover it from git history
 * if a page ever needs that warning again.
 */
