<p align="center">
  <strong>UPRISE Platform</strong><br/>
  Enterprise CMS, CRM & Growth Intelligence for modern consulting firms
</p>

---

## Overview

UPRISE is a full-stack enterprise platform providing a headless CMS, CRM pipeline, secure media library, and an analytics-ready admin dashboard. It is built for consulting and professional services firms that need reliable, scalable, and secure digital infrastructure.

## Tech Stack

| Layer         | Technology                                             |
| ------------- | ------------------------------------------------------ |
| Frontend      | React 18, TypeScript, Vite, React Query, Framer Motion |
| Backend       | Node.js, Express, TypeScript, Prisma ORM               |
| Database      | PostgreSQL 16                                          |
| Storage       | Cloudinary                                             |
| Auth          | JWT (access + refresh), HttpOnly cookies               |
| Security      | Helmet CSP, CSRF double-submit, bcrypt, rate limiting  |
| Testing       | Vitest (unit/integration), Playwright (E2E)            |
| Observability | Pino structured logging, Sentry                        |
| Deployment    | Docker, Vercel (frontend), Render/Railway (backend)    |

---

## Quick Start (Local Development)

### Prerequisites

- Node.js >= 20
- npm >= 10
- PostgreSQL 16 (or Docker)

### 1. Clone and install

```bash
git clone https://github.com/your-org/uprise-platform.git
cd uprise-platform
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
# Edit .env and fill in DATABASE_URL, JWT secrets, Cloudinary credentials
```

### 3. Start database and run migrations

```bash
# Using Docker
docker run -d --name uprise-pg -e POSTGRES_USER=uprise -e POSTGRES_PASSWORD=dev -e POSTGRES_DB=uprise_dev -p 5432:5432 postgres:16-alpine

# Run migrations
npm run prisma:migrate
```

### 4. Start development servers

```bash
npm run dev          # starts both frontend (5173) and backend (4000) concurrently
```

Frontend: http://localhost:5173  
Backend API: http://localhost:4000  
API Docs: http://localhost:4000/api/docs  
Health: http://localhost:4000/healthz

---

## Scripts

| Script                    | Description                                |
| ------------------------- | ------------------------------------------ |
| `npm run dev`             | Start all development servers              |
| `npm run build`           | Build frontend and backend for production  |
| `npm run typecheck`       | TypeScript type checking (client + server) |
| `npm run lint`            | ESLint static analysis                     |
| `npm run test`            | Run all unit and integration tests         |
| `npm run test:e2e`        | Run Playwright E2E test suite              |
| `npm run prisma:migrate`  | Run database migrations (dev)              |
| `npm run prisma:generate` | Regenerate Prisma client                   |

---

## Project Structure

```
uprise-platform/
├── src/                    # Frontend (React/Vite)
│   ├── features/           # Feature modules (admin, home, contact)
│   ├── shared/             # Shared components, hooks, providers
│   └── main.tsx            # App entry point
├── server/                 # Backend (Express/Prisma)
│   └── src/
│       ├── controllers/    # HTTP request handlers
│       ├── services/       # Business logic
│       ├── repositories/   # Data access layer (Prisma)
│       ├── routes/         # Route registrations
│       ├── middleware/      # Auth, CSRF, rate limiting, error handling
│       └── shared/         # Shared utilities (logger, errors)
├── prisma/                 # Database schema and migrations
├── tests/
│   ├── e2e/                # Playwright E2E tests
│   └── load/               # Autocannon load tests
├── docs/                   # Documentation
├── public/                 # Static assets
└── Dockerfile              # Multi-stage production container
```

---

## Environment Variables

See [`.env.production`](.env.production) for the complete template.

All required secrets are validated at startup — the server will exit with an error if any required production variable is missing or uses a default insecure value.

---

## Deployment

See [`docs/Deployment.md`](docs/Deployment.md) for full deployment guides for Vercel + Render/Railway + Docker.

---

## Contributing

See [`docs/Contributing.md`](docs/Contributing.md) for development protocols and quality gates.

---

## License

Proprietary — All rights reserved. © 2026 UPRISE Technologies.
