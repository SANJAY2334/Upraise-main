import { prisma } from "../prisma.js";

export type AuditLogInput = {
  userId?: string | undefined;
  action: string;
  entity: string;
  entityId?: string | undefined;
  metadata?: unknown;
};

export interface IAuditRepository {
  writeAuditLog(input: AuditLogInput): Promise<void>;
}

export class AuditRepository implements IAuditRepository {
  constructor(private prismaClient = prisma) {}

  async writeAuditLog(input: AuditLogInput): Promise<void> {
    if (!this.prismaClient) return;
    await this.prismaClient.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        metadata: (input.metadata ?? null) as any
      }
    });
  }
}
