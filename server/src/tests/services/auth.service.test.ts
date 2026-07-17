import assert from "node:assert";
import { describe, it } from "node:test";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../../config.js";
import { signRefreshToken } from "../../middleware/auth.js";
import type { IAuthRepository } from "../../repositories/auth.repository.js";
import { AuthService } from "../../services/auth.service.js";

const testPassword = "super-secret-password";
const testPasswordHash = bcrypt.hashSync(testPassword, 4);

const makeMockUser = () => ({
  id: "user-123",
  name: "Jane Doe",
  email: "jane@example.com",
  passwordHash: testPasswordHash,
  status: "ACTIVE" as const,
  isActive: true,
  roleId: "role-1",
  role: {
    id: "role-1",
    name: "ADMIN",
    description: "Admin",
    permissions: ["ALL"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  createdAt: new Date(),
  updatedAt: new Date()
});

const makeMockSession = () => ({
  id: "session-123",
  userId: "user-123",
  refreshTokenHash: "", // Will be set per test if needed
  expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
  revokedAt: null,
  createdAt: new Date()
});

describe("AuthService Unit Tests", () => {
  it("should log in successfully with valid credentials", async () => {
    let createdSession: any = null;
    let auditLogged: any = null;

    const mockRepo: IAuthRepository = {
      findUserByEmail: async (email) => {
        if (email === "jane@example.com") return makeMockUser();
        return null;
      },
      findUserById: async () => null,
      createSession: async (data) => {
        createdSession = data;
        return makeMockSession();
      },
      findActiveSessionsByUserId: async () => [],
      updateSessionRevokedAt: async () => makeMockSession()
    };

    const dummyAuditLog = async (input: any) => {
      auditLogged = input;
    };

    const service = new AuthService(mockRepo, dummyAuditLog);
    const result = await service.login("jane@example.com", testPassword);

    assert.ok(result.accessToken);
    assert.ok(result.refreshToken);
    assert.strictEqual(result.user.email, "jane@example.com");
    assert.strictEqual(result.user.role, "ADMIN");

    assert.ok(createdSession);
    assert.strictEqual(createdSession.userId, "user-123");
    assert.ok(createdSession.refreshTokenHash);

    assert.ok(auditLogged);
    assert.strictEqual(auditLogged.action, "LOGIN");
    assert.strictEqual(auditLogged.userId, "user-123");
  });

  it("should throw UnauthorizedError for incorrect password", async () => {
    const mockRepo: IAuthRepository = {
      findUserByEmail: async () => makeMockUser(),
      findUserById: async () => null,
      createSession: async () => makeMockSession(),
      findActiveSessionsByUserId: async () => [],
      updateSessionRevokedAt: async () => makeMockSession()
    };

    const service = new AuthService(mockRepo, async () => {});

    await assert.rejects(
      () => service.login("jane@example.com", "wrong-password"),
      (err: any) => {
        assert.strictEqual(err.statusCode, 401);
        assert.strictEqual(err.code, "UNAUTHORIZED");
        assert.strictEqual(err.message, "Invalid credentials.");
        return true;
      }
    );
  });

  it("should refresh access token using valid session", async () => {
    const authUser = { id: "user-123", email: "jane@example.com", role: "ADMIN" };
    const refreshToken = signRefreshToken(authUser);
    const refreshTokenHash = bcrypt.hashSync(refreshToken, 4);

    const mockRepo: IAuthRepository = {
      findUserByEmail: async () => null,
      findUserById: async () => null,
      createSession: async () => makeMockSession(),
      findActiveSessionsByUserId: async (userId) => {
        if (userId === "user-123") {
          return [
            makeMockSession(),
            {
              id: "session-abc",
              userId: "user-123",
              refreshTokenHash,
              expiresAt: new Date(Date.now() + 1000 * 60 * 60),
              revokedAt: null,
              createdAt: new Date()
            }
          ];
        }
        return [];
      },
      updateSessionRevokedAt: async () => makeMockSession()
    };

    const service = new AuthService(mockRepo, async () => {});
    const result = await service.refresh(refreshToken);

    assert.ok(result.accessToken);
    const decoded = jwt.verify(result.accessToken, config.jwtAccessSecret) as any;
    assert.strictEqual(decoded.id, "user-123");
    assert.strictEqual(decoded.role, "ADMIN");
  });

  it("should revoke session on logout", async () => {
    const authUser = { id: "user-123", email: "jane@example.com", role: "ADMIN" };
    const refreshToken = signRefreshToken(authUser);
    const refreshTokenHash = bcrypt.hashSync(refreshToken, 4);

    let updatedSessionId: string | null = null;
    let auditLogged: any = null;

    const mockRepo: IAuthRepository = {
      findUserByEmail: async () => null,
      findUserById: async () => null,
      createSession: async () => makeMockSession(),
      findActiveSessionsByUserId: async (userId) => {
        if (userId === "user-123") {
          return [
            {
              id: "session-abc",
              userId: "user-123",
              refreshTokenHash,
              expiresAt: new Date(Date.now() + 1000 * 60 * 60),
              revokedAt: null,
              createdAt: new Date()
            }
          ];
        }
        return [];
      },
      updateSessionRevokedAt: async (sessionId) => {
        updatedSessionId = sessionId;
        return makeMockSession();
      }
    };

    const dummyAuditLog = async (input: any) => {
      auditLogged = input;
    };

    const service = new AuthService(mockRepo, dummyAuditLog);
    await service.logout(refreshToken);

    assert.strictEqual(updatedSessionId, "session-abc");
    assert.ok(auditLogged);
    assert.strictEqual(auditLogged.action, "LOGOUT");
    assert.strictEqual(auditLogged.userId, "user-123");
  });
});
