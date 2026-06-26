import { config } from 'dotenv'; // ✅ 仅导入函数
import { defineConfig, env } from 'prisma/config';

// ⚠️ 确保这里没有任何 console.log
// ⚠️ 确保没有使用 import 'dotenv/config' (这会产生副作用输出)
config({ path: '.env', quiet: true }); // 加上 quiet: true 禁止 dotenv 输出

export default defineConfig({
  schema: 'src/prisma',
  migrations: {
    path: 'src/prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
