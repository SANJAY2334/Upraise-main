# UPRISE API Reference

Base URL (production): `https://api.uprise.example.com`  
API Version: `v1` (current — all routes are at root, versioning via `Accept-Version` header planned for v2)

Interactive Docs: `GET /api/docs` (Swagger UI)  
OpenAPI Spec: `GET /api/docs/swagger.json`

---

## Authentication

UPRISE uses **JWT + HttpOnly cookies** for authentication.

1. Call `POST /api/auth/login` to obtain access + refresh tokens (set as HttpOnly cookies).
2. All protected routes require a valid session cookie.
3. Access tokens expire in **15 minutes**. Call `POST /api/auth/refresh` to obtain a new one.
4. All mutating requests (POST / PATCH / DELETE) require a valid CSRF token in the `x-csrf-token` header.

### Obtaining a CSRF Token

```http
GET /api/csrf
```

**Response:**

```json
{
  "success": true,
  "data": { "csrfToken": "<token>" }
}
```

---

## Response Format

All endpoints return a consistent JSON envelope:

```json
{
  "success": true,
  "data": { ... },
  "requestId": "req_abc123"
}
```

**Error responses:**

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": { ... },
  "requestId": "req_abc123"
}
```

---

## Public Endpoints

### `GET /healthz`

Liveness probe — returns 200 immediately.

### `GET /readyz`

Readiness probe — verifies database connectivity.

### `GET /api/content/public`

Returns all published CMS content in a single request.

**Response data:**

```json
{
  "services": [],
  "caseStudies": [],
  "blogs": [],
  "clients": [],
  "testimonials": [],
  "founder": {}
}
```

### `POST /api/contact`

Submit a contact inquiry. Creates both a `ContactMessage` and a `Lead`.

**Rate limit:** 5 requests / 15 minutes per IP.

**Request body:**

```json
{
  "name": "string (required)",
  "email": "string (email, required)",
  "phone": "string (optional)",
  "company": "string (optional)",
  "interest": "string (required)",
  "message": "string (required)",
  "consent": "boolean (required, must be true)"
}
```

---

## Admin Endpoints

All admin endpoints require authentication and RBAC role ADMIN or SUPER_ADMIN.

### Dashboard

`GET /api/admin/dashboard` — Aggregate record counts.

### Leads

| Method | Path                          | Description                                   |
| ------ | ----------------------------- | --------------------------------------------- |
| GET    | `/api/admin/leads`            | Paginated leads list. Query: `?page=&status=` |
| PATCH  | `/api/admin/leads/:id/status` | Update lead status                            |

### Messages

| Method | Path                      | Description                                 |
| ------ | ------------------------- | ------------------------------------------- |
| GET    | `/api/admin/messages`     | Paginated messages. Query: `?page=&search=` |
| DELETE | `/api/admin/messages/:id` | Delete a message                            |

### Services

| Method | Path                      | Description             |
| ------ | ------------------------- | ----------------------- |
| GET    | `/api/admin/services`     | Paginated services list |
| POST   | `/api/admin/services`     | Create a service        |
| PATCH  | `/api/admin/services/:id` | Update a service        |
| DELETE | `/api/admin/services/:id` | Delete a service        |

### Projects

| Method | Path                      | Description             |
| ------ | ------------------------- | ----------------------- |
| GET    | `/api/admin/projects`     | Paginated projects list |
| POST   | `/api/admin/projects`     | Create a project        |
| PATCH  | `/api/admin/projects/:id` | Update a project        |
| DELETE | `/api/admin/projects/:id` | Delete a project        |

### Media

| Method | Path                   | Description                                               |
| ------ | ---------------------- | --------------------------------------------------------- |
| GET    | `/api/admin/media`     | Paginated media assets                                    |
| POST   | `/api/media`           | Upload a media file (multipart/form-data, field: `asset`) |
| DELETE | `/api/admin/media/:id` | Delete a media asset                                      |

### Auth

| Method | Path                | Description                                 |
| ------ | ------------------- | ------------------------------------------- |
| POST   | `/api/auth/login`   | Login. Body: `{ email, password }`          |
| POST   | `/api/auth/refresh` | Refresh access token (uses httpOnly cookie) |
| POST   | `/api/auth/logout`  | Invalidate session                          |
| GET    | `/api/auth/me`      | Returns current authenticated user          |

---

## Error Codes

| Code                    | HTTP Status | Meaning                                        |
| ----------------------- | ----------- | ---------------------------------------------- |
| `VALIDATION_ERROR`      | 400         | Request body failed Zod validation             |
| `UNAUTHORIZED`          | 401         | Missing or invalid authentication              |
| `FORBIDDEN`             | 403         | Valid auth but insufficient permissions        |
| `NOT_FOUND`             | 404         | Resource does not exist                        |
| `CONFLICT`              | 409         | Duplicate resource (e.g., slug already exists) |
| `RATE_LIMITED`          | 429         | Too many requests                              |
| `INTERNAL_SERVER_ERROR` | 500         | Unexpected server error                        |
