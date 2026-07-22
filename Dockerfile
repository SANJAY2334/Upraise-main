# ───────────────────────────────────────────────────────────────────────────────
# BUILD STAGE
# ───────────────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

# Disable Husky during Docker builds
ENV HUSKY=0

# Copy dependency manifests
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy application source
COPY . .

# Build application
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

# Copy package.json (useful for npm/npx metadata)
COPY package*.json ./

# Copy production-ready node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy Prisma schema
COPY --from=builder /app/prisma ./prisma

# Copy compiled backend
COPY --from=builder /app/server/dist ./server/dist

# Copy frontend build
COPY --from=builder /app/dist ./dist

# Change ownership
RUN chown -R uprise:nodejs /app

USER uprise

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node server/dist/index.js"]
