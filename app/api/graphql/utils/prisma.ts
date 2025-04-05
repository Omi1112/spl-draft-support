import { PrismaClient } from "@prisma/client";

// グローバルスコープで唯一のPrismaインスタンスを作成
const prismaGlobal = global as unknown as { prisma: PrismaClient };

export const prisma = prismaGlobal.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  prismaGlobal.prisma = prisma;
}

export default prisma;
