import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { UnauthorizedError, ForbiddenError } from "../shared/errors.js";
export function signAccessToken(user) {
    return jwt.sign(user, config.jwtAccessSecret, { expiresIn: "15m" });
}
export function signRefreshToken(user) {
    return jwt.sign(user, config.jwtRefreshSecret, { expiresIn: "7d" });
}
export function requireAuth(req, _res, next) {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token) {
        throw new UnauthorizedError("Authentication required.");
    }
    try {
        req.user = jwt.verify(token, config.jwtAccessSecret);
        return next();
    }
    catch (_err) {
        throw new UnauthorizedError("Invalid or expired token.");
    }
}
export function requireRole(roles) {
    return (req, _res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            throw new ForbiddenError("Insufficient permissions.");
        }
        return next();
    };
}
