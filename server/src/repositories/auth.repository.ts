import type { User, Role, Session } from "@prisma/client";
import { prisma } from "../prisma.js";

export type UserWithRole = User & { role: Role };

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<UserWithRole | null>;
  findUserById(id: string): Promise<UserWithRole | null>;
  createSession(data: { userId: string; refreshTokenHash: string; expiresAt: Date }): Promise<Session>;
  findActiveSessionsByUserId(userId: string): Promise<Session[]>;
  updateSessionRevokedAt(sessionId: string, revokedAt: Date): Promise<Session>;
}

export class AuthRepository implements IAuthRepository {
  constructor(private prismaClient = prisma) {}

  async findUserByEmail(email: string): Promise<UserWithRole | null> {
    return this.prismaClient.user.findUnique({
      where: { email },
      include: { role: true }
    }) as Promise<UserWithRole | null>;
  }

  async findUserById(id: string): Promise<UserWithRole | null> {
    return this.prismaClient.user.findUnique({
      where: { id },
      include: { role: true }
    }) as Promise<UserWithRole | null>;
  }

  async createSession(data: { userId: string; refreshTokenHash: string; expiresAt: Date }): Promise<Session> {
    return this.prismaClient.session.create({
      data: {
        userId: data.userId,
        refreshTokenHash: data.refreshTokenHash,
        expiresAt: data.expiresAt
      }
    });
  }

  async findActiveSessionsByUserId(userId: string): Promise<Session[]> {
    return this.prismaClient.session.findMany({
      where: {
        userId,
        revokedAt: null
      }
    });
  }

  async updateSessionRevokedAt(sessionId: string, revokedAt: Date): Promise<Session> {
    return this.prismaClient.session.update({
      where: { id: sessionId },
      data: { revokedAt }
    });
  }
}
