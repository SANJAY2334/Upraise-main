import { AuditRepository } from "../repositories/audit.repository.js";
// Default instance using real Prisma — can be replaced in tests via dependency injection
const defaultAuditRepo = new AuditRepository();
export async function writeAuditLog(input, auditRepo = defaultAuditRepo) {
    await auditRepo.writeAuditLog(input);
}
