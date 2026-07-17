import { prisma } from "../prisma.js";
export class AuthRepository {
    prismaClient;
    constructor(prismaClient = prisma) {
        this.prismaClient = prismaClient;
    }
    async findUserByEmail(email) {
        return this.prismaClient.user.findUnique({
            where: { email },
            include: { role: true }
        });
    }
    async findUserById(id) {
        return this.prismaClient.user.findUnique({
            where: { id },
            include: { role: true }
        });
    }
    async createSession(data) {
        return this.prismaClient.session.create({
            data: {
                userId: data.userId,
                refreshTokenHash: data.refreshTokenHash,
                expiresAt: data.expiresAt
            }
        });
    }
    async findActiveSessionsByUserId(userId) {
        return this.prismaClient.session.findMany({
            where: {
                userId,
                revokedAt: null
            }
        });
    }
    async updateSessionRevokedAt(sessionId, revokedAt) {
        return this.prismaClient.session.update({
            where: { id: sessionId },
            data: { revokedAt }
        });
    }
}
