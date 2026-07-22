# ───────────────────────────────────────────────────────────────────────────────
# BUILD STAGE
# ───────────────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

ENV HUSKY=0

# Copy dependency manifests
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy application source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build frontend + backend
RUN npm run build


# ───────────────────────────────────────────────────────────────────────────────
# RUNTIME STAGE
# ───────────────────────────────────────────────────────────────────────────────
FROM node:24-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000
ENV HUSKY=0

# Create non-root user
RUN addgroup -S nodejs && \
    adduser -S uprise -G nodejs

# Copy package metadata
COPY package*.json ./

# Copy installed dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy Prisma schema & migrations
COPY --from=builder /app/prisma ./prisma

# Copy backend build output
COPY --from=builder /app/dist/server ./dist/server

# Copy frontend build output
COPY --from=builder /app/dist ./dist

RUN chown -R uprise:nodejs /app

USER uprise

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server/index.js"]
