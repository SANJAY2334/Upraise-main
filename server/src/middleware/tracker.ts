import { randomUUID } from "crypto";
import type { Request, Response, NextFunction } from "express";

// Maximum length for a valid UUID or external request ID
const REQUEST_ID_MAX_LENGTH = 128;
// Only allow safe alphanumeric chars, hyphens, and underscores
const REQUEST_ID_SAFE_PATTERN = /^[\w-]+$/;

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

export function requestTracker(req: Request, res: Response, next: NextFunction) {
  const rawId = req.headers["x-request-id"];
  const incoming = typeof rawId === "string" ? rawId : undefined;

  // Only accept the client-supplied ID if it passes validation to prevent header injection
  const reqId =
    incoming && incoming.length <= REQUEST_ID_MAX_LENGTH && REQUEST_ID_SAFE_PATTERN.test(incoming)
      ? incoming
      : randomUUID();

  req.id = reqId;
  res.setHeader("x-request-id", reqId);
  next();
}
