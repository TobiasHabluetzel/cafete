"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { useEffect } from "react";

/**
 * Gives the mouse wheel some weight. Touch scrolling stays native, because a phone
 * already does this better than script can, and it is off for reduced motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.12, anchors: { offset: -96 } });
    return () => lenis.destroy();
  }, []);

  return null;
}
