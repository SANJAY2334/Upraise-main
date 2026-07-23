import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { UnauthorizedError, ForbiddenError } from "../shared/errors.js";

export type AuthUser = {
  id: string;
  email: string;
  role: string;
  status: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signAccessToken(user: AuthUser) {
  return jwt.sign(user, config.jwtAccessSecret, { expiresIn: "15m", algorithm: "HS256" });
}

export function signRefreshToken(user: AuthUser) {
  return jwt.sign(user, config.jwtRefreshSecret, { expiresIn: "7d", algorithm: "HS256" });
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  if (!token) {
    return next(new UnauthorizedError("Authentication required."));
  }

  try {
    req.user = jwt.verify(token, config.jwtAccessSecret, {
      algorithms: ["HS256"]
    }) as AuthUser;

    const url = req.originalUrl || req.url || "";
    if (
      req.user.status === "INVITED" &&
      !url.endsWith("/api/auth/change-password") &&
      !url.endsWith("/api/auth/me") &&
      !url.endsWith("/api/auth/logout")
    ) {
      return next(new ForbiddenError("Password change required."));
    }

    return next();
  } catch {
    return next(new UnauthorizedError("Invalid or expired token."));
  }
}

export function requireRole(roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ForbiddenError("Insufficient permissions."));
    }
    // SUPER_ADMIN has unrestricted access
    if (req.user.role === "SUPER_ADMIN" || roles.includes(req.user.role)) {
      return next();
    }
    return next(new ForbiddenError("Insufficient permissions."));
  };
}
