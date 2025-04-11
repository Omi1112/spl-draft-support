import { PrismaClient } from '@prisma/client';

/**
 * PrismaClientのシングルトンインスタンスを提供するモジュール
 * グローバル変数に依存しない実装
 */

// シングルトンインスタンスをモジュールスコープで管理
let prismaInstance: PrismaClient | undefined;

/**
 * PrismaClientのインスタンスを取得する
 * モジュールスコープでシングルトンを維持する
 */
export function getPrismaInstance(): PrismaClient {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient();
  }
  return prismaInstance;
}

// 後方互換性のために既存の参照をエクスポート
export const prisma = getPrismaInstance();
