import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

const tones = {
  cream: "bg-cream text-charcoal",
  white: "bg-white text-charcoal",
  charcoal: "bg-charcoal text-cream",
  sunset: "bg-sunset-gradient text-cream",
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
  labelClassName = "text-sunset-deep",
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

/** Page-level heading block, used by the sub-pages. */
export function PageHeader({
  label,
  title,
  intro,
}: {
  label?: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
}) {
  return (
    <div className="bg-sunburst text-cream">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        {label ? <p className="label-caps text-gold-soft">{label}</p> : null}
        <h1 className="text-display mt-3 max-w-4xl text-balance">{title}</h1>
        {intro ? (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-balance">{intro}</p>
        ) : null}
      </div>
    </div>
  );
}

/** Yellow-bordered notice used to flag placeholder legal text. */
export function PlaceholderNotice({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      role="note"
      className="border-cherry-deep/30 bg-gold/25 text-charcoal rounded-lg border-l-4 p-5"
    >
      <p className="font-display text-base font-extrabold">{title}</p>
      <p className="mt-1.5 text-sm leading-relaxed">{children}</p>
    </div>
  );
}
