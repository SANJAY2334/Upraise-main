# Environment Variables

## Required

- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_ACCESS_SECRET`: Long random secret for short-lived access tokens.
- `JWT_REFRESH_SECRET`: Long random secret for refresh tokens.
- `CLIENT_URL`: Frontend origin for CORS.
- `SITE_URL`: Public site URL for canonical links, robots, and sitemap.

## Optional

- `PORT`: API port, defaults to `4000`.
- `NODE_ENV`: `development`, `test`, or `production`.
- `CLOUDINARY_CLOUD_NAME`: Cloudinary project name.
- `CLOUDINARY_API_KEY`: Cloudinary API key.
- `CLOUDINARY_API_SECRET`: Cloudinary API secret.

## Local Example

Copy `.env.example` to `.env` and update secrets before running migrations.
