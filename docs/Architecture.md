# UPRISE — Architecture Document

## Overview

UPRISE follows Clean Architecture principles with strict layer isolation across all domains. No layer depends on layers above it; all data crosses layer boundaries as plain DTOs.

```
┌─────────────────────────────────────────────────┐
│                    Client (React)                │
│  Features → Components → Hooks → API Service    │
└────────────────────────┬────────────────────────┘
                         │ HTTP (REST/JSON)
┌────────────────────────▼────────────────────────┐
│                  Express Server                  │
│  Routes → Controllers → Services → Repositories │
│                         ↓                       │
│                    Prisma ORM                    │
│                         ↓                       │
│                    PostgreSQL                    │
└─────────────────────────────────────────────────┘
```

---

## Layer Responsibilities

### Routes (`server/src/routes/`)

- Register URL paths and HTTP verbs
- Attach middleware (auth, rate limiting)
- Invoke controller methods
- **Must NOT** contain business logic, Prisma imports, or validation

### Controllers (`server/src/controllers/`)

- Parse and validate HTTP request inputs (via Zod)
- Invoke service methods
- Return standardized JSON responses via `sendSuccess()` / `sendError()`
- **Must NOT** contain Prisma imports, business rules, or transactions

### Services (`server/src/services/`)

- Own all business rules and orchestration
- Manage Prisma transactions
- Handle authorization (throw `ForbiddenError` when needed)
- **Must NOT** import Express `Request`/`Response`, must not import Prisma directly

### Repositories (`server/src/repositories/`)

- Own all Prisma database access
- Accept and return plain objects (no Prisma model types exposed up the stack)
- **Must NOT** contain business logic or HTTP concepts

### DTOs (`server/src/shared/types/`)

- Define API response contracts
- Controllers map from domain objects to DTOs before returning
- Frontend `src/shared/services/api.ts` mirrors these types

---

## Domain Modules

| Domain  | Routes              | Controller                         | Service                      | Repository                          |
| ------- | ------------------- | ---------------------------------- | ---------------------------- | ----------------------------------- |
| Auth    | `routes/auth.ts`    | `controllers/authController.ts`    | `services/authService.ts`    | `repositories/userRepository.ts`    |
| Content | `routes/content.ts` | `controllers/contentController.ts` | `services/contentService.ts` | `repositories/contentRepository.ts` |
| Contact | `routes/contact.ts` | `controllers/contactController.ts` | `services/contactService.ts` | `repositories/contactRepository.ts` |
| Media   | `routes/media.ts`   | `controllers/mediaController.ts`   | `services/mediaService.ts`   | `repositories/mediaRepository.ts`   |
| Admin   | `routes/admin.ts`   | `controllers/adminController.ts`   | `services/adminService.ts`   | Multiple repositories               |

---

## Security Architecture

### Authentication

- JWT access tokens (short-lived, 15 min) stored in `httpOnly` cookies
- JWT refresh tokens (7 days) stored in `httpOnly` cookies
- Refresh token rotation on every refresh cycle
- Token replay protection via `jti` tracking in database

### CSRF Protection

- Double-submit cookie pattern
- CSRF token issued at `/api/csrf`, verified on all mutating routes
- Header: `x-csrf-token`

### Rate Limiting

- Global: 300 req / 15 min
- Auth routes: 10 req / 15 min
- Contact routes: 5 req / 15 min

### Content Security Policy (Helmet)

- `default-src 'self'`
- Allowlisted: Google Fonts, Cloudinary, Unsplash image domains
- `Strict-Transport-Security` enforced in production

---

## Frontend Architecture

```
src/
├── features/           # Vertical slices by feature
│   ├── home/           # Public marketing pages
│   ├── admin/          # Admin CMS dashboard
│   └── contact/        # Contact form feature
├── shared/
│   ├── components/     # Reusable design system components
│   ├── hooks/          # Global custom hooks
│   ├── providers/      # React context providers
│   └── services/       # API client layer
└── App.tsx             # Route definitions + lazy loading
```

### State Management

- **Server State**: React Query (`@tanstack/react-query`) with explicit stale/cache times
- **UI State**: Local component `useState` / `useReducer`
- **Theme**: Context + `localStorage` persistence

### Performance

- Route-level code splitting via `React.lazy` + `Suspense`
- Manual Rollup vendor chunk splitting (react, react-query, framer-motion, lucide)
- Initial JS bundle: ~20 KB gzipped (down from 233 KB before optimization)

---

## Database Schema (Key Models)

| Model                    | Purpose                                    |
| ------------------------ | ------------------------------------------ |
| `User`                   | Admin accounts with hashed passwords       |
| `Session`                | Refresh token tracking + replay protection |
| `Service`                | CMS services content                       |
| `Project` / `CaseStudy`  | Portfolio content                          |
| `Blog`                   | Blog posts with categories and tags        |
| `Client` / `Testimonial` | Social proof content                       |
| `FounderProfile`         | About page bio content                     |
| `ContactMessage`         | Inbound form submissions                   |
| `Lead`                   | CRM pipeline entries linked to messages    |
| `MediaAsset`             | Cloudinary asset metadata                  |
| `AuditLog`               | Admin action trail                         |

---

## Testing Strategy

| Layer      | Tool                 | Coverage                         |
| ---------- | -------------------- | -------------------------------- |
| Repository | Vitest + Prisma Mock | Unit — mocked Prisma client      |
| Service    | Vitest               | Unit — mocked repositories       |
| Controller | Vitest + Supertest   | Integration — mocked services    |
| E2E        | Playwright           | Browser automation — real server |
| Load       | Autocannon           | Throughput + latency benchmarks  |
