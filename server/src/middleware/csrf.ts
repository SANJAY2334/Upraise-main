import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { ForbiddenError } from "../shared/errors.js";

const CSRF_COOKIE = "uprise_csrf";
const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function createCsrfToken(req: Request, res: Response) {
  const token = crypto.randomBytes(32).toString("hex");
  res.cookie(CSRF_COOKIE, token, {
  httpOnly: false,
  sameSite: config.nodeEnv === "production" ? "none" : "lax",
  secure: config.nodeEnv === "production",
  maxAge: 1000 * 60 * 60 * 4
});
  res.json({
    success: true,
    data: { csrfToken: token },
    requestId: req.id
  });
}

export function csrfProtection(req: Request, _res: Response, next: NextFunction) {
  if (!unsafeMethods.has(req.method)) {
    return next();
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE] as string | undefined;
  const headerToken = req.headers["x-csrf-token"] as string | undefined;

  if (!cookieToken || !headerToken) {
    return next(new ForbiddenError("CSRF validation failed."));
  }

  // Use timing-safe comparison to prevent timing-based attacks
  const cookieBuf = Buffer.from(cookieToken);
  const headerBuf = Buffer.from(headerToken);

  if (cookieBuf.length !== headerBuf.length || !crypto.timingSafeEqual(cookieBuf, headerBuf)) {
    return next(new ForbiddenError("CSRF validation failed."));
  }

  return next();
}
