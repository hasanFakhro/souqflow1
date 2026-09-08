import { PrismaClient } from "@prisma/client";

const runtimeDatabaseUrl = process.env.DATABASE_URL
  ? (() => {
      const url = new URL(process.env.DATABASE_URL);

      // Prisma Client 6's library engine cannot connect to Neon with this option.
      // TLS remains required by the `sslmode=require` URL option.
      url.searchParams.delete("channel_binding");

      return url.toString();
    })()
  : undefined;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(runtimeDatabaseUrl
      ? { datasources: { db: { url: runtimeDatabaseUrl } } }
      : {}),
    log: process.env.NODE_ENV === "development" ? ["query", "info", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
