"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import { bubbleStorm, burstBubbles, riseBubble, shoutOut } from "@/lib/bubbles";

/**
 * All the small toys on the site, in one place. Each has its own switch: set one
 * to `false` and that effect is gone, nothing else changes. To drop them all,
 * remove <Playground /> from the locale layout.
 */
const FUN = {
  /** Thin bar along the top that fills as you scroll. */
  scrollProgress: true,
  /** Click a floating bubble and it pops. */
  popBubbles: true,
  /** Bubbles rise from the mouse over the orange and animated areas. */
  bubbleTrail: true,
  /** Buttons lean towards the mouse. */
  magneticButtons: true,
  /** Pack cards, contact cards and the portrait tilt with the mouse. */
  tiltCards: true,
  /** The homepage bottle and headline follow the mouse a little. */
  heroParallax: true,
  /** Click the header logo five times quickly. */
  logoEasterEgg: true,
  /** A note in the browser tab while you are away. */
  tabMessage: true,
};

export function Playground() {
  const t = useTranslations("fun");
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fineMouse = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups: (() => void)[] = [];
    const on = <K extends keyof WindowEventMap>(
      type: K,
      handler: (event: WindowEventMap[K]) => void,
      options?: AddEventListenerOptions,
    ) => {
      window.addEventListener(type, handler, options);
      cleanups.push(() => window.removeEventListener(type, handler));
    };

    if (FUN.scrollProgress && motionOk) {
      let frame = 0;
      const update = () => {
        frame = 0;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      };
      const request = () => {
        if (!frame) frame = requestAnimationFrame(update);
      };
      update();
      on("scroll", request, { passive: true });
      on("resize", request, { passive: true });
      cleanups.push(() => cancelAnimationFrame(frame));
    }

    if (FUN.popBubbles && motionOk) {
      on("pointerdown", (event) => {
        const target = event.target as HTMLElement;
        if (!target.classList?.contains("hero-bubble")) return;
        burstBubbles(event.clientX, event.clientY, 8);
        target.style.visibility = "hidden";
        window.setTimeout(() => (target.style.visibility = ""), 2500);
      });
    }

    if (FUN.bubbleTrail && motionOk && fineMouse) {
      let last = 0;
      on(
        "pointermove",
        (event) => {
          const now = performance.now();
          if (now - last < 90) return;
          const target = event.target as HTMLElement;
          if (!target.closest?.(".hero, .page-head, .journey-track")) return;
          last = now;
          riseBubble(event.clientX, event.clientY);
        },
        { passive: true },
      );
    }

    if (FUN.magneticButtons && motionOk && fineMouse) {
      let active: HTMLElement | null = null;
      const release = () => {
        if (active) active.style.transform = "";
        active = null;
      };
      on(
        "pointermove",
        (event) => {
          const button = (event.target as HTMLElement).closest?.<HTMLElement>(".cta");
          if (button !== active) release();
          if (!button) return;
          active = button;
          const box = button.getBoundingClientRect();
          const x = (event.clientX - box.left - box.width / 2) * 0.16;
          const y = (event.clientY - box.top - box.height / 2) * 0.28;
          button.style.transform = `translate(${x}px, ${y}px)`;
        },
        { passive: true },
      );
      cleanups.push(release);
    }

    if (FUN.tiltCards && motionOk && fineMouse) {
      let active: HTMLElement | null = null;
      const release = () => {
        if (active) active.style.transform = "";
        active = null;
      };
      on(
        "pointermove",
        (event) => {
          const card = (event.target as HTMLElement).closest?.<HTMLElement>(".tilt");
          if (card !== active) release();
          if (!card) return;
          active = card;
          const box = card.getBoundingClientRect();
          const x = (event.clientX - box.left) / box.width - 0.5;
          const y = (event.clientY - box.top) / box.height - 0.5;
          card.style.transform = `perspective(700px) rotateX(${-y * 18}deg) rotateY(${x * 18}deg) scale(1.03)`;
        },
        { passive: true },
      );
      cleanups.push(release);
    }

    if (FUN.heroParallax && motionOk && fineMouse) {
      on(
        "pointermove",
        (event) => {
          const hero = document.querySelector<HTMLElement>(".hero");
          if (!hero || window.scrollY > hero.offsetHeight) return;
          hero.style.setProperty("--mx", String(event.clientX / window.innerWidth - 0.5));
          hero.style.setProperty("--my", String(event.clientY / window.innerHeight - 0.5));
        },
        { passive: true },
      );
    }

    if (FUN.logoEasterEgg) {
      let clicks: number[] = [];
      on("click", (event) => {
        if (!(event.target as HTMLElement).closest?.('header a[aria-label="CAFÉTÉ"]')) return;
        const now = Date.now();
        clicks = [...clicks.filter((time) => now - time < 2000), now];
        if (clicks.length < 5) return;
        clicks = [];
        bubbleStorm();
        shoutOut(t("cheers"));
      });
    }

    // The hero's rays and bubbles run forever; let them rest while the hero is out of view.
    const hero = document.querySelector<HTMLElement>(".hero");
    if (hero) {
      const watch = new IntersectionObserver(([entry]) => {
        hero.toggleAttribute("data-offscreen", !entry.isIntersecting);
      });
      watch.observe(hero);
      cleanups.push(() => watch.disconnect());
    }

    if (FUN.tabMessage) {
      // While the visitor is on another tab, the title takes turns between a few short lines.
      const lines = t("tab").split("|");
      let original = "";
      let timer = 0;
      const onVisibility = () => {
        window.clearInterval(timer);
        if (document.hidden) {
          original = document.title;
          let n = 0;
          document.title = lines[0];
          timer = window.setInterval(() => {
            n = (n + 1) % lines.length;
            document.title = lines[n];
          }, 2500);
        } else if (original) {
          document.title = original;
        }
      };
      document.addEventListener("visibilitychange", onVisibility);
      cleanups.push(() => {
        window.clearInterval(timer);
        document.removeEventListener("visibilitychange", onVisibility);
      });
    }

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [t]);

  return FUN.scrollProgress ? <div ref={bar} aria-hidden className="fun-progress" /> : null;
}
