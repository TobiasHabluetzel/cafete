# CAFÉTÉ — Claude Code Kickoff Prompt

**How to use:** In VS Code, open an empty project folder, start Claude Code, and paste the prompt
below as your first message. Best results: also drag `cafete-website-outline.md` and
`cafete-brand-tokens.md` into the project so Claude Code can read them — the prompt references
them but also inlines the essentials so it works even on its own.

---

## ▶ PASTE THIS INTO CLAUDE CODE

You are helping me build the marketing website + single-product webshop for **CAFÉTÉ**, a Swiss
sparkling coffee-fruit (cascara) refreshment drink. Company is Zurich-based. If the files
`cafete-website-outline.md` and `cafete-brand-tokens.md` are present in this project, read them
first — they are the source of truth. Build in small, reviewable steps and pause after each phase
so I can check the browser before you continue.

**Stack (use exactly this):**
- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- next-intl for i18n — locales `de` (default) and `en`, locale-prefixed routes (`/de`, `/en`)
- Stripe for payments (card + TWINT) — server-side only, secrets from `.env.local`
- Deploy target: Vercel. Mobile-first, accessible (AA contrast).

**Brand tokens — put these in `tailwind.config.ts` theme.extend and use them everywhere:**
```ts
colors: {
  sunset:   { DEFAULT: '#E8611A', deep: '#C24310', glow: '#F59E42' },
  charcoal: { DEFAULT: '#1A1614', soft: '#2E2824' },
  cream:    '#FBF3E7',
  cherry:   '#9E2B1E',
  leaf:     '#5E7A3B',
},
borderRadius: { sm: '6px', md: '12px', lg: '20px' },
boxShadow: { brand: '0 8px 30px rgba(194,67,16,0.15)' },
```
Headline font: a bold expressive display face; body font: a clean geometric sans (Inter/Geist).
All-caps for section labels. The CAFÉTÉ logo will be supplied as an image asset later — use a
placeholder wordmark image for now, don't recreate it in a font.

**Copy language:** Swiss German spelling for all DE text (use "ss", never "ß"). Put ALL user-facing
strings in `messages/de.json` and `messages/en.json` — no hardcoded text in components. Use
realistic placeholder copy I can replace this afternoon.

**Do this in phases. Stop after each and tell me what to review.**

**Phase 0 — Scaffold:**
Create a Next.js + TS + Tailwind project. Add next-intl with `de` (default) and `en`,
locale-prefixed routing, and a `messages/de.json` + `messages/en.json`. Wire up the brand tokens
and fonts. Add shadcn/ui. Create a responsive Header (with language switcher) and Footer used by a
shared `[locale]/layout.tsx`. Confirm `/de` and `/en` render. Add a `.env.local.example` listing
`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`.

**Phase 1 — Homepage + marketing pages:**
Build the homepage as separate section components in this order: (1) Hero — full-bleed sunset
gradient, bottle image placeholder, wordmark, one-line pitch, primary CTA "Jetzt bestellen" /
"Order now" + secondary "Launch Event"; (2) Three pillars — Fruity · Fizzy · Focus, icon + one
line each; (3) Product story — coffee fruit / cascara, "naturally energizing", brewed & bottled in
Switzerland; (4) Shop teaser — bottle + pack selector linking to /shop; (5) Launch event band —
Sat 19 Sept 2026, 13–17:00, Restaurant Osso, Zollstrasse 121, 8005 Zürich, with add-to-calendar
and an RSVP form; (6) Newsletter capture in the footer. Then stub the routes: `produkt`,
`ueber-uns`, `kontakt`, `faq`, and legal pages `impressum`, `agb`, `datenschutz`, `widerruf`
(with clearly-marked placeholder legal text I'll replace).

**Phase 2 — Shop + checkout:**
Build `/shop` with the single CAFÉTÉ product and a pack-size selector (1 / 6 / 12 / 24 bottles),
a cart, and checkout. Use Stripe Checkout (hosted) for the MVP: a `POST /api/checkout` route
handler that creates a Checkout Session from Stripe Price IDs (read IDs from env/config, don't
hardcode), and a `POST /api/webhook` route handler that verifies the signature and, on
`checkout.session.completed`, triggers an order-confirmation email via Resend. Add a
`/bestellung/[id]` thank-you page. Enable shipping address collection and note where Stripe Tax
(Swiss MwSt, reduced foodstuff rate) gets configured. No database needed — Stripe is the source of
truth for products, prices, and orders.

**Phase 3 — Polish:**
SEO metadata + Open Graph images, `hreflang` for de/en, sitemap, robots, privacy-friendly
analytics hook, accessibility pass, and a README documenting env vars and how to run/deploy.

Start with Phase 0 now. Ask me if any decision is genuinely blocking; otherwise use sensible
defaults and keep going.

---

## After it scaffolds — your review loop

- Run `npm run dev`, open `/de` and `/en`, check mobile width first.
- Give feedback per section: "hero taller", "tighter spacing", "CTA above the fold", etc.
- This afternoon: replace `messages/de.json`/`en.json` copy + drop real images into `/public`.
- Before shipping the shop: create the Stripe Products/Prices, add real keys to `.env.local`,
  set shipping rates + free-shipping threshold, and confirm VAT handling with your accountant.
