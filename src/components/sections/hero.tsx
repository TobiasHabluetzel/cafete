import Image from "next/image";
import { useTranslations } from "next-intl";
import { ViewTransition } from "react";

import { ctaClass } from "@/components/brand/cta-button";
import { Link } from "@/i18n/navigation";

import bottle from "../../../public/bottle-transparent.png";

/** Fixed table: the server and the first client render must produce the same markup. */
const BUBBLES = [
  { left: 6, size: 14, duration: 9, delay: -2 },
  { left: 17, size: 26, duration: 13, delay: -8 },
  { left: 31, size: 10, duration: 8, delay: -5 },
  { left: 44, size: 20, duration: 11, delay: -1 },
  { left: 58, size: 12, duration: 7, delay: -4 },
  { left: 69, size: 32, duration: 14, delay: -10 },
  { left: 81, size: 16, duration: 10, delay: -6 },
  { left: 93, size: 22, duration: 12, delay: -3 },
];

/**
 * The opening poster: the headline as huge type with the bottle beside it, then
 * one sentence and one button. Fruity, Fizzy and Focus get their moment right below. It runs straight into the scroll story.
 * The words and bottle arrive on load and drift apart on the way out; both are
 * progressive enhancements, and the resting state is fully visible.
 */
export function Hero({ entryPrice }: { entryPrice: string | null }) {
  const t = useTranslations("hero");
  const tJourney = useTranslations("journey");
  const words = t("headline").split("|");

  return (
    <section className="hero">
      <div aria-hidden className="hero-rays-frame">
        <div className="hero-rays rays animate-spin-rays" />
      </div>

      <div aria-hidden className="hero-bubbles">
        {BUBBLES.map((bubble) => (
          <span
            key={bubble.left}
            className="hero-bubble"
            style={{
              left: `${bubble.left}%`,
              width: bubble.size,
              height: bubble.size,
              animationDuration: `${bubble.duration}s`,
              animationDelay: `${bubble.delay}s`,
            }}
          />
        ))}
      </div>

      <h1 className="hero-slogan" aria-label={words.join(" ")}>
        {words.map((word, index) => (
          <span key={word} aria-hidden className="contents">
            <span className="hero-word">
              <span className="hero-word-inner">{word}</span>
            </span>{" "}
            {/* Five lines on a phone, three on a wide screen. */}
            {index === 1 || index === 3 ? <br className="hidden lg:block" /> : null}
          </span>
        ))}
      </h1>

      <div className="hero-bottle">
        <div className="hero-bottle-rise">
          <div className="hero-bottle-scroll">
            <ViewTransition name="cafete-bottle" share="bottle-morph" default="none">
              <Image
                src={bottle}
                alt={tJourney("bottleAlt")}
                priority
                sizes="(max-width: 1024px) 50vw, 24rem"
              />
            </ViewTransition>
          </div>
        </div>
      </div>

      <div className="hero-foot">
        <p className="hero-title">{t("subtitle")}</p>
        <Link
          href="/shop"
          className={ctaClass({ variant: "dark", size: "lg", className: "mt-4 w-full lg:w-auto" })}
        >
          {entryPrice ? t("ctaPrimaryWithPrice", { price: entryPrice }) : t("ctaPrimary")}
        </Link>
      </div>
    </section>
  );
}
