import { cn } from "@/lib/utils";

/**
 * Slowly rotating sunburst rays, echoing the flames in the logo.
 *
 * The rays are centred on their positioned ancestor (`inset-0` + `m-auto`) so
 * they read as a burst radiating from behind the subject. Anchoring them
 * off-screen instead just produces diagonal stripes across the section.
 *
 * Purely decorative; the rotation stops for `prefers-reduced-motion`.
 */
export function SunburstRays({
  className,
  size = "w-[42rem]",
  opacity = "opacity-25",
}: {
  className?: string;
  /** Width utility; the element is always square. */
  size?: string;
  opacity?: string;
}) {
  // Solid in the middle, gone by the outer edge, so there is no hard cut-off.
  const mask =
    "radial-gradient(circle at 50% 50%, black 0%, black 34%, transparent 66%)";

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 m-auto aspect-square max-w-none",
        size,
        opacity,
        className,
      )}
    >
      <div
        className="rays animate-spin-rays size-full"
        style={{ maskImage: mask, WebkitMaskImage: mask }}
      />
    </div>
  );
}

/** Warm radial glow used to lift subjects off the dark sections. */
export function WarmGlow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "bg-sunset/25 pointer-events-none absolute rounded-full blur-3xl",
        className,
      )}
    />
  );
}

/**
 * Soft radial mask that lets the studio photography dissolve into a dark
 * section instead of sitting in a visible rectangle.
 */
export const photoFadeStyle = {
  maskImage:
    "radial-gradient(ellipse 62% 68% at 50% 46%, black 38%, transparent 86%)",
  WebkitMaskImage:
    "radial-gradient(ellipse 62% 68% at 50% 46%, black 38%, transparent 86%)",
} as const;
