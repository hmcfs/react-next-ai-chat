import { PrismaClient } from '@/prisma/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
if (!(BigInt.prototype as any).toJSON) {
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };
}
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // 设置数据库会话时区为 UTC，确保 adapter 的 formatDateTime 输出（无时区后缀的 UTC 时间）被正确解释
  const dbUrl = process.env.DATABASE_URL!;
  const timezoneOpt = 'options=-c%20timezone=UTC';
  const connectionString = dbUrl.includes('?')
    ? `${dbUrl}&${timezoneOpt}`
    : `${dbUrl}?${timezoneOpt}`;

  const pool = new pg.Pool({
    connectionString,
    max: 10, // 最大连接数
    idleTimeoutMillis: 20_000, // 空闲超时
    connectionTimeoutMillis: 10_000, // 连接超时
  });

  //   2. 将已配置好的 pool 传入适配器
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
