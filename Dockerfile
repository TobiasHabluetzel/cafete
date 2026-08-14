# syntax=docker/dockerfile:1

# CAFÉTÉ — production image for Railway (or any Docker host).
# Alpine/musl is deliberate: on glibc, next/image + sharp need extra allocator
# tuning to avoid runaway memory. See Next.js self-hosting docs.

# ---------- deps ----------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---------- build ---------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Public (NEXT_PUBLIC_*) vars are inlined at build time, so they must be
# present here — Railway passes them through as build args. The defaults matter:
# an unset ARG expands to an empty string, and `ENV X=""` is worse than unset
# because `??` fallbacks in the app no longer kick in.
ARG NEXT_PUBLIC_SITE_URL="https://drink-cafete.ch"
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------- runtime ------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Bind to all interfaces or Railway's proxy cannot reach the container.
ENV HOSTNAME=0.0.0.0
ENV PORT=8080

RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

# `output: "standalone"` emits a self-contained server plus only the traced
# dependencies; static assets and public/ are copied alongside it.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 8080

# Railway injects PORT; server.js reads PORT and HOSTNAME from the environment.
CMD ["node", "server.js"]
