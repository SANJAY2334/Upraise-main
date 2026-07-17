import * as Sentry from "@sentry/node";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { config } from "./config.js";
import { csrfProtection } from "./middleware/csrf.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authLimiter, contactLimiter } from "./middleware/rateLimiter.js";
import { requestTracker } from "./middleware/tracker.js";
import { prisma } from "./prisma.js";
import { adminRouter } from "./routes/admin.js";
import { authRouter } from "./routes/auth.js";
import { contactRouter } from "./routes/contact.js";
import { contentRouter } from "./routes/content.js";
import { csrfRouter } from "./routes/csrf.js";
import { docsRouter } from "./routes/docs.js";
import { mediaRouter } from "./routes/media.js";
import { logger } from "./shared/logger.js";

// Initialize Sentry
if (config.sentryDsn) {
  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.nodeEnv,
    tracesSampleRate: 0.1
  });
}

const app = express();

app.set("trust proxy", 1);
app.use(requestTracker);

// Custom structured request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    logger.info({
      msg: "Request completed",
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - start,
      requestId: req.id,
      ip: req.ip
    });
  });
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://res.cloudinary.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'"]
      }
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" },
    hidePoweredBy: true
  })
);

app.use((_req, res, next) => {
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  next();
});

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token", "x-request-id"],
    maxAge: 86400 // 24 hours preflight cache
  })
);

app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: "draft-7", legacyHeaders: false }));

app.get("/healthz", (req, res) => {
  return res.json({
    success: true,
    data: { status: "OK", timestamp: new Date().toISOString() },
    requestId: req.id
  });
});

app.get("/readyz", async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({
      success: true,
      data: { status: "READY", database: "UP", timestamp: new Date().toISOString() },
      requestId: req.id
    });
  } catch (error) {
    return next(error);
  }
});
app.get("/robots.txt", (_req, res) => {
  res.type("text/plain").send(`User-agent: *\nAllow: /\nSitemap: ${config.siteUrl}/sitemap.xml\n`);
});
app.get("/sitemap.xml", (_req, res) => {
  const urls = ["", "/privacy", "/cookie-policy", "/terms", "/admin"];
  res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${config.siteUrl}${url}</loc><changefreq>weekly</changefreq><priority>${url === "" ? "1.0" : "0.7"}</priority></url>`).join("\n")}
</urlset>`);
});

app.use("/api/csrf", csrfRouter);
app.use("/api/docs", docsRouter);
app.use("/api", csrfProtection);
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/contact", contactLimiter, contactRouter);
app.use("/api/content", contentRouter);
app.use("/api/admin", adminRouter);
app.use("/api/media", mediaRouter);

app.use(errorHandler);

export { app };
