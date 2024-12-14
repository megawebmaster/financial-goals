FROM node:20-alpine AS deps
LABEL authors="Amadeusz Starzykiewicz"

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS deps-prod
LABEL authors="Amadeusz Starzykiewicz"

WORKDIR /app

# Drop dev dependencies
RUN npm ci --omit=dev

FROM node:20-alpine AS builder
LABEL authors="Amadeusz Starzykiewicz"

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
# Copy sources
COPY . .

# Build package
RUN npm run build && npm cache clean --force

FROM node:20-alpine AS runner
LABEL authors="Amadeusz Starzykiewicz"

# Link SSL
RUN sh -c '[ ! -e /lib/libssl.so.3 ] && ln -s /usr/lib/libssl.so.3 /lib/libssl.so.3 || echo "Link already exists"'

RUN addgroup --system --gid 1001 remix
RUN adduser --system --uid 1001 remix
USER remix

ENV PORT 3000
COPY --chmod=0755 docker/entrypoint.sh /docker-entrypoint.sh

WORKDIR /app

# Copy dependencies
COPY --from=deps-prod --chown=remix:remix /app/package*.json ./
COPY --from=deps-prod --chown=remix:remix /app/node_modules ./node_modules
COPY --from=builder --chown=remix:remix /app/prisma ./prisma
RUN npx -y prisma generate

# Copy built package
COPY --from=builder --chown=remix:remix /app/build ./build
COPY --from=builder --chown=remix:remix /app/public ./public

EXPOSE $PORT
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["npm", "start"]
