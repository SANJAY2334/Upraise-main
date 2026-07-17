import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { signAccessToken, signRefreshToken } from "../middleware/auth.js";
import { UnauthorizedError } from "../shared/errors.js";
import { writeAuditLog } from "./audit.js";
export class AuthService {
    authRepo;
    auditLog;
    constructor(authRepo, auditLog = writeAuditLog) {
        this.authRepo = authRepo;
        this.auditLog = auditLog;
    }
    async login(email, plainPassword) {
        const user = await this.authRepo.findUserByEmail(email);
        if (!user || !user.isActive) {
            throw new UnauthorizedError("Invalid credentials.");
        }
        const valid = await bcrypt.compare(plainPassword, user.passwordHash);
        if (!valid) {
            throw new UnauthorizedError("Invalid credentials.");
        }
        const authUser = {
            id: user.id,
            email: user.email,
            role: user.role.name
        };
        const refreshToken = signRefreshToken(authUser);
        await this.authRepo.createSession({
            userId: user.id,
            refreshTokenHash: await bcrypt.hash(refreshToken, 12),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days
        });
        await this.auditLog({
            userId: user.id,
            action: "LOGIN",
            entity: "users",
            entityId: user.id
        });
        return {
            accessToken: signAccessToken(authUser),
            refreshToken,
            user: authUser
        };
    }
    async refresh(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
            const sessions = await this.authRepo.findActiveSessionsByUserId(decoded.id);
            // Filter sessions that are not expired
            const now = new Date();
            const validSessions = sessions.filter((s) => s.expiresAt > now);
            let validSession = false;
            for (const session of validSessions) {
                if (await bcrypt.compare(refreshToken, session.refreshTokenHash)) {
                    validSession = true;
                    break;
                }
            }
            if (!validSession) {
                throw new UnauthorizedError("Invalid or revoked session.");
            }
            const user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role
            };
            return {
                accessToken: signAccessToken(user)
            };
        }
        catch (error) {
            if (error instanceof UnauthorizedError) {
                throw error;
            }
            throw new UnauthorizedError("Invalid refresh token.");
        }
    }
    async logout(refreshToken) {
        if (!refreshToken) {
            return;
        }
        try {
            const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret);
            const sessions = await this.authRepo.findActiveSessionsByUserId(decoded.id);
            for (const session of sessions) {
                if (await bcrypt.compare(refreshToken, session.refreshTokenHash)) {
                    await this.authRepo.updateSessionRevokedAt(session.id, new Date());
                }
            }
            await this.auditLog({
                userId: decoded.id,
                action: "LOGOUT",
                entity: "users",
                entityId: decoded.id
            });
        }
        catch {
            // Ignore decoding or processing issues on logout
        }
    }
}
