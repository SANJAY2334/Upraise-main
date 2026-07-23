# Changelog

All notable changes to the UPRISE Platform project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-23

### Added

- **Super Admin Control Center**: A dedicated system administration dashboard under `/api/super-admin`.
- **RBAC Security & Lockout Prevention**: Middleware rules preventing the deletion, demotion, or suspension of the last active `SUPER_ADMIN` user.
- **Forced Password Changes**: `INVITED` state workflow requiring newly created administrators to change temporary passwords upon first login.
- **Security Audit Streams**: Logging client IP and User-Agent parameters on `LOGIN_SUCCESS` and `LOGIN_FAILURE` events.
- **Diagnostics Health Endpoints**: Diagnostic indicators returning PostgreSQL ping state, process memory, and host uptime.
- **wildcard Routes**: Premium error router fallback displaying wildcard Not Found branding.
- **Offline Recovery Banners**: Socket change listeners highlighting connectivity drops.

### Changed

- **JWT Alg Verification**: Hardcoded signature verification strictly to `HS256`.
- **Timing-Safe CSRF**: Migrated token checks to use cryptographically secure timing comparison (`crypto.timingSafeEqual`).
- **Swagger Production Exposure**: Configured Swagger API docs to be disabled in production environments.
- **Information Leak Shields**: Excluded administrative panels from search engine indices.

### Fixed

- **Pre-commit Accessibility**: Associated form control labels with their respective fields in the administrator creation modal.
- **TypeScript Exact Optional Types**: Fixed optional property assignment violations in auth providers.
- **Unit Test Mocks**: Configured missing `headers`, `socket`, and `ip` fields in unit test request objects to prevent middleware crashes.

---

[1.0.0]: https://github.com/SANJAY2334/Upraise-main/releases/tag/v1.0.0
