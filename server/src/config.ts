import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z
    .string()
    .transform((v) => Number(v))
    .default("4000"),
  CLIENT_URL: z
    .string()
    .transform((v) => {
      if (!v.startsWith("http://") && !v.startsWith("https://")) {
        return `https://${v}`;
      }
      return v;
    })
    .pipe(z.string().url())
    .default("http://localhost:5173"),
  SITE_URL: z
    .string()
    .transform((v) => {
      if (!v.startsWith("http://") && !v.startsWith("https://")) {
        return `https://${v}`;
      }
      return v;
    })
    .pipe(z.string().url())
    .default("https://uprise.example.com"),
  JWT_ACCESS_SECRET: z.string().default("dev-access-secret-change-me"),
  JWT_REFRESH_SECRET: z.string().default("dev-refresh-secret-change-me"),
  DATABASE_URL: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
  SUPER_ADMIN_EMAIL: z.string().email().optional(),
  SUPER_ADMIN_USERNAME: z.string().optional(),
  SUPER_ADMIN_PASSWORD: z.string().optional()
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("❌ CRITICAL ENVIRONMENT CONFIGURATION ERROR:");
  console.error(JSON.stringify(result.error.format(), null, 2));
  process.exit(1);
}

const parsedEnv = result.data;

// Production checks
if (parsedEnv.NODE_ENV === "production") {
  if (!parsedEnv.DATABASE_URL) {
    console.error("❌ CRITICAL SECURITY ERROR: DATABASE_URL must be defined in production mode.");
    process.exit(1);
  }
  if (parsedEnv.JWT_ACCESS_SECRET === "dev-access-secret-change-me") {
    console.error(
      "❌ CRITICAL SECURITY ERROR: JWT_ACCESS_SECRET must be set to a secure custom value in production mode."
    );
    process.exit(1);
  }
  if (parsedEnv.JWT_REFRESH_SECRET === "dev-refresh-secret-change-me") {
    console.error(
      "❌ CRITICAL SECURITY ERROR: JWT_REFRESH_SECRET must be set to a secure custom value in production mode."
    );
    process.exit(1);
  }
}

export const config = {
  nodeEnv: parsedEnv.NODE_ENV,
  port: parsedEnv.PORT,
  clientUrl: parsedEnv.CLIENT_URL,
  siteUrl: parsedEnv.SITE_URL,
  jwtAccessSecret: parsedEnv.JWT_ACCESS_SECRET,
  jwtRefreshSecret: parsedEnv.JWT_REFRESH_SECRET,
  databaseUrl: parsedEnv.DATABASE_URL,
  cloudinary: {
    cloudName: parsedEnv.CLOUDINARY_CLOUD_NAME,
    apiKey: parsedEnv.CLOUDINARY_API_KEY,
    apiSecret: parsedEnv.CLOUDINARY_API_SECRET
  },
  sentryDsn: parsedEnv.SENTRY_DSN,
  superAdmin: {
    email: parsedEnv.SUPER_ADMIN_EMAIL,
    username: parsedEnv.SUPER_ADMIN_USERNAME,
    password: parsedEnv.SUPER_ADMIN_PASSWORD
  }
};
