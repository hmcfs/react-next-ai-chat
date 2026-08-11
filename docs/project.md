# react-next-ai-chat 项目文档

## 一、项目概述

基于 Next.js 16 + React 19 的 AI 对话应用，支持多模型切换、文件上传预览、流式对话、对话历史管理等功能。

### 技术栈

| 类别         | 技术                                |
| :----------- | :---------------------------------- |
| **框架**     | Next.js 16.2.9（App Router）        |
| **UI 库**    | React 19.2.4                        |
| **样式**     | Tailwind CSS 4 + shadcn/ui          |
| **状态管理** | Zustand 5                           |
| **AI SDK**   | Vercel AI SDK 6 + @ai-sdk/openai    |
| **数据库**   | PostgreSQL + Prisma 7               |
| **缓存**     | Redis (ioredis 6)                   |
| **认证**     | Clerk + JWT 自定义认证              |
| **存储**     | 阿里云 OSS                          |
| **Markdown** | react-markdown + remark/rehype 插件 |
| **构建工具** | Turbopack（开发）                   |

---

## 二、目录结构

```
react-next-ai-chat/
├── .env                          # 环境变量（基础）
├── .env.development              # 开发环境变量
├── .env.local                    # 本地环境变量（不提交）
├── .gitignore                    # Git 忽略规则
├── package.json                  # 项目依赖与脚本
├── tsconfig.json                 # TypeScript 配置
├── next.config.ts                # Next.js 配置
├── postcss.config.mjs            # PostCSS 配置
├── components.json               # shadcn/ui 配置
│
├── src/
│   ├── proxy.ts                  # 全局中间件（鉴权 + 限流）
│   │
│   ├── app/                      # App Router 页面与布局
│   │   ├── layout.tsx            # 根布局（主题、侧边栏、Toast）
│   │   ├── page.tsx              # 首页（重定向到 /chat）
│   │   ├── globals.css           # 全局样式
│   │   ├── favicon.ico           # 网站图标
│   │   │
│   │   ├── api/                  # API 路由（BFF 层）
│   │   │   └── bff/              # Backend-for-Frontend 代理
│   │   │       ├── [service]/route.ts          # 通用服务代理
│   │   │       ├── chat/
│   │   │       │   ├── history/[chatId]/route.ts  # 对话历史
│   │   │       │   ├── session/route.ts           # 会话管理
│   │   │       │   └── stream/[chatId]/route.ts   # 流式对话
│   │   │       ├── common/
│   │   │       │   └── upload/route.ts            # 文件上传
│   │   │       ├── login/route.ts                 # 登录（设置 Cookie）
│   │   │       └── example/route.ts               # 示例接口
│   │   │
│   │   ├── chat/                 # 聊天主页面
│   │   │   ├── layout.tsx        # 聊天布局（侧边栏 + 主内容区）
│   │   │   ├── page.tsx          # 聊天首页
│   │   │   ├── [chatId]/page.tsx # 指定对话页面
│   │   │   └── chat-components/  # 聊天相关组件
│   │   │       ├── ChatInput.tsx       # 输入框
│   │   │       ├── CustomDialog.tsx    # 自定义对话框
│   │   │       ├── ModelCheck.tsx      # 模型选择器
│   │   │       ├── PreviewFiles.tsx    # 文件预览
│   │   │       ├── Tool.tsx            # 工具组件
│   │   │       └── useFilePaste.ts     # 文件粘贴 Hook
│   │   │
│   │   ├── draft/                # 草稿页面
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   │
│   │   ├── home/page.tsx         # Home 页面
│   │   ├── sign-in/              # 登录页面
│   │   │   └── [[...sign-in]]/
│   │   │       ├── layout.tsx
│   │   │       └── page.tsx
│   │   ├── sign-up/page.tsx      # 注册页面
│   │   └── styles/               # 页面级样式
│   │       ├── chat-layout.css
│   │       └── chat-side.css
│   │
│   ├── components/               # 通用组件
│   │   ├── my/
│   │   │   ├── Navibar.tsx           # 侧边栏导航
│   │   │   ├── ReactMarkdown.tsx     # Markdown 渲染组件
│   │   │   └── SideBarLoading.tsx    # 侧边栏加载骨架屏
│   │   ├── theme/
│   │   │   ├── theme-provider.tsx    # 主题提供者
│   │   │   └── theme-toggle.tsx      # 主题切换按钮
│   │   └── ui/                   # shadcn/ui 组件
│   │       ├── alert.tsx
│   │       ├── avatar.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── sidebar.tsx
│   │       ├── skeleton.tsx
│   │       ├── sonner.tsx
│   │       └── ...（其他 UI 组件）
│   │
│   ├── constants/                # 常量定义
│   │   ├── index.ts              # 常量导出入口
│   │   ├── model.ts              # AI 模型列表
│   │   └── preview.ts            # 预览相关常量
│   │
│   ├── hooks/                    # 自定义 Hooks
│   │   ├── use-mobile.ts         # 移动端检测
│   │   ├── useScroll.ts          # 滚动控制
│   │   └── useSidebarVisible.ts  # 侧边栏可见性
│   │
│   ├── lib/                      # 工具库与业务逻辑
│   │   ├── http/
│   │   │   └── client-api.ts         # 客户端请求封装
│   │   ├── store/
│   │   │   ├── index.ts              # Store 导出入口
│   │   │   ├── useChatStore.ts       # 聊天状态
│   │   │   ├── useFileStore.ts       # 文件状态（持久化）
│   │   │   └── useQuestionStore.ts   # 问答状态（模型、消息）
│   │   ├── bff-proxy.ts          # BFF 代理转发逻辑
│   │   ├── circuit-breaker.ts    # 熔断器实现
│   │   ├── debounce.ts           # 防抖工具
│   │   ├── format.ts             # 格式化工具
│   │   ├── handlePlainTextPaste.ts # 纯文本粘贴处理
│   │   ├── jwt.ts                # JWT 工具
│   │   ├── markdown.ts           # Markdown 处理
│   │   ├── redis.ts              # Redis 连接
│   │   ├── uploadFiles.ts        # 文件上传逻辑
│   │   └── utils.ts              # 通用工具（cn 等）
│   │
│   ├── proxy/                    # 中间件逻辑
│   │   ├── auth.ts               # 鉴权中间件
│   │   ├── rateLimit.ts          # 限流中间件
│   │   └── route.ts              # 路由保护配置
│   │
│   └── types/                    # TypeScript 类型定义
│       └── chat.type.ts          # 聊天相关类型
│
├── prisma/                       # Prisma 数据库配置
│   └── schema.prisma             # 数据库模型定义
│
└── docs/                         # 项目文档
    ├── git.md                    # Git 使用规范
    ├── ssr-ssg-csr-isr.md        # 渲染模式详解
    └── error/                    # 错误记录
        ├── nextjs-hydration-mismatch.md
        └── oss-content-disposition-preview-issue.md
```

---

## 三、页面路由

### 3.1 页面路由表

| 路由             | 文件位置                                                                              | 渲染模式 | 说明                   |
| :--------------- | :------------------------------------------------------------------------------------ | :------- | :--------------------- |
| `/`              | [src/app/page.tsx](../src/app/page.tsx)                                               | CSR      | 首页，重定向到 `/chat` |
| `/chat`          | [src/app/chat/page.tsx](../src/app/chat/page.tsx)                                     | SSR      | 聊天主页面             |
| `/chat/[chatId]` | [src/app/chat/[chatId]/page.tsx](../src/app/chat/[chatId]/page.tsx)                   | SSR      | 指定对话页面           |
| `/draft`         | [src/app/draft/page.tsx](../src/app/draft/page.tsx)                                   | SSR      | 草稿列表               |
| `/draft/[id]`    | [src/app/draft/[id]/page.tsx](../src/app/draft/[id]/page.tsx)                         | SSR      | 指定草稿               |
| `/home`          | [src/app/home/page.tsx](../src/app/home/page.tsx)                                     | SSR      | Home 页面              |
| `/sign-in`       | [src/app/sign-in/[[...sign-in]]/page.tsx](../src/app/sign-in/[[...sign-in]]/page.tsx) | CSR      | 登录页面（Clerk）      |
| `/sign-up`       | [src/app/sign-up/page.tsx](../src/app/sign-up/page.tsx)                               | CSR      | 注册页面               |

### 3.2 布局层级

```
RootLayout (src/app/layout.tsx)
├── ThemeProvider（主题管理）
├── TooltipProvider（提示框）
├── SidebarProvider（侧边栏上下文）
└── children
    └── ChatLayout (src/app/chat/layout.tsx) — 'use client'
        ├── ChatSidebar（侧边栏导航）
        ├── ModelCheck（模型选择器）
        └── children（具体页面）
```

---

## 四、API 路由（BFF 层）

### 4.1 架构说明

项目采用 **BFF（Backend for Frontend）** 架构，Next.js 作为前端代理层，将请求转发到后端服务。

```
浏览器 → Next.js BFF 层 → 后端服务
         (代理 + 鉴权 + 熔断)
```

### 4.2 API 路由表

| 路由                             | 方法                      | 文件位置                                                                                            | 说明                      |
| :------------------------------- | :------------------------ | :-------------------------------------------------------------------------------------------------- | :------------------------ |
| `/api/bff/[service]`             | ALL                       | [src/app/api/bff/[service]/route.ts](../src/app/api/bff/[service]/route.ts)                         | 通用服务代理              |
| `/api/bff/chat/session`          | GET/POST/PUT/DELETE/PATCH | [src/app/api/bff/chat/session/route.ts](../src/app/api/bff/chat/session/route.ts)                   | 创建/管理会话             |
| `/api/bff/chat/history/[chatId]` | GET                       | [src/app/api/bff/chat/history/[chatId]/route.ts](../src/app/api/bff/chat/history/[chatId]/route.ts) | 获取对话历史              |
| `/api/bff/chat/stream/[chatId]`  | POST                      | [src/app/api/bff/chat/stream/[chatId]/route.ts](../src/app/api/bff/chat/stream/[chatId]/route.ts)   | 流式对话                  |
| `/api/bff/common/upload`         | POST                      | [src/app/api/bff/common/upload/route.ts](../src/app/api/bff/common/upload/route.ts)                 | 文件上传                  |
| `/api/bff/login`                 | POST                      | [src/app/api/bff/login/route.ts](../src/app/api/bff/login/route.ts)                                 | 登录（设置 Token Cookie） |
| `/api/bff/example`               | ALL                       | [src/app/api/bff/example/route.ts](../src/app/api/bff/example/route.ts)                             | 示例接口                  |

### 4.3 BFF 代理流程

```
请求到达 /api/bff/xxx
    ↓
[src/proxy.ts](../src/proxy.ts) 中间件拦截
    ↓
限流检查（rateLimit）— 100次/分钟/IP
    ↓
鉴权检查（authProxy）— 验证 JWT Token
    ↓
[src/lib/bff-proxy.ts](../src/lib/bff-proxy.ts) 转发到后端
    ↓
熔断器保护（circuit-breaker）
    ↓
返回后端响应
```

### 4.4 关键配置

```typescript
// 后端服务地址
const BACKEND_URL = process.env.BACKEND_SERVICE_URL || 'http://localhost:3001/api';

// 限流配置
const RATE_LIMIT = 100; // 每分钟 100 次
const WINDOW_MS = 60 * 1000; // 1 分钟

// 熔断器配置
{
  failureThreshold: 5,    // 失败 5 次触发熔断
  successThreshold: 3,    // 成功 3 次恢复
  timeoutMs: 30000,       // 请求超时 30 秒
  resetTimeoutMs: 60000,  // 熔断后 60 秒后尝试恢复
}
```

---

## 五、状态管理（Zustand）

### 5.1 Store 结构

```
src/lib/store/
├── index.ts              — 统一导出
├── useChatStore.ts       — 聊天状态（chatId、标题、内容）
├── useFileStore.ts       — 文件状态（持久化到 localStorage）
└── useQuestionStore.ts   — 问答状态（模型、消息、深度思考）
```

### 5.2 useChatStore

```typescript
interface ChatStore {
  chatId: string; // 当前对话 ID
  setChatId: (id) => void;
  isNewChat: boolean; // 是否新对话
  setIsNewChat: (isNew) => void;
  title: string; // 对话标题
  setTitle: (title) => void;
  content: string; // 对话内容
  setContent: (content) => void;
}
```

### 5.3 useFileStore（持久化）

```typescript
interface FileStore {
  fileList: File1[]; // 文件列表
  imageList: File1[]; // 图片列表
  addFile: (files) => void;
  addImage: (images) => void;
  removeFile: (file) => void;
  removeImage: (file) => void;
  clear: () => void;
  concatFiles: () => Attachment[];
  hasHydrated: boolean; // 持久化水合状态
}
// 使用 persist 中间件持久化到 localStorage
```

### 5.4 useQuestionStore

```typescript
interface QuestionStore {
  model: Model; // 当前模型
  enableDeepThink: boolean; // 是否开启深度思考
  messages: Message[]; // 消息列表
  getMessageParams: () => MessageParams;
  setModel: (model) => void;
  setMessages: (messages) => void;
  setEnableDeepThink: (enable) => void;
  clearMessages: () => void;
  clearAll: () => void;
  chatId: string;
  title: string;
  isNewChat: boolean;
}
```

### 5.5 可用模型

| 模型值           | 显示名称          | 说明             |
| :--------------- | :---------------- | :--------------- |
| `qwen3.6-flash`  | 通义千问          | 默认模型         |
| `qwen3-vl-flash` | 通义视觉          | 视觉理解         |
| `qwen3-vl-plus`  | 通义视觉plus      | 增强视觉         |
| `deepseek-v3`    | DeepSeek V3       | 深度思考         |
| `deepseek-r1`    | DeepSeek R1       | 深度思考（推理） |
| `z-image-turbo`  | ZSeek Image Turbo | 图像生成         |

---

## 六、中间件（Middleware）

### 6.1 全局中间件

[src/proxy.ts](../src/proxy.ts) — Next.js Middleware，拦截所有请求：

```typescript
// 匹配规则
matcher: [
  '/((?!_next|静态文件).*)', // 排除静态资源
  '/(api|trpc)(.*)', // 所有 API 路由
  '/__clerk/(.*)', // Clerk 认证路由
];
```

### 6.2 限流中间件

[src/proxy/rateLimit.ts](file:///e:/react-next-ai-chat/src/proxy/rateLimit.ts) — 基于 IP 的内存限流：

- 限制：100 次/分钟/IP
- 存储：内存 Map（非持久化）
- 超限返回 429

### 6.3 鉴权中间件

[src/proxy/auth.ts](../src/proxy/auth.ts) — JWT + Redis 双重验证：

1. 从 Cookie 读取 Token
2. 验证 JWT 签名
3. 检查 Redis 中 Token 是否有效
4. 受保护路由未登录则跳转 `/sign-in`
5. API 路由未登录返回 401

---

## 七、客户端请求封装

[src/lib/http/client-api.ts](../src/lib/http/client-api.ts) — 封装 `fetch` 的客户端 API：

```typescript
import { clientApi } from '@/lib/http/client-api';

// GET
const result = await clientApi.get('/api/bff/chat/session');

// POST
const result = await clientApi.post('/api/bff/chat/session', { title: '新对话' });

// PUT
await clientApi.put('/api/bff/chat/session', { id: '123', title: '更新' });

// DELETE
await clientApi.delete('/api/bff/chat/session');
```

### 特性

- 自动设置 `Content-Type`
- 自动携带 HttpOnly Cookie（`credentials: 'include'`）
- 401 统一拦截跳转登录
- 支持 Query 参数拼接
- 支持 FormData 上传

---

## 八、核心工具库

| 文件                                                                  | 功能                                |
| :-------------------------------------------------------------------- | :---------------------------------- |
| [src/lib/utils.ts](../src/lib/utils.ts)                               | `cn()` — Tailwind class 合并        |
| [src/lib/bff-proxy.ts](../src/lib/bff-proxy.ts)                       | BFF 代理转发、熔断器集成            |
| [src/lib/circuit-breaker.ts](../src/lib/circuit-breaker.ts)           | 熔断器实现（closed/open/half-open） |
| [src/lib/debounce.ts](../src/lib/debounce.ts)                         | 防抖函数                            |
| [src/lib/format.ts](../src/lib/format.ts)                             | 格式化工具                          |
| [src/lib/jwt.ts](../src/lib/jwt.ts)                                   | JWT 生成与验证                      |
| [src/lib/markdown.ts](../src/lib/markdown.ts)                         | Markdown 处理                       |
| [src/lib/redis.ts](../src/lib/redis.ts)                               | Redis 连接管理                      |
| [src/lib/uploadFiles.ts](../src/lib/uploadFiles.ts)                   | 文件上传（阿里云 OSS）              |
| [src/lib/handlePlainTextPaste.ts](../src/lib/handlePlainTextPaste.ts) | 纯文本粘贴处理                      |

---

## 九、开发命令

```bash
# 开发服务器（默认端口）
npm run dev

# 开发服务器（指定端口 3004）
npm run dev:3004

# 清理缓存后启动开发
npm run dev:clean

# 生产构建
npm run build

# 清理缓存后构建
npm run build:clean

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# 数据库迁移
npm run db:migrate

# 生成 Prisma 客户端
npm run db:gen
```

---

## 十、环境变量

| 变量                  | 说明                  |
| :-------------------- | :-------------------- |
| `BACKEND_SERVICE_URL` | 后端服务地址          |
| `INTERNAL_SECRET`     | 内部通信密钥          |
| `REDIS_KEY_PREFIX`    | Redis 键前缀          |
| `DATABASE_URL`        | PostgreSQL 连接字符串 |
| `REDIS_URL`           | Redis 连接字符串      |

---

## 十一、认证流程

```
用户访问受保护页面
    ↓
中间件检查 Cookie 中的 Token
    ↓
验证 JWT 签名 + Redis 缓存
    ↓
有效 → 注入 x-user-id 到请求头
无效 → 跳转 /sign-in
    ↓
登录成功后设置 HttpOnly Cookie（3 天有效期）
```

---

## 十二、文件上传流程

```
用户选择/粘贴文件
    ↓
前端调用 /api/bff/common/upload
    ↓
BFF 代理转发到后端
    ↓
后端上传到阿里云 OSS
    ↓
返回文件 URL
    ↓
useFileStore 持久化存储
    ↓
PreviewFiles 组件预览
```
