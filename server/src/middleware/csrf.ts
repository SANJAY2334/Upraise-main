import crypto from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../shared/errors.js";

const CSRF_COOKIE = "uprise_csrf";
const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function createCsrfToken(req: Request, res: Response) {
  const token = crypto.randomBytes(32).toString("hex");
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
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

  const cookieToken = req.cookies?.[CSRF_COOKIE];
  const headerToken = req.headers["x-csrf-token"];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    throw new ForbiddenError("CSRF validation failed.");
  }

  return next();
}
