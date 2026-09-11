import { createBBFRoute } from '@/lib/bff-proxy';

// 注册：透传到后端 POST /register，无需额外 cookie 处理
export const POST = createBBFRoute();
