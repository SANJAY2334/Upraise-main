# ─── BUILD STAGE ─────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Generate Prisma client
RUN npm run prisma:generate

# Copy source files
COPY . .

# Build both frontend (Vite) and backend (TypeScript)
RUN npm run build

# ─── RUNNER STAGE ────────────────────────────────────────────────────────────
FROM node:24-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=4000

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 uprise

# Install production-only dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy generated Prisma client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/prisma ./prisma

# Copy compiled backend and frontend assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/dist ./server/dist

# Set ownership to non-root user
RUN chown -R uprise:nodejs /app
USER uprise

# Expose application port
EXPOSE 4000

# Run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && node server/dist/index.js"]
