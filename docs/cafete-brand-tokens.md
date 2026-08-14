# CAFÉTÉ — Brand Design Tokens (starter)

Derived from the launch artwork. These are strong starting values — **fine-tune the exact
hex codes by color-picking your actual logo/flyer files** once you have the high-res assets.
Hand this file to Claude Code alongside the build outline.

---

## Color palette

| Token | Hex (starting) | Use |
|---|---|---|
| `sunset` (primary) | `#E8611A` | Primary brand orange — CTAs, highlights, accents |
| `sunset-deep` | `#C24310` | Hover/pressed states, gradients |
| `sunset-glow` | `#F59E42` | Lighter orange, backgrounds, sun rays |
| `charcoal` (ink) | `#1A1614` | Headlines, body text on light, dark sections |
| `charcoal-soft` | `#2E2824` | Secondary dark surfaces |
| `cream` (base) | `#FBF3E7` | Light background / paper |
| `coffee-cherry` | `#9E2B1E` | Deep red accent (coffee cherries) |
| `leaf` | `#5E7A3B` | Small natural/green accent (sparingly) |
| `white` | `#FFFFFF` | — |

Signature gradient (hero backgrounds): `sunset-glow → sunset → sunset-deep`, radial from top.

**Contrast:** charcoal on cream and white-on-sunset both pass AA. Avoid sunset text on cream.

---

## Typography

- **Display / logo feel:** a bold, energetic font for big headlines (e.g. a heavy condensed
  or a characterful display face). The logo itself is a graffiti-style handwritten wordmark —
  use it as an image asset, don't try to reproduce it in a webfont.
- **Body / UI:** a clean, geometric sans (e.g. Inter, Geist, or similar) for readability and a
  modern feel that contrasts the playful headlines.
- **Pairing rule:** big expressive headlines + calm neutral body = the energy stays on-brand
  without hurting legibility. All-caps for section labels (as on the flyer: "LAUNCH EVENT").

Suggested scale (rem): 3.5 / 2.5 / 2 / 1.5 / 1.25 / 1 / 0.875.

---

## Spacing, radius, shadow

- Spacing scale (Tailwind default is fine): 4, 8, 12, 16, 24, 32, 48, 64, 96 px.
- Radius: `sm 6px`, `md 12px`, `lg 20px`, `full 9999px` (pill buttons suit the brand).
- Shadow: soft, warm-tinted — `0 8px 30px rgba(194,67,16,0.15)` for cards on light bg.

---

## Tailwind config snippet

```ts
// tailwind.config.ts (theme.extend)
colors: {
  sunset:        { DEFAULT: '#E8611A', deep: '#C24310', glow: '#F59E42' },
  charcoal:      { DEFAULT: '#1A1614', soft: '#2E2824' },
  cream:         '#FBF3E7',
  cherry:        '#9E2B1E',
  leaf:          '#5E7A3B',
},
borderRadius: { sm: '6px', md: '12px', lg: '20px' },
boxShadow: { brand: '0 8px 30px rgba(194,67,16,0.15)' },
```

## CSS variables (if you prefer)

```css
:root {
  --sunset: #E8611A; --sunset-deep: #C24310; --sunset-glow: #F59E42;
  --charcoal: #1A1614; --charcoal-soft: #2E2824;
  --cream: #FBF3E7; --cherry: #9E2B1E; --leaf: #5E7A3B;
  --radius-md: 12px; --shadow-brand: 0 8px 30px rgba(194,67,16,0.15);
}
```

---

## Homepage section plan (build in this order)

1. **Hero** — full-bleed sunset gradient, bottle render, wordmark, one-line pitch, primary CTA
   ("Jetzt bestellen" / "Order now") + secondary ("Launch Event"). Mobile-first.
2. **The three pillars** — Fruity · Fizzy · Focus, icon + one line each (mirrors the flyer strip).
3. **Product story** — what coffee fruit / cascara is, "naturally energizing", brewed & bottled
   in Switzerland. Image-led.
4. **Shop teaser** — the bottle + pack selector (1/6/12/24) → links to /shop.
5. **Launch event band** — date, venue, add-to-calendar / QR, RSVP.
6. **Newsletter / footer** — email capture, social, language switcher, legal links.

Keep each section a self-contained component so you can reorder and restyle fast in the browser.
```
