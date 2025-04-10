import { PrismaClient } from '@prisma/client';

// グローバルインスタンスの宣言
declare global {
  var prismaInstance: PrismaClient | undefined;
}

// シングルトンパターンでPrismaClientを提供
export const prisma = global.prismaInstance || new PrismaClient();

// 開発環境では再利用
if (process.env.NODE_ENV !== 'production') {
  global.prismaInstance = prisma;
}
