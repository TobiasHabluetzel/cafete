# CAFÉTÉ — drink-cafete.ch

Marketing site + single-product webshop for CAFÉTÉ, a Swiss sparkling
coffee-fruit (cascara) refreshment. Bilingual (DE default / EN), Zurich-based.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router) + TypeScript, Turbopack |
| Styling | Tailwind CSS v4 + shadcn/ui (Base UI) |
| i18n | next-intl 4 — `de` (default) / `en`, locale-prefixed + localized slugs |
| Payments | Stripe Checkout (card + TWINT) — Phase 2 |
| Email | Resend — Phase 2 |
| Hosting | Railway (Docker, `output: "standalone"`) — EU West region |

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in as phases land
npm run dev                        # http://localhost:3000 → redirects to /de
```

`npm run build` · `npm run lint` · `npx tsc --noEmit`

## Project layout

```
src/
├─ app/
│  ├─ icon.svg                 # favicon (placeholder — regenerate from real logo)
│  ├─ globals.css              # Tailwind v4 theme + CAFÉTÉ brand tokens
│  └─ [locale]/
│     ├─ layout.tsx            # root layout: html lang, fonts, header/footer
│     ├─ page.tsx              # homepage
│     └─ not-found.tsx
├─ components/
│  ├─ brand/                   # Wordmark, SloganBanner, CtaButton
│  ├─ layout/                  # SiteHeader, SiteFooter, LocaleSwitcher, NewsletterForm
│  ├─ sections/                # homepage sections (Hero, …)
│  └─ ui/                      # shadcn/ui primitives
├─ config/site.ts              # domain, contact, addresses, launch event, nav
├─ i18n/                       # routing (locales + slug map), navigation, request config
├─ lib/fonts.ts                # Baloo 2 (display) + Geist (body/mono)
└─ proxy.ts                    # next-intl locale middleware (Next 16 calls it "proxy")
messages/{de,en}.json           # ALL user-facing copy — no hardcoded strings
docs/                           # brief, brand tokens, content pack (source of truth)
public/                         # brand assets (currently placeholders — see public/README.md)
```

## Brand tokens

Tailwind v4 keeps the theme in CSS, so the tokens from the brief live in
`src/app/globals.css` under `@theme` instead of `tailwind.config.ts`. The class
names are unchanged: `bg-sunset`, `bg-sunset-deep`, `text-gold-soft`,
`bg-charcoal`, `bg-cream`, `rounded-lg`, `shadow-brand`.

Palette is **orange / red / gold / charcoal / cream — no green anywhere.**
Extra brand utilities: `bg-sunburst` (hero radial gradient), `bg-sunset-gradient`,
`label-caps` (all-caps section label).

## i18n

- Copy lives only in `messages/de.json` and `messages/en.json`.
- German uses **Swiss spelling — "ss", never "ß"**.
- Routes are locale-prefixed *and* slug-localized via `src/i18n/routing.ts`:
  `/de/produkt` ↔ `/en/product`, `/de/warenkorb` ↔ `/en/cart`, etc. Internal
  hrefs always use the German slug; next-intl resolves the public URL.
- Import `Link`, `useRouter`, `usePathname` from `@/i18n/navigation` (never from
  `next/link` / `next/navigation`) so locale and slugs are handled.

## Environment variables

See `.env.local.example`. Summary:

| Var | Phase | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | 0 | Canonical origin, used for `metadataBase` |
| `STRIPE_SECRET_KEY` | 2 | Server only |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | 2 | |
| `STRIPE_WEBHOOK_SECRET` | 2 | From the Stripe webhook endpoint / `stripe listen` |
| `STRIPE_PRICE_PACK_{1,6,12,24}` | 2 | Price IDs — never hardcode in source |
| `RESEND_API_KEY`, `RESEND_FROM` | 2 | Order + RSVP confirmations |

## Deploying to Railway

The repo ships a multi-stage [`Dockerfile`](Dockerfile) and [`railway.json`](railway.json),
so Railway builds from Docker rather than guessing via Nixpacks.

**One-time setup**

1. Railway → New Project → Deploy from GitHub repo → `TobiasHabluetzel/cafete`.
   It picks up `railway.json` and builds the Dockerfile automatically.
2. Set the region to **EU West** (project Settings → the service → Region) —
   the audience is Swiss.
3. Service → Settings → Networking → **Generate Domain** to get a
   `*.up.railway.app` URL, then add `drink-cafete.ch` as a custom domain and
   point the DNS CNAME at the value Railway shows.
4. Variables (see the table above). `NEXT_PUBLIC_*` vars are inlined at
   **build** time, so they are also declared as `ARG`s in the Dockerfile —
   changing one requires a rebuild, not just a restart.

**Things that will bite otherwise**

- The container binds `HOSTNAME=0.0.0.0` and reads Railway's injected `PORT`.
  Do **not** set `HOSTNAME` in Railway's variables — binding to localhost makes
  the healthcheck fail and the container get killed.
- Healthcheck path is `/api/health`. `/` returns a 307 to `/de`, so it is not a
  valid healthcheck target.
- Base image is Alpine (musl) on purpose: on glibc, `next/image` + `sharp` need
  extra allocator tuning to avoid runaway memory. `sharp` is an explicit
  dependency so the standalone trace includes it.
- Railway serves the container directly with no CDN in front. Every page here
  is prerendered, so it is fast enough — but if EU/CH latency or bandwidth cost
  matters later, put Cloudflare in front of the custom domain.
- ISR/data-cache lives in the container filesystem and is lost on redeploy. Not
  an issue today (no revalidating fetches); revisit if a CMS is added.

**Local verification of the production image**

```bash
docker build --build-arg NEXT_PUBLIC_SITE_URL=https://drink-cafete.ch -t cafete .
docker run --rm -p 8099:8080 -e PORT=8080 cafete
curl localhost:8099/api/health   # {"status":"ok"}
```

## Build phases

- **Phase 0 — done:** scaffold, i18n, brand tokens, fonts, header + footer, hero.
- **Phase 1:** homepage sections (coffee fruit, four pillars, story, shop teaser,
  launch-event band with RSVP + add-to-calendar) and the remaining routes
  including placeholder legal pages.
- **Phase 2:** shop, pack selector (1/6/12/24), cart, Stripe Checkout,
  webhook → Resend confirmation, `/bestellung/[id]` thank-you page, Stripe Tax.
- **Phase 3:** SEO/OG images, `hreflang`, sitemap, robots, analytics, a11y pass.

## Before going live

- Replace the placeholder assets in `public/` with the designer's files.
- Replace the placeholder legal text (Impressum / AGB / Datenschutz / Widerruf).
- Confirm the registered company name + UID for the Impressum.
- Create the Stripe Product/Prices, set shipping rates and free-shipping
  threshold, and confirm Swiss MwSt handling (reduced foodstuff rate) with the
  Treuhänder.
- Review the EN copy — it is a draft translation (see `docs/cafete-content-pack.md`).
