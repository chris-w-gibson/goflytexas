# Node 20: sharp >= 0.34 requires node >= 20.9 (npm warned EBADENGINE on 18 and
# the optimizer then failed to load it); Node 18 is also end-of-life.
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* vars must be present at build time (Next.js inlines them into the
# client bundle). Railway passes service variables as Docker build-args; declare
# them here so `next build` sees them. Runtime-only server vars don't need this.
ARG NEXT_PUBLIC_GADS_CONV_LEAD
ARG NEXT_PUBLIC_GADS_CONV_CALL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_GADS_CONV_LEAD=$NEXT_PUBLIC_GADS_CONV_LEAD \
    NEXT_PUBLIC_GADS_CONV_CALL=$NEXT_PUBLIC_GADS_CONV_CALL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Belt and braces for the image optimizer: copy sharp and its @img binaries
# from the deps stage (same alpine base, so the linuxmusl variants) and point
# Next at them, so a change in Next's standalone tracing can't silently turn
# /_next/image back into a pass-through (it did on 2026-09-05).
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/sharp ./node_modules/sharp
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/@img ./node_modules/@img
ENV NEXT_SHARP_PATH=/app/node_modules/sharp

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
