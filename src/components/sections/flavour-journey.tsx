"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import { ctaClass } from "@/components/brand/cta-button";
import type { Fruit3D, Fruit3DKind, FruitPose } from "@/components/sections/journey-fruit-3d";
import { Link } from "@/i18n/navigation";

import bottle from "../../../public/bottle-transparent.png";
import coffeeCherry from "../../../public/fruit/coffee-cherry.webp";
import coffeeCherry2 from "../../../public/fruit/coffee-cherry-2.webp";
import cranberry1 from "../../../public/fruit/cranberry-1.webp";
import cranberry2 from "../../../public/fruit/cranberry-2.webp";
import cranberry3 from "../../../public/fruit/cranberry-3.webp";
import elderberry1 from "../../../public/fruit/elderberry-1.webp";
import elderberry2 from "../../../public/fruit/elderberry-2.webp";
import elderberry3 from "../../../public/fruit/elderberry-3.webp";

/**
 * The scroll story: the bottle stays pinned while the slogan plays out around it.
 * Fruity (photographed fruit flies in, in three layers of depth), Fizzy (the world turns
 * orange and bubbles rise), Focus (everything draws in on the bottle and the word snaps sharp).
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
  { key: "fruity", start: -0.04, end: 0.335 },
  { key: "fizzy", start: 0.335, end: 0.665 },
  { key: "focus", start: 0.665, end: 1.2 },
] as const;

/*
 * Fixed tables rather than Math.random(): the server and the first client render
 * have to produce identical markup. Positions are fractions of the stage size.
 */
/** Drawn for CAFÉTÉ: painted volume, light from the top left, a thin ink outline like the label. */
const FRUIT_IMAGE = {
  cherry: coffeeCherry,
  cherry2: coffeeCherry2,
  cran1: cranberry1,
  cran2: cranberry2,
  cran3: cranberry3,
  elder1: elderberry1,
  elder2: elderberry2,
  elder3: elderberry3,
};
type FruitKind = keyof typeof FRUIT_IMAGE;

/** 0 sits soft behind the word, 1 is sharp in front of it, 2 is out of focus close to the camera. */
type Depth = 0 | 1 | 2;
const DRIFT: Record<Depth, number> = { 0: 0.03, 1: 0.08, 2: 0.26 };

/** Real photographs. Their light comes from one side, so they only turn a little. */
/** The first layout, with what is in the drink. Flipped copies keep repeats from showing. */
const FRUIT: {
  kind: FruitKind;
  size: number;
  x: number;
  y: number;
  depth: Depth;
  spin: number;
  flip?: boolean;
}[] = [
  { kind: "cherry", size: 54, x: -0.44, y: -0.3, depth: 0, spin: 1 },
  { kind: "cran2", size: 36, x: 0.46, y: -0.2, depth: 0, spin: -1 },
  { kind: "elder2", size: 22, x: 0.27, y: -0.42, depth: 0, spin: 1 },
  { kind: "elder3", size: 24, x: -0.27, y: 0.17, depth: 0, spin: -1 },
  { kind: "cherry2", size: 44, x: -0.47, y: 0.1, depth: 0, spin: 1, flip: true },
  { kind: "cran1", size: 32, x: 0.44, y: 0.2, depth: 0, spin: -1 },

  { kind: "cran3", size: 72, x: -0.36, y: -0.1, depth: 1, spin: -1 },
  { kind: "cherry", size: 104, x: -0.2, y: 0.17, depth: 1, spin: 1 },
  { kind: "cran1", size: 58, x: -0.21, y: -0.38, depth: 1, spin: -1 },
  { kind: "cherry2", size: 96, x: 0.36, y: -0.2, depth: 1, spin: 1, flip: true },
  { kind: "cherry2", size: 88, x: 0.23, y: -0.38, depth: 1, spin: 1, flip: true },
  { kind: "cherry", size: 116, x: 0.3, y: 0.15, depth: 1, spin: -1, flip: true },
  { kind: "cran3", size: 56, x: 0.44, y: 0.04, depth: 1, spin: 1 },
  { kind: "elder1", size: 32, x: 0.18, y: 0.03, depth: 1, spin: 1 },
  { kind: "elder2", size: 28, x: -0.3, y: -0.22, depth: 1, spin: -1 },
  { kind: "elder3", size: 30, x: 0.38, y: 0.27, depth: 1, spin: 1 },
  { kind: "elder1", size: 26, x: -0.13, y: 0.3, depth: 1, spin: -1, flip: true },

  { kind: "cran2", size: 180, x: -0.42, y: -0.36, depth: 2, spin: 1 },
  { kind: "cherry2", size: 250, x: 0.42, y: 0.27, depth: 2, spin: -1 },
  { kind: "cran1", size: 150, x: 0.43, y: -0.4, depth: 2, spin: 1 },
];

/** Three sizes, because real fizz is mostly tiny with a few large bubbles among it. */
const BUBBLES = Array.from({ length: 132 }, (_, index) => {
  const large = index % 11 === 0;
  const medium = !large && index % 3 === 0;
  // Golden-ratio spacing spreads them evenly without looking like a grid.
  const spread = ((index * 0.618034) % 1) * 1.04 - 0.02;
  return {
    // Every fifth one rises around the bottle, like the stream from an opened drink.
    x: index % 5 === 0 ? 0.4 + ((index * 0.381966) % 1) * 0.2 : spread,
    phase: (index * 0.381966) % 1,
    size: large ? 38 + ((index * 7) % 30) : medium ? 14 + ((index * 5) % 18) : 4 + ((index * 3) % 8),
    speed: large ? 0.9 + ((index * 3) % 5) / 10 : medium ? 1.3 + ((index * 3) % 6) / 8 : 1.7 + ((index * 3) % 7) / 5,
    kind: large ? "large" : medium ? "medium" : "tiny",
    // Most stay behind the word; some pass in front of it, and a few in front of the bottle too.
    layer: index % 13 === 0 ? "over" : index % 3 === 1 ? "front" : "back",
  };
});

const MOTES = Array.from({ length: 44 }, (_, index) => ({
  angle: index * 2.39996,
  from: 0.55 + ((index * 0.381966) % 1) * 0.5,
  to: 0.2 + ((index * 0.618034) % 1) * 0.26,
  lag: ((index * 0.618034) % 1) * 0.08,
  size: 2 + ((index * 3) % 5),
  turn: index % 2 === 0 ? 1 : -1,
}));

const RINGS = [{ dashed: false }, { dashed: true }, { dashed: false }, { dashed: true }];

export function FlavourJourney({ entryPrice }: { entryPrice: string | null }) {
  const t = useTranslations("journey");
  const tHero = useTranslations("hero");
  const track = useRef<HTMLElement>(null);

  const renderFruit = (depth: Depth) => (
    <div
      aria-hidden
      className={`journey-particles journey-particles--centered journey-fruit-layer journey-fruit-layer--${depth}`}
    >
      {FRUIT.map((fruit, index) =>
        fruit.depth === depth ? (
          <span
            key={index}
            data-i={index}
            className="journey-fruit"
            style={{ "--size": fruit.size } as React.CSSProperties}
          >
            {/* Eager, because a lazy image inside a hidden layer would pop in as the scene starts. */}
            <Image src={FRUIT_IMAGE[fruit.kind]} alt="" loading="eager" sizes="(max-width: 1024px) 40vw, 24vw" />
          </span>
        ) : null,
      )}
    </div>
  );

  const renderBubbles = (layer: "back" | "front" | "over") => (
    <div aria-hidden className={`journey-particles journey-bubble-layer journey-bubble-layer--${layer}`}>
      {BUBBLES.map((bubble, index) =>
        bubble.layer === layer ? (
          <span
            key={index}
            data-i={index}
            className={`journey-bubble journey-bubble--${bubble.kind}`}
            style={{ width: bubble.size, height: bubble.size }}
          />
        ) : null,
      )}
    </div>
  );

  useEffect(() => {
    const root = track.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const all = <T extends HTMLElement>(selector: string) =>
      Array.from(root.querySelectorAll<T>(selector));
    const one = (selector: string) => root.querySelector<HTMLElement>(selector);

    const words = all(".journey-word > span");
    const scenes = all(".journey-scene");
    const fruits = all(".journey-fruit");
    const bubbles = all(".journey-bubble");
    const rings = all(".journey-ring");
    const motes = all(".journey-mote");
    const fruitLayers = all(".journey-fruit-layer");
    const bubbleLayers = all(".journey-bubble-layer");
    const focusLayers = all(".journey-focus-layer");
    const vignette = one(".journey-vignette");
    // Off-stage layers leave the page entirely, so all these elements cost nothing outside their scene.
    const show = (layers: HTMLElement[], on: boolean) => {
      for (const layer of layers) layer.style.display = on ? "block" : "none";
    };
    const bgSunset = one(".journey-bg--sunset");
    const bgFocus = one(".journey-bg--focus");
    const rays = one(".journey-rays");
    const glow = one(".journey-glow");
    const bottleEl = one(".journey-bottle-inner");
    const rail = one(".journey-rail-fill");

    let width = window.innerWidth;
    let height = window.innerHeight;
    let current = 0;
    // The sharp fruit as real 3D, once it has loaded. Until then, or without WebGL, the images show.
    let fruit3d: Fruit3D | null = null;
    let disposed = false;
    const poses = new Map<number, FruitPose>();
    const stage = one(".journey-stage");
    const sharpLayer = one(".journey-fruit-layer--1");
    const kind3d = (kind: FruitKind): Fruit3DKind =>
      kind.startsWith("cherry") ? "cherry" : kind.startsWith("cran") ? "cran" : "elder";
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
          // The text holds for its whole scene and swaps right at the boundary, so
          // there is no scroll position where nothing is readable.
          const shown =
            smooth(seg(scene.start - 0.012, scene.start + 0.012)) *
            (1 - smooth(seg(scene.end - 0.012, scene.end + 0.012)));
          caption.style.opacity = String(shown);
          caption.style.transform = `translate3d(0, ${(1 - shown) * 10}px, 0)`;
          caption.style.visibility = shown < 0.01 ? "hidden" : "visible";
        }
      });

      // Fruit flies in around the bottle. The sharp layers get pulled into it; the ones close to the camera fly past.
      const fruitOn = p < 0.4;
      show(fruitLayers, fruitOn);
      if (fruitOn) {
        const absorb = smooth(seg(0.27, 0.36));
        // Same size rule as the CSS: --size * max(0.66px, 0.15vmin).
        const unit = Math.max(0.66, 0.0015 * Math.min(width, height));
        for (const el of fruits) {
          const index = Number(el.dataset.i);
          const f = FRUIT[index];
          const lag = ((index * 0.618034) % 1) * 0.07;
          const arrive = easeOut(seg(0.015 + lag, 0.2 + lag));
          const push = 1 + DRIFT[f.depth] * seg(0.02, 0.34);
          const restX = lerp(f.x * 2.3, f.x, arrive) * push;
          const restY = lerp(f.y * 2.3 + (f.y < 0 ? -0.2 : 0.2), f.y, arrive) * push + Math.sin(p * 26 + index) * 0.012;
          const past = f.depth === 2;
          const x = lerp(restX, past ? restX * 2.2 : 0, absorb) * width;
          const y = lerp(restY, past ? restY * 2.2 : 0, absorb) * height;
          const scale = past ? 1 + absorb * 0.5 : 1 - absorb * 0.8;
          // A photo has its light baked in, so a full spin would give it away.
          const turn = `rotate(${f.spin * (10 + p * 50)}deg)`;
          const opacity = seg(0.015 + lag, 0.07 + lag) * (1 - absorb);
          el.style.opacity = String(opacity);
          el.style.transform = `translate3d(${x}px, ${y}px, 0) ${turn} scale(${f.flip ? -scale : scale}, ${scale})`;
          if (f.depth === 1) poses.set(index, { x, y, size: f.size * unit, scale, opacity });
        }
      }
      fruit3d?.update(poses, p, fruitOn && visible);

      // Bubbles only exist in the Fizzy scene; their height is tied to the scroll.
      const fizzOn = p > 0.28 && p < 0.72;
      show(bubbleLayers, fizzOn);
      if (fizzOn) {
        const fizz = smooth(seg(0.33, 0.4)) * (1 - smooth(seg(0.62, 0.68)));
        const lift = seg(0.3, 0.7);
        for (const el of bubbles) {
          const index = Number(el.dataset.i);
          const b = BUBBLES[index];
          const climb = (b.phase + lift * b.speed) % 1.2;
          const y = height * (1.1 - climb);
          const x = (b.x + Math.sin(climb * 9 + index) * 0.015) * width;
          el.style.opacity = String(fizz * 0.92);
          el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }
      }

      // Focus: the word snaps sharp, rings close in on the bottle, gold dust spirals towards it.
      const focusOn = p > 0.62;
      show(focusLayers, focusOn);
      const focusWord = words[2];
      if (focusWord) {
        const sharp = smooth(seg(0.665, 0.77));
        focusWord.style.filter = focusOn && sharp < 1 ? `blur(${(1 - sharp) * 22}px)` : "none";
      }
      if (focusOn) {
        if (vignette) vignette.style.opacity = String(0.7 * smooth(seg(0.68, 0.86)));
        rings.forEach((el, index) => {
          const close = easeOut(seg(0.665 + index * 0.03, 0.86 + index * 0.03));
          const size = lerp(2.5 + index * 0.45, 1 + index * 0.24, close);
          el.style.opacity = String(close * (0.6 - index * 0.1));
          el.style.transform = `scale(${size}) rotate(${p * (index % 2 ? -200 : 200)}deg)`;
        });
        const far = Math.max(width, height);
        const near = Math.min(width, height);
        for (const el of motes) {
          const index = Number(el.dataset.i);
          const m = MOTES[index];
          const draw = easeOut(seg(0.665 + m.lag, 0.96));
          const radius = lerp(m.from * far, m.to * near, draw);
          const angle = m.angle + p * 3 * m.turn;
          el.style.opacity = String(draw * (0.55 + 0.45 * Math.sin(p * 70 + index)));
          el.style.transform = `translate3d(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px, 0)`;
        }
      }

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
      fruit3d?.resize();
      wake();
    };

    // Nothing runs while the section is off screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (!visible) fruit3d?.update(poses, current, false);
        wake();
      },
      { rootMargin: "20% 0px" },
    );
    observer.observe(root);

    current = target();
    render(current);

    // Three.js is only fetched here, so pages and visitors that never reach the scene pay nothing.
    if (stage && sharpLayer && !(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData) {
      import("@/components/sections/journey-fruit-3d")
        .then(({ createFruit3D }) => {
          if (disposed) return;
          fruit3d = createFruit3D(
            stage,
            sharpLayer,
            FRUIT.flatMap((f, index) => (f.depth === 1 ? [{ index, kind: kind3d(f.kind), spin: f.spin }] : [])),
          );
          if (!fruit3d) return;
          root.classList.add("journey--3d");
          render(current);
        })
        .catch(() => {
          // Without WebGL the drawn images simply stay.
        });
    }

    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      disposed = true;
      fruit3d?.dispose();
      root.classList.remove("journey--3d");
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

        {renderBubbles("back")}
        {renderFruit(0)}

        {SCENES.map((scene) => (
          <p key={scene.key} aria-hidden className={`journey-word journey-word--${scene.key}`}>
            <span>{t(`${scene.key}.title`)}</span>
          </p>
        ))}

        <div aria-hidden className="journey-vignette journey-focus-layer" />
        <div aria-hidden className="journey-particles journey-particles--centered journey-focus-layer">
          {RINGS.map((ring, index) => (
            <svg key={index} className="journey-ring" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="49.5"
                pathLength={360}
                strokeDasharray={ring.dashed ? "0.6 3.4" : undefined}
              />
            </svg>
          ))}
          {MOTES.map((mote, index) => (
            <span
              key={index}
              data-i={index}
              className="journey-mote"
              style={{ width: mote.size, height: mote.size }}
            />
          ))}
        </div>

        {renderBubbles("front")}
        {renderFruit(1)}

        <div aria-hidden className="journey-glow" />

        <div className="journey-bottle">
          <div className="journey-bottle-inner">
            <Image src={bottle} alt={t("bottleAlt")} sizes="(max-width: 1024px) 40vw, 18rem" />
          </div>
        </div>

        {renderBubbles("over")}
        {renderFruit(2)}

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
