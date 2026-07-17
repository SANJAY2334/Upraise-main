import type { IAuditRepository, AuditLogInput } from "../repositories/audit.repository.js";
import { AuditRepository } from "../repositories/audit.repository.js";

// Default instance using real Prisma — can be replaced in tests via dependency injection
const defaultAuditRepo: IAuditRepository = new AuditRepository();

export async function writeAuditLog(
  input: AuditLogInput,
  auditRepo: IAuditRepository = defaultAuditRepo
): Promise<void> {
  await auditRepo.writeAuditLog(input);
}
