import { randomUUID } from "crypto";
import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

export function requestTracker(req: Request, res: Response, next: NextFunction) {
  const reqId = (req.headers["x-request-id"] as string) || randomUUID();
  req.id = reqId;
  res.setHeader("x-request-id", reqId);
  next();
}
