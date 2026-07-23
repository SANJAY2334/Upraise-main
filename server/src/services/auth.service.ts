import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { signAccessToken, signRefreshToken } from "../middleware/auth.js";
import type { IAuthRepository } from "../repositories/auth.repository.js";
import { UnauthorizedError } from "../shared/errors.js";
import type { LoginResponseDTO, RefreshResponseDTO, AuthUserDTO } from "../shared/types.js";
import { writeAuditLog } from "./audit.js";

export interface LoginInput {
  email: string;
  passwordHash: string; // Wait, actually the plain password from request
}

export class AuthService {
  constructor(
    private authRepo: IAuthRepository,
    private auditLog = writeAuditLog
  ) {}

  async login(
    email: string,
    plainPassword: string,
    ip?: string,
    userAgent?: string
  ): Promise<LoginResponseDTO & { requirePasswordChange?: boolean }> {
    try {
      const user = await this.authRepo.findUserByEmail(email);
      if (!user || !user.isActive) {
        throw new UnauthorizedError("Invalid credentials.");
      }

      const valid = await bcrypt.compare(plainPassword, user.passwordHash);
      if (!valid) {
        throw new UnauthorizedError("Invalid credentials.");
      }

      const authUser: AuthUserDTO = {
        id: user.id,
        email: user.email,
        role: user.role.name,
        status: user.status
      };

      const refreshToken = signRefreshToken(authUser);

      await this.authRepo.createSession({
        userId: user.id,
        refreshTokenHash: await bcrypt.hash(refreshToken, 12),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days
      });

      await this.auditLog({
        userId: user.id,
        action: "LOGIN_SUCCESS",
        entity: "users",
        entityId: user.id,
        metadata: { ip, userAgent, email }
      });

      return {
        accessToken: signAccessToken(authUser),
        refreshToken,
        user: authUser,
        requirePasswordChange: user.status === "INVITED"
      };
    } catch (error) {
      await this.auditLog({
        action: "LOGIN_FAILURE",
        entity: "users",
        metadata: { ip, userAgent, email, reason: error instanceof Error ? error.message : "Unknown" }
      });
      throw error;
    }
  }

  async refresh(refreshToken: string): Promise<RefreshResponseDTO> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as {
        id: string;
        email: string;
        role: string;
        status: string;
      };

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

      const user: AuthUserDTO = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        status: decoded.status
      };

      return {
        accessToken: signAccessToken(user)
      };
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError("Invalid refresh token.");
    }
  }

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) {
      return;
    }

    try {
      const decoded = jwt.verify(refreshToken, config.jwtRefreshSecret) as { id: string };
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
    } catch {
      // Ignore decoding or processing issues on logout
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.authRepo.findUserById(userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError("User is suspended or does not exist.");
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Incorrect current password.");
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 12);
    await this.authRepo.updateUser(userId, {
      passwordHash: newHashedPassword,
      status: "ACTIVE"
    } as any);

    // Revoke all active sessions to secure the account
    const sessions = await this.authRepo.findActiveSessionsByUserId(userId);
    const now = new Date();
    for (const s of sessions) {
      await this.authRepo.updateSessionRevokedAt(s.id, now);
    }

    await this.auditLog({
      userId,
      action: "PASSWORD_RESET_FORCED",
      entity: "users",
      entityId: userId
    });
  }
}
