FROM node:22-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args for env vars needed at build time
ARG YOUTUBE_API_KEY=""
ARG COINGECKO_API_KEY=""
ARG OPENROUTER_API_KEY=""

ENV YOUTUBE_API_KEY=$YOUTUBE_API_KEY
ENV COINGECKO_API_KEY=$COINGECKO_API_KEY
ENV OPENROUTER_API_KEY=$OPENROUTER_API_KEY

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
