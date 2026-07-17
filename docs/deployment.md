# UPRISE Deployment Guide

This guide covers all supported deployment targets for the UPRISE v1.0.0 release.

---

## Architecture Overview

```
                   Frontend SPA (Vercel CDN Edge)
                          |
                          | HTTPS
                          |
                   Backend Express (Render / Railway)
                          |
                   PostgreSQL (Render / Neon / Supabase)
                          |
                   Cloudinary (Media Storage)
```

---

## Option 1: Vercel (Frontend) + Render (Backend)

### Frontend — Vercel

1. **Import** the repository to Vercel.
2. Set the **Framework Preset** to `Vite`.
3. Set **Build Command**: `npm run build:client`
4. Set **Output Directory**: `dist`
5. Set **Environment Variables** in Vercel dashboard:
   ```
   VITE_SENTRY_DSN=https://...@sentry.io/...
   ```
6. Add a `vercel.json` to proxy API requests:
   ```json
   {
     "rewrites": [
       { "source": "/api/:path*", "destination": "https://your-render-app.onrender.com/api/:path*" },
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

### Backend — Render

1. Create a new **Web Service** connected to the repository.
2. Set **Build Command**: `npm ci && npm run prisma:generate && npm run build:server`
3. Set **Start Command**: `npx prisma migrate deploy && node server/dist/index.js`
4. Add all **Environment Variables** from `.env.production` template.
5. Add a **PostgreSQL** database from the Render dashboard and copy the `DATABASE_URL`.

---

## Option 2: Docker (Self-Hosted / VPS)

### Prerequisites

- Docker Engine >= 24
- Docker Compose >= 2.20

### Steps

```bash
# 1. Clone repository
git clone https://github.com/your-org/uprise-platform.git
cd uprise-platform

# 2. Configure environment
cp .env.production .env.docker
# Edit .env.docker with real values

# 3. Build and start
docker-compose up -d --build

# 4. Verify health
curl http://localhost:4000/healthz
curl http://localhost:4000/readyz
```

---

## Database Migration Procedures

### Standard Deploy

```bash
# 1. Take database backup BEFORE migrating
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Deploy new code
# 3. Run migration
npx prisma migrate deploy

# 4. Verify readiness endpoint
curl https://your-api.com/readyz
```

### Rollback Procedure

Prisma does not support automatic rollback. Follow these steps:

1. **Stop** the new server instance.
2. **Restore** the pre-migration database backup:
   ```bash
   psql $DATABASE_URL < backup_YYYYMMDD_HHMMSS.sql
   ```
3. **Deploy** the previous application version.
4. **Verify** with `/readyz` endpoint.

Always take a pg_dump backup before every production migration.

---

## Secrets Management

### Required Secrets

| Variable                | Description                           |
| ----------------------- | ------------------------------------- |
| `DATABASE_URL`          | PostgreSQL connection string          |
| `JWT_ACCESS_SECRET`     | Access token signing key (64+ chars)  |
| `JWT_REFRESH_SECRET`    | Refresh token signing key (64+ chars) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name               |
| `CLOUDINARY_API_KEY`    | Cloudinary API key                    |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                 |
| `SENTRY_DSN`            | Backend error tracking DSN            |
| `VITE_SENTRY_DSN`       | Frontend error tracking DSN           |

### Generating Secure Keys

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Best Practices

- Never commit `.env` files to version control.
- Use a secrets manager (AWS Secrets Manager, Doppler, Vault) for production.
- Rotate JWT secrets quarterly.
- Restrict database access via IP allowlisting.

---

## Health Monitoring

Configure uptime monitoring (UptimeRobot, Better Uptime, Checkly):

| Endpoint       | Expected Status |
| -------------- | --------------- |
| `GET /healthz` | 200             |
| `GET /readyz`  | 200             |

**Alert thresholds:**

- `/healthz` failure: immediate alert (server down)
- `/readyz` failure: alert after 2 consecutive failures (DB issue)
- Response time > 3000ms: warning alert
