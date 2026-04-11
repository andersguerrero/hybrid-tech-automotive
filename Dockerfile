FROM node:18-alpine AS base

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

# Railway injects service env vars as build args
# NOTE: DATABASE_URL is intentionally NOT included here — the DB is on
# Railway's internal network which is unreachable during Docker build.
# prisma db push runs at container startup instead (see entrypoint).
ARG NEXT_PUBLIC_BUSINESS_PHONE
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_SENTRY_DSN

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# su-exec: lightweight tool to drop root privileges (like gosu for Alpine)
RUN apk add --no-cache su-exec

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# sharp is required for Next.js image optimization in standalone mode
RUN npm install --os=linux --cpu=x64 sharp@0.33.2

# Create uploads directory (Railway volume will mount here at runtime)
RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

# Entrypoint fixes volume permissions then drops to nextjs user
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Do NOT set USER nextjs here — entrypoint starts as root to fix
# Railway volume permissions, then drops to nextjs via su-exec
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

ENTRYPOINT ["/app/docker-entrypoint.sh"]
