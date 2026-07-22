# ───────────────────────────────────────────────────────────────────────────────
# BUILD STAGE
# ───────────────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
COPY prisma ./prisma/

# Disable Husky during Docker builds
ENV HUSKY=0

# Install all dependencies (including devDependencies)
RUN npm ci

# Generate Prisma Client
RUN npm run prisma:generate

# Copy project source
COPY . .

# Build frontend and backend
RUN npm run build


# ───────────────────────────────────────────────────────────────────────────────
# RUNTIME STAGE
# ───────────────────────────────────────────────────────────────────────────────
FROM node:24-alpine AS runner

WORKDIR /app

# Production environment
ENV NODE_ENV=production
ENV PORT=4000
ENV HUSKY=0

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 uprise

# Copy package manifests
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy Prisma Client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Copy Prisma schema & migrations
COPY --from=builder /app/prisma ./prisma

# Copy compiled application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/dist ./server/dist

# Set permissions
RUN chown -R uprise:nodejs /app

USER uprise

# Expose application port
EXPOSE 4000

# Run database migrations and start application
CMD ["sh", "-c", "npx prisma migrate deploy && node server/dist/index.js"]
