import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "./config.js";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const realPrisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.nodeEnv === "development" ? ["query", "error", "warn"] : ["error"]
  });

if (config.nodeEnv !== "production") {
  globalForPrisma.prisma = realPrisma;
}

// Generate the demo password hash dynamically on startup
const DEMO_PASSWORD_HASH = bcrypt.hashSync("password123", 10);

function createPrismaMock() {
  const handler: ProxyHandler<object> = {
    get(_target, prop: string) {
      if (prop === "$queryRaw") {
        return async () => [1];
      }
      if (prop.startsWith("$")) {
        return async () => {};
      }

      return new Proxy(
        {},
        {
          get(_, method: string) {
            return async (...args: unknown[]) => {
              if (method === "findUnique" || method === "findFirst") {
                if (prop === "user") {
                  return {
                    id: "demo-admin",
                    email: "admin@uprise.com",
                    passwordHash: DEMO_PASSWORD_HASH,
                    isActive: true,
                    role: { id: "1", name: "ADMIN" }
                  };
                }
                return null;
              }
              if (method === "findMany") {
                return [];
              }
              if (method === "count") {
                return 0;
              }
              if (method === "create" || method === "update") {
                const arg = args[0] as { data?: Record<string, unknown> } | undefined;
                const data = arg?.data || {};
                return { id: `mock-${Date.now()}`, ...data };
              }
              if (method === "delete") {
                return { id: "mock-deleted" };
              }
              return null;
            };
          }
        }
      );
    }
  };
  return new Proxy({}, handler) as unknown as PrismaClient;
}

// In production, we require the database URL to be configured.
// In development/test, we fall back to a mock proxy if no database URL is set.
const isDbConfigured = !!config.databaseUrl;
export const prisma = config.nodeEnv === "production" || isDbConfigured ? realPrisma : createPrismaMock();

export async function ensureSuperAdminConfigured(): Promise<void> {
  if (config.nodeEnv !== "production" && !isDbConfigured) {
    return;
  }

  try {
    // 1. Ensure basic roles exist
    const rolesToUpsert = [
      { name: "SUPER_ADMIN", description: "System super administrator with unrestricted access" },
      { name: "ADMIN", description: "Standard administrator with general management access" },
      { name: "EDITOR", description: "Content editor with write access to content modules" }
    ];

    for (const roleInfo of rolesToUpsert) {
      await prisma.role.upsert({
        where: { name: roleInfo.name },
        update: { description: roleInfo.description },
        create: {
          name: roleInfo.name,
          description: roleInfo.description,
          permissions: roleInfo.name === "SUPER_ADMIN" ? ["*"] : []
        }
      });
    }

    // 2. Check if super admin credentials are provided in config
    const saEmail = config.superAdmin.email;
    const saUsername = config.superAdmin.username || "Super Admin";
    const saPassword = config.superAdmin.password;

    if (saEmail && saPassword) {
      const superAdminRole = await prisma.role.findUnique({ where: { name: "SUPER_ADMIN" } });
      if (!superAdminRole) {
        throw new Error("SUPER_ADMIN role could not be resolved.");
      }

      const existingUser = await prisma.user.findUnique({ where: { email: saEmail } });
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(saPassword, 12);
        await prisma.user.create({
          data: {
            name: saUsername,
            email: saEmail,
            passwordHash: hashedPassword,
            roleId: superAdminRole.id,
            status: "ACTIVE",
            isActive: true
          }
        });
        console.log(`[INFO] Initial SUPER_ADMIN account created successfully: ${saEmail}`);
      }
    }
  } catch (error) {
    console.error("[ERROR] Failed to ensure Super Admin configuration:", error);
  }
}
