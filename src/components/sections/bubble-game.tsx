"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

import { burstBubbles } from "@/lib/bubbles";

const SPOTS = Array.from({ length: 16 }, (_, index) => ({
  left: ((index * 0.618034) % 1) * 92 + 2,
  size: 26 + ((index * 7) % 34),
  duration: 7 + ((index * 3) % 7),
  delay: -((index * 1.7) % 9),
}));

/** Lost on the 404 page? At least there is something to pop while you are here. */
export function BubbleGame() {
  const t = useTranslations("notFound");
  const [popped, setPopped] = useState(0);
  const timers = useRef<number[]>([]);

  function pop(event: React.MouseEvent<HTMLButtonElement>) {
    const button = event.currentTarget;
    burstBubbles(event.clientX, event.clientY, 8);
    setPopped((count) => count + 1);
    button.style.visibility = "hidden";
    timers.current.push(window.setTimeout(() => (button.style.visibility = ""), 2200));
  }

  return (
    <>
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {SPOTS.map((spot, index) => (
          <button
            key={index}
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={pop}
            className="game-bubble"
            style={{
              left: `${spot.left}%`,
              width: spot.size,
              height: spot.size,
              animationDuration: `${spot.duration}s`,
              animationDelay: `${spot.delay}s`,
            }}
          />
        ))}
      </div>
      <p aria-live="polite" className="label-caps mt-6 min-h-5">
        {popped > 0 ? t("popped", { count: popped }) : t("popHint")}
      </p>
    </>
  );
}
