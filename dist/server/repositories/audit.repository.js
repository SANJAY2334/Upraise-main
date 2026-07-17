import { prisma } from "../prisma.js";
export class AuditRepository {
    prismaClient;
    constructor(prismaClient = prisma) {
        this.prismaClient = prismaClient;
    }
    async writeAuditLog(input) {
        if (!this.prismaClient)
            return;
        await this.prismaClient.auditLog.create({
            data: {
                userId: input.userId ?? null,
                action: input.action,
                entity: input.entity,
                entityId: input.entityId ?? null,
                metadata: (input.metadata ?? null)
            }
        });
    }
}
