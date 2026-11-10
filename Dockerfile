# Imagine de producție (Next.js standalone + Payload). NEVERIFICAT încă într-un daemon Docker — vezi docs/RUNBOOK.md.
# Build-ul pre-randează pagini din baza de date: DATABASE_URL trebuie să fie accesibilă la build
#   docker build --network host --build-arg DATABASE_URL=postgresql://... --build-arg NEXT_PUBLIC_SITE_URL=https://... -t dp-web .
FROM node:22.23.4-alpine AS base
RUN apk add --no-cache libc6-compat && corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
ARG DATABASE_URL
ARG NEXT_PUBLIC_SITE_URL
ARG PAYLOAD_SECRET=build-time-placeholder
ENV DATABASE_URL=$DATABASE_URL NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL PAYLOAD_SECRET=$PAYLOAD_SECRET NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:22.23.4-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 MEDIA_DIR=/app/media
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs && mkdir -p /app/media .next && chown -R nextjs:nodejs /app
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
VOLUME ["/app/media"]
# Migrațiile rulează automat la pornire (prodMigrations în payload.config.ts).
CMD ["node", "server.js"]
