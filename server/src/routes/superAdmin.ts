import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { Router } from "express";
import { z } from "zod";
import { config } from "../config.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { prisma } from "../prisma.js";
import { writeAuditLog } from "../services/audit.js";
import { BadRequestError, NotFoundError } from "../shared/errors.js";

export const superAdminRouter = Router();

// Secure all endpoints under this router
superAdminRouter.use(requireAuth, requireRole(["SUPER_ADMIN"]));

// Input validation schemas
const createAdminSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR"])
});

const updateAdminSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR"]).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED"]).optional()
});

const idParamSchema = z.object({
  id: z.string().min(1)
});

// Helper: check if we are modifying the last active SUPER_ADMIN
async function checkLastSuperAdmin(targetUserId: string) {
  const superAdminRole = await prisma.role.findUnique({ where: { name: "SUPER_ADMIN" } });
  if (!superAdminRole) return;

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    include: { role: true }
  });

  if (targetUser?.role.name === "SUPER_ADMIN") {
    const activeSuperAdmins = await prisma.user.count({
      where: {
        roleId: superAdminRole.id,
        isActive: true,
        status: "ACTIVE"
      }
    });

    if (activeSuperAdmins <= 1) {
      throw new BadRequestError("Cannot suspend, delete, or demote the last active SUPER_ADMIN.");
    }
  }
}

// 1. Dashboard Stats
superAdminRouter.get("/dashboard/stats", async (_req, res, next) => {
  try {
    const totalAdmins = await prisma.user.count();
    const activeAdmins = await prisma.user.count({ where: { status: "ACTIVE", isActive: true } });
    const suspendedAdmins = await prisma.user.count({ where: { status: "SUSPENDED" } });

    // Recent logins (LOGIN_SUCCESS)
    const recentLogins = await prisma.auditLog.findMany({
      where: { action: "LOGIN_SUCCESS" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: true }
    });

    // Failed login attempts
    const failedLogins = await prisma.auditLog.findMany({
      where: { action: "LOGIN_FAILURE" },
      orderBy: { createdAt: "desc" },
      take: 5
    });

    // Active sessions count
    const activeSessions = await prisma.session.count({
      where: { revokedAt: null, expiresAt: { gt: new Date() } }
    });

    res.json({
      success: true,
      data: {
        totalAdmins,
        activeAdmins,
        suspendedAdmins,
        activeSessions,
        recentLogins: recentLogins.map((l) => ({
          id: l.id,
          email: (l.metadata as any)?.email || l.user?.email || "Unknown",
          ip: (l.metadata as any)?.ip || "Unknown",
          userAgent: (l.metadata as any)?.userAgent || "Unknown",
          createdAt: l.createdAt
        })),
        failedLogins: failedLogins.map((l) => ({
          id: l.id,
          email: (l.metadata as any)?.email || "Unknown",
          ip: (l.metadata as any)?.ip || "Unknown",
          reason: (l.metadata as any)?.reason || "Invalid credentials",
          createdAt: l.createdAt
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// 2. Administrators list
superAdminRouter.get("/admins", async (_req, res, next) => {
  try {
    const admins = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { role: true }
    });

    res.json({
      success: true,
      data: admins.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role.name,
        status: u.status,
        isActive: u.isActive,
        createdAt: u.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
});

// 3. Create Administrator
superAdminRouter.post("/admins", validate({ body: createAdminSchema }), async (req, res, next) => {
  try {
    const { name, email, role } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestError("An administrator with this email already exists.");
    }

    const resolvedRole = await prisma.role.findUnique({ where: { name: role } });
    if (!resolvedRole) {
      throw new NotFoundError("Role not found.");
    }

    // Generate secure temporary password
    const tempPassword = crypto.randomBytes(8).toString("hex") + "!"; // 17 chars containing a special symbol
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        roleId: resolvedRole.id,
        status: "INVITED",
        isActive: true
      }
    });

    await writeAuditLog({
      userId: req.user?.id as string | undefined,
      action: "ADMIN_CREATION",
      entity: "users",
      entityId: newUser.id as string,
      metadata: { targetEmail: email, role }
    });

    res.status(201).json({
      success: true,
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role,
        status: newUser.status,
        temporaryPassword: tempPassword // Displayed ONLY ONCE
      }
    });
  } catch (error) {
    next(error);
  }
});

// 4. Update Administrator details
superAdminRouter.patch(
  "/admins/:id",
  validate({ params: idParamSchema, body: updateAdminSchema }),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, email, role, status } = req.body;

      const user = await prisma.user.findUnique({ where: { id: id as string }, include: { role: true } });
      if (!user) {
        throw new NotFoundError("Administrator not found.");
      }

      // Check if trying to suspend or demote the last super admin
      if (status === "SUSPENDED" || (role && role !== "SUPER_ADMIN")) {
        await checkLastSuperAdmin(id as string);
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (status !== undefined) {
        updateData.status = status;
        updateData.isActive = status === "ACTIVE";
      }

      if (role !== undefined) {
        const resolvedRole = await prisma.role.findUnique({ where: { name: role } });
        if (!resolvedRole) {
          throw new NotFoundError("Role not found.");
        }
        updateData.roleId = resolvedRole.id;
      }

      const updatedUser = await prisma.user.update({
        where: { id: id as string },
        data: updateData,
        include: { role: true }
      });

      await writeAuditLog({
        userId: req.user?.id as string | undefined,
        action: "ADMIN_UPDATE",
        entity: "users",
        entityId: id as string,
        metadata: { updatedFields: Object.keys(updateData) }
      });

      res.json({
        success: true,
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: (updatedUser as any).role.name,
          status: updatedUser.status,
          isActive: updatedUser.isActive
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// 5. Reset Administrator password
superAdminRouter.post("/admins/:id/reset-password", validate({ params: idParamSchema }), async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id: id as string } });
    if (!user) {
      throw new NotFoundError("Administrator not found.");
    }

    // Generate new secure temporary password
    const tempPassword = crypto.randomBytes(8).toString("hex") + "!";
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    await prisma.user.update({
      where: { id: id as string },
      data: {
        passwordHash,
        status: "INVITED" // Require forced password change on next login
      }
    });

    // Revoke user sessions
    await prisma.session.updateMany({
      where: { userId: id as string, revokedAt: null },
      data: { revokedAt: new Date() }
    });

    await writeAuditLog({
      userId: req.user?.id as string | undefined,
      action: "PASSWORD_RESET_ADMIN",
      entity: "users",
      entityId: id as string,
      metadata: { targetEmail: user.email }
    });

    res.json({
      success: true,
      data: {
        id,
        email: user.email,
        temporaryPassword: tempPassword // Displayed ONLY ONCE
      }
    });
  } catch (error) {
    next(error);
  }
});

// 6. Delete Administrator
superAdminRouter.delete("/admins/:id", validate({ params: idParamSchema }), async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id: id as string } });
    if (!user) {
      throw new NotFoundError("Administrator not found.");
    }

    // Check if trying to delete the last active SUPER_ADMIN
    await checkLastSuperAdmin(id as string);

    await prisma.user.delete({ where: { id: id as string } });

    await writeAuditLog({
      userId: req.user?.id as string | undefined,
      action: "ADMIN_DELETION",
      entity: "users",
      entityId: id as string,
      metadata: { targetEmail: user.email }
    });

    res.json({
      success: true,
      data: { id, deleted: true }
    });
  } catch (error) {
    next(error);
  }
});

// 7. Login History Center
superAdminRouter.get("/security/login-history", async (_req, res, next) => {
  try {
    const history = await prisma.auditLog.findMany({
      where: {
        action: { in: ["LOGIN_SUCCESS", "LOGIN_FAILURE"] }
      },
      orderBy: { createdAt: "desc" },
      include: { user: true }
    });

    res.json({
      success: true,
      data: history.map((h) => ({
        id: h.id,
        action: h.action,
        email: (h.metadata as any)?.email || h.user?.email || "Unknown",
        ip: (h.metadata as any)?.ip || "Unknown",
        userAgent: (h.metadata as any)?.userAgent || "Unknown",
        status: h.action === "LOGIN_SUCCESS" ? "SUCCESS" : "FAILED",
        reason: (h.metadata as any)?.reason || null,
        createdAt: h.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
});

// 8. Audit Logs List
superAdminRouter.get("/security/audit-logs", async (_req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { include: { role: true } } }
    });

    res.json({
      success: true,
      data: logs.map((l) => ({
        id: l.id,
        user: l.user ? { name: l.user.name, email: l.user.email, role: l.user.role.name } : null,
        action: l.action,
        entity: l.entity,
        entityId: l.entityId,
        metadata: l.metadata,
        createdAt: l.createdAt
      }))
    });
  } catch (error) {
    next(error);
  }
});

// 9. System Diagnostics & Health Check
superAdminRouter.get("/system/health", async (_req, res, next) => {
  try {
    // Database connection ping
    let dbStatus = "HEALTHY";
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = "UNHEALTHY";
    }

    res.json({
      success: true,
      data: {
        environment: config.nodeEnv,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        databaseStatus: dbStatus,
        storageProvider: config.cloudinary.cloudName ? "CLOUDINARY" : "LOCAL_FALLBACK",
        emailServiceStatus: "CONFIGURED_TEMPLATE",
        backupStatus: "AUTO_WEEKLY"
      }
    });
  } catch (error) {
    next(error);
  }
});
