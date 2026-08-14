# CAFÉTÉ — Website & Webshop Build Outline

A project brief and technical outline for building the CAFÉTÉ marketing site + webshop.
Written to be used directly as context for Claude Code in VS Code.

---

## 1. Project summary

Build a bilingual (German / English) marketing website with an integrated single-product
webshop for **CAFÉTÉ**, a Swiss sparkling coffee-fruit (cascara) refreshment drink.
Swiss, Zurich-based company. Card + TWINT checkout. Custom-coded in Next.js.

**Brand cues (from the launch artwork):** warm orange/sun aesthetic, coffee-cherry imagery,
handwritten logo, pillars *Fruity · Fizzy · Focus*, "Naturally energizing", "Brewed & bottled
in Switzerland". Keep the site visually consistent with this.

**Launch anchor:** Launch event Sat 19 Sept 2026, 13–17:00, Restaurant Osso, Zollstrasse 121,
8005 Zürich. The site should support pre-launch (teaser + event RSVP/calendar) and post-launch
(full shop) states.

---

## 2. Recommended tech stack

| Layer | Recommendation | Why |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | Great for marketing + shop, SSR/SEO, works cleanly with Claude Code. |
| Styling | **Tailwind CSS** (+ optional shadcn/ui) | Fast to match the bold brand look; consistent components. |
| i18n | **next-intl** | Locale-prefixed routes (`/de`, `/en`), typed message catalogs. |
| Payments | **Stripe** (see §5) | Native **TWINT + card** support, incl. recurring; best DX and docs. |
| Content | **MDX / local JSON** (start), optional **Sanity** later | Single product = content-in-repo is enough for MVP; add a CMS only if non-devs must edit. |
| Transactional email | **Resend** (or Postmark) | Order confirmations, event RSVP confirmations. |
| Hosting | **Vercel** | Zero-config Next.js, preview deploys, edge for speed. Region eu-central. |
| Analytics | **Plausible** or Vercel Analytics | Privacy-friendly, revFADP-appropriate, no cookie banner needed. |
| Forms/RSVP | Next.js Route Handler → Resend/DB | For the launch event RSVP + newsletter capture. |

> Alternative if you'd rather not manage product/inventory logic in code: keep this exact
> frontend but swap the shop layer for **Shopify (headless, Storefront API)**. More monthly
> cost, less code. For a single product with pack sizes, **Stripe-only is simpler and cheaper.**

---

## 3. Payment recommendation (you asked me to choose)

**Use Stripe.** For a single-product Swiss shop it's the best balance of TWINT support,
developer experience, and speed to launch.

- **TWINT + cards (Visa/Mastercard/Amex)** are supported natively; Stripe also supports Apple
  Pay / Google Pay and now TWINT for recurring — room to add a subscription later.
- **MVP path — Stripe Checkout (hosted):** you create Products/Prices in Stripe, redirect to a
  Stripe-hosted checkout page. TWINT + card work out of the box, PCI scope minimal, shipping
  address + Swiss VAT handled by Stripe Tax. Fastest to launch.
- **Custom path — Stripe Payment Element:** embed checkout in your own branded page for full
  design control. More code; do this in a phase 2 if the hosted page feels off-brand.
- Enable **Stripe Tax** for Swiss MwSt (foodstuffs are the reduced VAT rate — currently 2.6%).
  Note the CHF 100k turnover VAT-registration threshold; below it you may not charge VAT yet —
  confirm with your Treuhänder/accountant.

**Swiss-native alternatives (note for later, not needed for MVP):** Payrexx (easiest Swiss
option, strong TWINT), Datatrans or Wallee (more enterprise). Choose one of these instead of
Stripe only if you want a Swiss acquirer/lower local fees and are OK with more integration work.

---

## 4. Information architecture (site map)

Locale-prefixed: every route exists under `/de/...` and `/en/...` (DE is the default locale).

```
/                     → redirect to /de (or geo/Accept-Language based)
/de                   Home / landing (hero, product story, Fruity·Fizzy·Focus, CTA to shop)
  /produkt            Product detail (taste, cascara story, nutrition, energizing claim)
  /shop               Shop — the product with pack-size selector (1 / 6 / 12 / 24)
  /warenkorb          Cart
  /checkout           Checkout (or redirect to Stripe Checkout)
  /bestellung/[id]    Order confirmation / thank-you
  /event              Launch event page (date, venue, map, RSVP, add-to-calendar / QR)
  /ueber-uns          About / story / "Brewed & bottled in Switzerland"
  /kontakt            Contact
  /faq                FAQ (shipping, storage, caffeine content, returns)
  /impressum          Imprint (legally required in CH)
  /agb                Terms & conditions
  /datenschutz        Privacy policy (revFADP / nDSG)
  /widerruf           Returns / revocation policy
/en/...               Same tree with English slugs (product, shop, cart, checkout, event, about…)
```

Keep a `slugs` map per locale so DE and EN can have localized URLs while sharing one page component.

---

## 5. Shop / data model

Single product, multiple pack sizes. Two clean options:

**Option A — Stripe as source of truth (recommended for MVP):**
- One Stripe **Product** = "CAFÉTÉ Coffee Fruit".
- One **Price** per pack size (1, 6, 12, 24) — or one unit price + quantity.
- Frontend reads prices from Stripe (or a cached JSON), builds the pack selector, creates a
  Checkout Session.
- No database required to launch; Stripe stores orders/customers.

**Option B — light local catalog:**
```ts
Product { id, name, description_i18n, images[], caffeine, volume_ml }
Variant { id, packSize: 1|6|12|24, priceCHF, sku, stripePriceId, inStock }
```
Add a DB (e.g. Vercel Postgres / Supabase) only when you need inventory, order history, or a
newsletter list you own.

**Pricing/packaging to define with you:** unit price, per-pack discounts (e.g. 24 cheaper per
bottle), shipping tiers (flat CHF X, free over CHF Y), CH-only vs EU shipping, deposit/Pfand?

---

## 6. i18n approach

- `next-intl` with `messages/de.json` and `messages/en.json`.
- **DE is default**, EN secondary. Language switcher in header, persists via URL prefix.
- **Swiss German spelling conventions** throughout the DE copy (use "ss", never "ß").
- Localize: UI strings, product copy, legal pages, currency/number formatting (CHF, de-CH),
  email templates, and metadata (`hreflang` tags for SEO).

---

## 7. Legal & compliance (Switzerland) — don't skip

- **Impressum** (imprint): company name, address, contact, UID if registered.
- **AGB** (terms of sale): delivery, prices incl. MwSt, right of withdrawal, warranty.
- **Datenschutzerklärung**: compliant with the revised Swiss FADP (nDSG); if you sell/ship to
  the EU, also GDPR-aware.
- **MwSt/VAT**: reduced rate for foodstuffs (currently 2.6%); handle via Stripe Tax; confirm
  registration threshold with your accountant.
- **Cookie/consent**: use privacy-friendly analytics to avoid a heavy banner; add a banner only
  if you introduce tracking/marketing cookies.
- **Food labelling**: ingredients, nutrition, caffeine content per Swiss LMIV/food-info rules
  (relevant on product page + label).
- **Shipping/returns**: define carrier (Swiss Post), rates, and a clear Widerruf policy.

---

## 8. Suggested repo structure

```
cafete-web/
├─ app/
│  ├─ [locale]/
│  │  ├─ layout.tsx
│  │  ├─ page.tsx              # home
│  │  ├─ shop/page.tsx
│  │  ├─ produkt/page.tsx
│  │  ├─ event/page.tsx
│  │  ├─ (legal)/impressum|agb|datenschutz|widerruf/page.tsx
│  │  └─ bestellung/[id]/page.tsx
│  ├─ api/
│  │  ├─ checkout/route.ts     # create Stripe Checkout Session
│  │  ├─ webhook/route.ts      # Stripe webhook (order fulfilled → email)
│  │  └─ rsvp/route.ts         # launch event RSVP
├─ components/                 # Hero, PackSelector, Nav, Footer, LangSwitcher…
├─ content/                    # MDX/JSON product + legal copy per locale
├─ messages/ de.json en.json
├─ lib/ stripe.ts i18n.ts email.ts
├─ public/ (brand assets, bottle renders, OG images)
├─ styles/ (tailwind, brand tokens: sunset orange, charcoal, cream)
└─ .env.local  (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY…)
```

---

## 9. Build phases / milestones

**Phase 0 — Setup:** Next.js + TS + Tailwind + next-intl scaffold; brand tokens & fonts; deploy
skeleton to Vercel with `/de` `/en` routing.

**Phase 1 — Marketing site:** Home, Product, About, Event (with add-to-calendar + QR), Contact,
FAQ, all legal pages. Fully bilingual. This alone is enough to go live before the Sept 19 launch.

**Phase 2 — Shop:** Stripe products/prices, pack selector, cart, Stripe Checkout, webhook →
confirmation email, order thank-you page. VAT via Stripe Tax. Shipping options.

**Phase 3 — Polish:** SEO/OG images, `hreflang`, sitemap, analytics, accessibility pass,
performance, newsletter capture, optional custom (embedded) checkout.

**Phase 4 — Optional later:** subscription (recurring TWINT), CMS for non-dev editing, inventory,
multi-flavor catalog.

---

## 10. Kickoff prompt for Claude Code

Paste this as your first instruction in VS Code:

> Scaffold a Next.js (App Router, TypeScript) project called `cafete-web` with Tailwind CSS,
> next-intl (locales `de` default and `en`, locale-prefixed routes), and shadcn/ui. Set up the
> route tree from the outline (home, produkt, shop, event, about, contact, faq, and legal pages
> impressum/agb/datenschutz/widerruf) with placeholder bilingual content in `messages/de.json`
> and `messages/en.json` using Swiss German spelling (ss, not ß). Add brand design tokens: a
> sunset-orange primary, charcoal, and cream, with a bold display font for headings. Create a
> responsive header with a language switcher and a footer. Stub the shop with a pack-size
> selector (1/6/12/24) and a `/api/checkout` route handler that creates a Stripe Checkout Session,
> plus a `/api/webhook` handler. Don't hardcode secrets — read from `.env.local`. Deploy-ready
> for Vercel.

---

## 11. Open decisions to confirm before/while building

- Domain name (e.g. cafete.ch / drinkcafete.com)?
- Final pricing per pack + shipping rates + free-shipping threshold?
- Ship CH-only at launch, or CH + EU?
- Stripe (my recommendation) vs a Swiss gateway (Payrexx/Datatrans/Wallee)?
- Do you want a newsletter/RSVP list you own (needs a small DB) or is Stripe/email enough?
- Who edits copy after launch — you (code/MDX is fine) or a non-dev (then add a CMS)?
