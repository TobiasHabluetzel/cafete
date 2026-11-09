"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

/**
 * A statement whose words light up one after another as it scrolls through the
 * lower part of the screen. It is complete by the time it reaches the middle, and
 * unlit words stay legible, so nobody has to stop at the right spot to read it.
 */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const root = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const words = Array.from(element.querySelectorAll<HTMLElement>("span"));
    let frame = 0;

    const update = () => {
      frame = 0;
      const box = element.getBoundingClientRect();
      const start = window.innerHeight * 0.95;
      const end = window.innerHeight * 0.5;
      const progress = Math.min(1, Math.max(0, (start - box.top) / (start - end + box.height * 0.5)));
      const lit = progress * words.length;
      words.forEach((word, index) => {
        word.style.opacity = String(0.34 + 0.66 * Math.min(1, Math.max(0, lit - index + 1)));
      });
    };
    const request = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request, { passive: true });
    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <p ref={root} className={cn("text-balance", className)}>
      {text.split(" ").map((word, index) => (
        <span key={index}>{word} </span>
      ))}
    </p>
  );
}
