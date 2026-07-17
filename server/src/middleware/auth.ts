import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { UnauthorizedError, ForbiddenError } from "../shared/errors.js";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signAccessToken(user: AuthUser) {
  return jwt.sign(user, config.jwtAccessSecret, { expiresIn: "15m" });
}

export function signRefreshToken(user: AuthUser) {
  return jwt.sign(user, config.jwtRefreshSecret, { expiresIn: "7d" });
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    throw new UnauthorizedError("Authentication required.");
  }

  try {
    req.user = jwt.verify(token, config.jwtAccessSecret) as AuthUser;
    return next();
  } catch (_err) {
    throw new UnauthorizedError("Invalid or expired token.");
  }
}

export function requireRole(roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ForbiddenError("Insufficient permissions.");
    }
    return next();
  };
}
