"use client";

import { useEffect, useRef } from "react";

/**
 * A number that counts up the first time it comes into view. The final value is
 * what the server renders, so it is right without script or with reduced motion.
 */
export function CountUp({ to, className }: { to: number; className?: string }) {
  const element = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = element.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / 1100);
          node.textContent = String(Math.round(to * (1 - (1 - t) ** 3)));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to]);

  return (
    <span ref={element} className={className}>
      {to}
    </span>
  );
}
