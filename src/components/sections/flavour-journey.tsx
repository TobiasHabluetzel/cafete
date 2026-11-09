"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import { ctaClass } from "@/components/brand/cta-button";
import { Link } from "@/i18n/navigation";

import bottle from "../../../public/bottle-transparent.png";

/**
 * The scroll story: the bottle stays pinned while the slogan plays out around it.
 * Fruity (cherries fly in), Fizzy (the world turns orange and bubbles rise),
 * Focus (the sun opens up and the order button arrives).
 *
 * Everything moves through `transform` and `opacity`, written straight to the
 * elements from one animation frame, so React never re-renders during a scroll.
 * Scroll position is eased rather than applied raw, which is what makes it feel
 * weighted instead of mechanically tied to the wheel.
 *
 * With `prefers-reduced-motion` the CSS lays the same content out as a plain
 * stacked section and this effect never starts.
 */

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number) => 1 - (1 - t) ** 3;

/** Where each scene is on screen, as fractions of the pinned scroll distance. */
const SCENES = [
  { key: "fruity", start: 0, end: 0.32 },
  { key: "fizzy", start: 0.35, end: 0.64 },
  { key: "focus", start: 0.67, end: 1.2 },
] as const;

/*
 * Fixed tables rather than Math.random(): the server and the first client render
 * have to produce identical markup. Positions are fractions of the stage size.
 */
const CHERRIES = [
  { size: 64, fromX: -0.62, fromY: -0.5, toX: -0.33, toY: -0.27, spin: 1 },
  { size: 40, fromX: -0.7, fromY: 0.06, toX: -0.42, toY: -0.06, spin: -1 },
  { size: 78, fromX: -0.58, fromY: 0.62, toX: -0.3, toY: 0.2, spin: 1 },
  { size: 32, fromX: -0.32, fromY: -0.72, toX: -0.2, toY: -0.36, spin: -1 },
  { size: 50, fromX: 0.6, fromY: -0.6, toX: 0.31, toY: -0.3, spin: -1 },
  { size: 72, fromX: 0.72, fromY: -0.04, toX: 0.39, toY: -0.04, spin: 1 },
  { size: 36, fromX: 0.58, fromY: 0.68, toX: 0.34, toY: 0.24, spin: -1 },
  { size: 56, fromX: 0.3, fromY: 0.78, toX: 0.24, toY: 0.32, spin: 1 },
  { size: 28, fromX: 0.34, fromY: -0.76, toX: 0.17, toY: -0.39, spin: 1 },
  { size: 26, fromX: -0.2, fromY: 0.8, toX: -0.2, toY: 0.33, spin: -1 },
];

const BUBBLES = Array.from({ length: 34 }, (_, index) => ({
  // Golden-ratio spacing spreads them evenly without looking like a grid.
  x: ((index * 0.618034) % 1) * 1.04 - 0.02,
  phase: (index * 0.381966) % 1,
  size: 8 + ((index * 7) % 30),
  speed: 1.1 + ((index * 3) % 7) / 5,
}));

export function FlavourJourney({ entryPrice }: { entryPrice: string | null }) {
  const t = useTranslations("journey");
  const tHero = useTranslations("hero");
  const track = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = track.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const all = <T extends HTMLElement>(selector: string) =>
      Array.from(root.querySelectorAll<T>(selector));
    const one = (selector: string) => root.querySelector<HTMLElement>(selector);

    const words = all(".journey-word > span");
    const scenes = all(".journey-scene");
    const cherries = all(".journey-cherry");
    const bubbles = all(".journey-bubble");
    const bgSunset = one(".journey-bg--sunset");
    const bgFocus = one(".journey-bg--focus");
    const rays = one(".journey-rays");
    const glow = one(".journey-glow");
    const bottleEl = one(".journey-bottle-inner");
    const rail = one(".journey-rail-fill");

    let width = window.innerWidth;
    let height = window.innerHeight;
    let current = 0;
    let frame = 0;
    let last = 0;
    let visible = false;

    const render = (p: number) => {
      const seg = (a: number, b: number) => clamp((p - a) / (b - a));

      if (bgSunset) bgSunset.style.opacity = String(smooth(seg(0.3, 0.38)));
      if (bgFocus) bgFocus.style.opacity = String(smooth(seg(0.62, 0.7)));
      if (rays) {
        rays.style.opacity = String(0.14 + 0.36 * smooth(seg(0.64, 0.8)));
        rays.style.transform = `rotate(${p * 150}deg) scale(${1 + 0.7 * seg(0.62, 1)})`;
      }

      // The bottle rises in, sways through the first two scenes, then settles.
      const rise = easeOut(seg(0, 0.14));
      const tilt =
        p < 0.4
          ? lerp(-12, 9, smooth(seg(0.06, 0.4)))
          : p < 0.66
            ? lerp(9, -6, smooth(seg(0.4, 0.66)))
            : lerp(-6, 0, smooth(seg(0.66, 0.84)));
      const scale = 0.86 + 0.14 * rise + 0.1 * smooth(seg(0.7, 0.95));
      if (bottleEl) {
        bottleEl.style.transform = `translate3d(0, ${(1 - rise) * height * 0.45}px, 0) rotate(${tilt}deg) scale(${scale})`;
      }
      if (glow) {
        glow.style.opacity = String(rise * (0.55 + 0.45 * seg(0.66, 0.9)));
        glow.style.transform = `scale(${0.8 + 0.6 * seg(0.6, 1)})`;
      }

      SCENES.forEach((scene, index) => {
        const presence =
          smooth(seg(scene.start, scene.start + 0.05)) *
          (1 - smooth(seg(scene.end - 0.04, scene.end)));
        const travel = seg(scene.start, Math.min(scene.end, 1));

        const word = words[index];
        if (word) {
          word.style.opacity = String(presence);
          word.style.transform = `translate3d(${lerp(13, -13, travel)}%, 0, 0) scale(${lerp(0.92, 1.03, travel)})`;
        }

        const caption = scenes[index];
        if (caption) {
          caption.style.opacity = String(presence);
          caption.style.transform = `translate3d(0, ${(1 - presence) * 26}px, 0)`;
          caption.style.visibility = presence < 0.01 ? "hidden" : "visible";
        }
      });

      // Cherries fly in around the bottle, then get pulled into it.
      const arrive = easeOut(seg(0.02, 0.24));
      const absorb = smooth(seg(0.27, 0.36));
      cherries.forEach((el, index) => {
        const c = CHERRIES[index];
        const x = lerp(lerp(c.fromX, c.toX, arrive), 0, absorb) * width;
        const y = lerp(lerp(c.fromY, c.toY, arrive), 0, absorb) * height;
        el.style.opacity = String(seg(0.02, 0.06) * (1 - absorb));
        el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${p * 900 * c.spin}deg) scale(${1 - absorb * 0.8})`;
      });

      // Bubbles only exist in the Fizzy scene; their height is tied to the scroll.
      const fizz = smooth(seg(0.33, 0.4)) * (1 - smooth(seg(0.62, 0.68)));
      const lift = seg(0.3, 0.7);
      bubbles.forEach((el, index) => {
        const b = BUBBLES[index];
        const climb = (b.phase + lift * b.speed) % 1.2;
        const y = height * (1.1 - climb);
        const x = (b.x + Math.sin(climb * 9 + index) * 0.015) * width;
        el.style.opacity = String(fizz * 0.9);
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });

      if (rail) rail.style.transform = `scaleY(${p})`;
    };

    const target = () => {
      const box = root.getBoundingClientRect();
      return clamp(-box.top / Math.max(1, box.height - height));
    };

    const tick = (now: number) => {
      const goal = target();
      // Time-based, so the weight feels the same on a 60 Hz and a 120 Hz screen.
      const elapsed = Math.min(0.1, (now - last) / 1000);
      last = now;
      current += (goal - current) * (1 - Math.exp(-elapsed * 9));
      if (Math.abs(goal - current) < 0.0004) current = goal;
      render(current);
      frame = current === goal ? 0 : requestAnimationFrame(tick);
    };

    const wake = () => {
      if (visible && !frame) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    const measure = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      wake();
    };

    // Nothing runs while the section is off screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        wake();
      },
      { rootMargin: "20% 0px" },
    );
    observer.observe(root);

    current = target();
    render(current);

    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <section ref={track} className="journey-track" aria-labelledby="journey-title">
      <div className="journey-stage">
        <h2 id="journey-title" className="sr-only">
          {tHero("slogan")}
        </h2>

        <div aria-hidden className="journey-bg journey-bg--fruity" />
        <div aria-hidden className="journey-bg journey-bg--sunset" />
        <div aria-hidden className="journey-bg journey-bg--focus" />
        <div aria-hidden className="journey-rays-frame">
          <div className="journey-rays rays" />
        </div>

        <div aria-hidden className="journey-particles">
          {BUBBLES.map((bubble, index) => (
            <span
              key={index}
              className="journey-bubble"
              style={{ width: bubble.size, height: bubble.size }}
            />
          ))}
        </div>

        {SCENES.map((scene) => (
          <p key={scene.key} aria-hidden className={`journey-word journey-word--${scene.key}`}>
            <span>{t(`${scene.key}.title`)}</span>
          </p>
        ))}

        <div aria-hidden className="journey-particles journey-particles--centered">
          {CHERRIES.map((cherry, index) => (
            <span
              key={index}
              className="journey-cherry"
              style={{ "--size": cherry.size } as React.CSSProperties}
            />
          ))}
        </div>

        <div aria-hidden className="journey-glow" />

        <div className="journey-bottle">
          <div className="journey-bottle-inner">
            <Image src={bottle} alt={t("bottleAlt")} sizes="(max-width: 1024px) 40vw, 18rem" />
          </div>
        </div>

        {SCENES.map((scene) => (
          <div key={scene.key} className={`journey-scene journey-scene--${scene.key}`}>
            <h3 className="label-caps">{t(`${scene.key}.title`)}</h3>
            <p className="journey-body">{t(`${scene.key}.body`)}</p>
            {scene.key === "focus" ? (
              <Link
                href="/shop"
                className={ctaClass({ variant: "gold", size: "lg", className: "mt-5" })}
              >
                {entryPrice
                  ? tHero("ctaPrimaryWithPrice", { price: entryPrice })
                  : tHero("ctaPrimary")}
              </Link>
            ) : null}
          </div>
        ))}

        <div aria-hidden className="journey-rail">
          <span className="journey-rail-fill" />
        </div>
      </div>
    </section>
  );
}
