# ─── BUILD STAGE ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy source code files
COPY . .

# Generate Prisma client
RUN npm run prisma:generate

# Build both client (Vite bundle) and server (TypeScript compile)
RUN npm run build

# ─── RUNNER STAGE ────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Set node environment
ENV NODE_ENV=production
ENV PORT=4000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy generated Prisma Client from builder stage
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/prisma ./prisma

# Copy built code and configuration
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server/dist ./server/dist

# Expose port
EXPOSE 4000

# Run migration and start backend server
CMD ["sh", "-c", "npx prisma migrate deploy && node server/dist/index.js"]
