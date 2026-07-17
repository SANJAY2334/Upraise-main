import assert from "node:assert";
import { describe, it } from "node:test";
import type { User, Role, Session } from "@prisma/client";
import { AuthRepository } from "../../repositories/auth.repository.js";

const makeMockUser = (overrides: Partial<User & { role: Role }> = {}): User & { role: Role } => ({
  id: "user-123",
  name: "Jane Doe",
  email: "jane@example.com",
  passwordHash: "hash123",
  status: "ACTIVE",
  isActive: true,
  roleId: "role-1",
  role: {
    id: "role-1",
    name: "ADMIN",
    description: "Admin role",
    permissions: ["ALL"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

const makeMockSession = (overrides: Partial<Session> = {}): Session => ({
  id: "session-123",
  userId: "user-123",
  refreshTokenHash: "hash-refresh",
  expiresAt: new Date(Date.now() + 100000),
  revokedAt: null,
  createdAt: new Date(),
  ...overrides
});

describe("AuthRepository Unit Tests", () => {
  it("should find user by email with role", async () => {
    let capturedWhere: any = null;
    const mockPrisma = {
      user: {
        findUnique: async (args: any) => {
          capturedWhere = args.where;
          return makeMockUser();
        }
      }
    };

    const repo = new AuthRepository(mockPrisma as any);
    const user = await repo.findUserByEmail("jane@example.com");

    assert.ok(user);
    assert.strictEqual(capturedWhere.email, "jane@example.com");
    assert.strictEqual(user.id, "user-123");
    assert.strictEqual(user.role.name, "ADMIN");
  });

  it("should find user by id with role", async () => {
    let capturedWhere: any = null;
    const mockPrisma = {
      user: {
        findUnique: async (args: any) => {
          capturedWhere = args.where;
          return makeMockUser();
        }
      }
    };

    const repo = new AuthRepository(mockPrisma as any);
    const user = await repo.findUserById("user-123");

    assert.ok(user);
    assert.strictEqual(capturedWhere.id, "user-123");
    assert.strictEqual(user.id, "user-123");
  });

  it("should create session", async () => {
    let capturedData: any = null;
    const mockPrisma = {
      session: {
        create: async (args: any) => {
          capturedData = args.data;
          return makeMockSession();
        }
      }
    };

    const repo = new AuthRepository(mockPrisma as any);
    const expiresAt = new Date();
    const session = await repo.createSession({
      userId: "user-123",
      refreshTokenHash: "hash-refresh",
      expiresAt
    });

    assert.ok(session);
    assert.strictEqual(capturedData.userId, "user-123");
    assert.strictEqual(capturedData.refreshTokenHash, "hash-refresh");
    assert.strictEqual(capturedData.expiresAt, expiresAt);
  });

  it("should find active sessions by user id", async () => {
    let capturedWhere: any = null;
    const mockPrisma = {
      session: {
        findMany: async (args: any) => {
          capturedWhere = args.where;
          return [makeMockSession()];
        }
      }
    };

    const repo = new AuthRepository(mockPrisma as any);
    const sessions = await repo.findActiveSessionsByUserId("user-123");

    assert.strictEqual(sessions.length, 1);
    assert.strictEqual(capturedWhere.userId, "user-123");
    assert.strictEqual(capturedWhere.revokedAt, null);
  });

  it("should update session revokedAt", async () => {
    let capturedWhere: any = null;
    let capturedData: any = null;
    const mockPrisma = {
      session: {
        update: async (args: any) => {
          capturedWhere = args.where;
          capturedData = args.data;
          return makeMockSession({ revokedAt: new Date() });
        }
      }
    };

    const repo = new AuthRepository(mockPrisma as any);
    const revokedAt = new Date();
    const session = await repo.updateSessionRevokedAt("session-123", revokedAt);

    assert.ok(session);
    assert.strictEqual(capturedWhere.id, "session-123");
    assert.strictEqual(capturedData.revokedAt, revokedAt);
  });
});
