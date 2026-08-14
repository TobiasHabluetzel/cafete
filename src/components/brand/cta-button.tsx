import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * Big pill CTA in the brand voice. shadcn's `Button` stays for compact UI and
 * form controls; this is the loud one used on the hero, shop and event bands.
 */
export const ctaVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full font-display font-extrabold tracking-tight whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        solid:
          "bg-sunset-gradient text-white shadow-brand hover:brightness-105 focus-visible:ring-white/70",
        gold: "bg-gold text-charcoal shadow-brand hover:bg-gold-soft focus-visible:ring-charcoal/40",
        dark: "bg-charcoal text-cream hover:bg-charcoal-soft focus-visible:ring-charcoal/40",
        outline:
          "border-2 border-current bg-transparent hover:bg-current/10 focus-visible:ring-current/40",
      },
      size: {
        md: "h-11 px-6 text-base",
        lg: "h-13 px-8 text-lg",
        xl: "h-14 px-9 text-xl",
      },
    },
    defaultVariants: { variant: "solid", size: "lg" },
  },
);

type CtaProps = VariantProps<typeof ctaVariants>;

export function ctaClass({ variant, size, className }: CtaProps & { className?: string }) {
  return cn(ctaVariants({ variant, size }), className);
}

export function CtaButton({
  className,
  variant,
  size,
  ...props
}: ComponentProps<"button"> & CtaProps) {
  return (
    <button type="button" className={ctaClass({ variant, size, className })} {...props} />
  );
}
