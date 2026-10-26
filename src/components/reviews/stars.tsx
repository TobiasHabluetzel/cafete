import { cn } from "@/lib/utils";

/**
 * A star rating, drawn rather than written.
 *
 * Gold on a hard black outline, matching the sticker treatment used everywhere
 * else — a thin grey star would look imported from another site.
 *
 * The visual is `aria-hidden` and the rating is given as text to screen readers,
 * because "★★★★☆" read aloud is five pieces of punctuation rather than a score.
 */
export function Stars({
  rating,
  label,
  size = "md",
  className,
}: {
  rating: number;
  /** Pre-formatted for assistive tech, e.g. "4 von 5 Sternen". */
  label: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const px = size === "lg" ? 22 : size === "sm" ? 14 : 17;
  const rounded = Math.round(rating);

  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      <span aria-hidden className="inline-flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <svg
            key={n}
            width={px}
            height={px}
            viewBox="0 0 24 24"
            className={n <= rounded ? "text-gold" : "text-charcoal/15"}
          >
            <path
              d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4-5.8-3-5.8 3 1.1-6.4L2.6 9.4l6.5-.9z"
              fill="currentColor"
              stroke="rgba(0,0,0,0.85)"
              strokeWidth={n <= rounded ? 1.4 : 0}
              strokeLinejoin="round"
            />
          </svg>
        ))}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
}
