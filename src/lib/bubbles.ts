/** Quiet no-op for visitors who prefer reduced motion. */
function motionOk() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function bubble(x: number, y: number, size: number) {
  const el = document.createElement("span");
  el.className = "fun-bubble";
  el.setAttribute("aria-hidden", "true");
  Object.assign(el.style, {
    left: `${x - size / 2}px`,
    top: `${y - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
  });
  document.body.appendChild(el);
  return el;
}

/** A pop of bubbles flying out from a point on screen. */
export function burstBubbles(x: number, y: number, count = 14) {
  if (!motionOk()) return;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const reach = 40 + Math.random() * 90;
    const el = bubble(x, y, 6 + Math.random() * 14);
    el.animate(
      [
        { transform: "translate(0, 0) scale(0.4)", opacity: 1 },
        {
          transform: `translate(${Math.cos(angle) * reach}px, ${Math.sin(angle) * reach - 40}px) scale(1)`,
          opacity: 0,
        },
      ],
      { duration: 520 + Math.random() * 380, easing: "cubic-bezier(0.16, 1, 0.3, 1)" },
    ).finished
      .catch(() => undefined)
      .finally(() => el.remove());
  }
}

/** One small bubble that drifts upwards from a point. */
export function riseBubble(x: number, y: number) {
  if (!motionOk()) return;
  const el = bubble(x, y, 5 + Math.random() * 9);
  el.animate(
    [
      { transform: "translate(0, 0)", opacity: 0.9 },
      { transform: `translate(${(Math.random() - 0.5) * 26}px, ${-40 - Math.random() * 50}px)`, opacity: 0 },
    ],
    { duration: 800 + Math.random() * 500, easing: "ease-out" },
  ).finished
    .catch(() => undefined)
    .finally(() => el.remove());
}

/** Bubbles rising across the whole screen. */
export function bubbleStorm() {
  if (!motionOk()) return;
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * window.innerWidth;
    const el = bubble(x, window.innerHeight + 30, 8 + Math.random() * 30);
    el.animate(
      [
        { transform: "translate(0, 0)", opacity: 0 },
        { opacity: 0.95, offset: 0.1 },
        { transform: `translate(${(Math.random() - 0.5) * 80}px, ${-window.innerHeight - 90}px)`, opacity: 0.2 },
      ],
      { duration: 1600 + Math.random() * 1800, delay: Math.random() * 1100, easing: "ease-in", fill: "backwards" },
    ).finished
      .catch(() => undefined)
      .finally(() => el.remove());
  }
}
