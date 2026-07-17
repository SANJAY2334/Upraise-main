# Contributing to UPRISE

Thank you for contributing. Please follow these guidelines to maintain the quality and architectural integrity of the platform.

---

## Development Setup

```bash
git clone https://github.com/your-org/uprise-platform.git
cd uprise-platform
npm install
cp .env.example .env
# Configure .env
npm run prisma:migrate
npm run dev
```

---

## Branching Strategy

```
main          ← production-ready (protected, requires PR + review)
  └── release/v1.x.x  ← release preparation branches
  └── feat/your-feature-name  ← feature branches
  └── fix/your-fix-description  ← bugfix branches
  └── chore/task-description   ← maintenance / dependency updates
```

**Rules:**

- Never commit directly to `main`.
- All merges require at least **1 approving review**.
- All CI quality gates must pass before merge.

---

## Quality Gates (All Required)

Before submitting a pull request, every item below must pass:

```bash
# 1. Type safety
npm run typecheck

# 2. Linting
npm run lint

# 3. Unit and integration tests
npm run test

# 4. Production build
npm run build
```

The CI pipeline enforces all of these automatically.

---

## Architectural Rules

These rules are non-negotiable and reflect the established Clean Architecture patterns.

### Backend

1. **Routes** must only: register paths, attach middleware, invoke controller methods.
2. **Controllers** must only: parse inputs (Zod), invoke services, return `sendSuccess()` / `sendError()`.
3. **Services** own all business logic, transactions, and authorization. No Express imports.
4. **Repositories** own all Prisma access. No business logic.
5. **DTOs** must never expose Prisma internal model types to controllers or the frontend.

### Frontend

1. All server state through React Query — no direct `fetch()` calls in components.
2. Use design system tokens (CSS variables) — no hard-coded hex or pixel values.
3. All forms use the shared `Form`, `FormField`, `FormLabel`, `FormMessage` components.
4. New pages must be lazy-loaded via `React.lazy`.

---

## Testing Requirements

| Change Type                 | Required Tests                       |
| --------------------------- | ------------------------------------ |
| New repository method       | Repository unit test mocking Prisma  |
| New service method          | Service unit test mocking repository |
| New route / controller      | Integration test via Supertest       |
| New page or major component | E2E Playwright test                  |

---

## Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add lead export to CSV
fix: correct CSRF token validation on refresh
chore: bump Prisma to 6.20
docs: update deployment guide for Railway
test: add E2E test for contact form validation
```

---

## Pull Request Template

```markdown
## Summary

Brief description of what this PR does.

## Type of Change

- [ ] Bug fix
- [ ] Feature
- [ ] Refactor
- [ ] Documentation
- [ ] Dependency update

## Testing

- [ ] typecheck passes
- [ ] lint passes
- [ ] unit/integration tests pass
- [ ] build passes

## Notes

Any additional context or decisions.
```

---

## Code Review Checklist

- [ ] No Prisma imports in controllers or services
- [ ] No Express Request/Response in services or repositories
- [ ] All new endpoints have Zod validation
- [ ] All new endpoints have appropriate rate limiting
- [ ] No secrets in source code
- [ ] No `console.log` (use `logger` from `shared/logger.ts`)
- [ ] Tests cover the happy path and at least one error case
