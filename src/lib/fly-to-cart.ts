/**
 * Sends a copy of the product image up to the cart icon when something is added,
 * then gives the icon a small bump. Purely decorative: it adds nothing to the
 * cart, and it does nothing at all for visitors who prefer reduced motion.
 */
export function flyToCart(source: HTMLImageElement | null | undefined) {
  if (!source || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const target = document.querySelector<SVGElement>("[data-cart-target]");
  if (!target) return;

  const from = source.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  if (from.width === 0 || to.width === 0) return;

  const clone = source.cloneNode() as HTMLImageElement;
  clone.removeAttribute("id");
  clone.alt = "";
  clone.setAttribute("aria-hidden", "true");
  Object.assign(clone.style, {
    position: "fixed",
    left: `${from.left}px`,
    top: `${from.top}px`,
    width: `${from.width}px`,
    height: `${from.height}px`,
    margin: "0",
    zIndex: "60",
    pointerEvents: "none",
    objectFit: "contain",
  });
  document.body.appendChild(clone);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top + from.height / 2);
  const end = Math.max(0.06, to.width / from.width);

  const flight = clone.animate(
    [
      { transform: "translate(0, 0) scale(1) rotate(0deg)", opacity: 1 },
      {
        transform: `translate(${dx * 0.45}px, ${dy * 0.55}px) scale(0.5) rotate(-8deg)`,
        opacity: 1,
        offset: 0.55,
      },
      {
        transform: `translate(${dx}px, ${dy}px) scale(${end}) rotate(-14deg)`,
        opacity: 0.25,
      },
    ],
    { duration: 620, easing: "cubic-bezier(0.45, 0, 0.2, 1)" },
  );

  flight.finished
    .catch(() => undefined)
    .finally(() => {
      clone.remove();
      target.animate(
        [
          { transform: "scale(1)" },
          { transform: "scale(1.35) rotate(-6deg)" },
          { transform: "scale(1)" },
        ],
        { duration: 340, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
      );
    });
}
