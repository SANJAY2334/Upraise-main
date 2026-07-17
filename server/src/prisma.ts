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
  const handler = {
    get(_target: any, prop: string): any {
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
            return async (...args: any[]) => {
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
                const data = args[0]?.data || {};
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
  return new Proxy({}, handler) as any;
}

// In production, we require the database URL to be configured.
// In development/test, we fall back to a mock proxy if no database URL is set.
const isDbConfigured = !!config.databaseUrl;
export const prisma = config.nodeEnv === "production" || isDbConfigured ? realPrisma : createPrismaMock();
