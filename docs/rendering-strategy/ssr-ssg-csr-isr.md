# SSG / SSR / CSR / ISR 详解

## 一、四种渲染模式概述

| 缩写    | 全称                            | 中文         | 渲染时机                | 运行环境           |
| :------ | :------------------------------ | :----------- | :---------------------- | :----------------- |
| **SSG** | Static Site Generation          | 静态站点生成 | 构建时                  | 服务器（构建阶段） |
| **SSR** | Server-Side Rendering           | 服务端渲染   | 每次请求时              | 服务器（运行时）   |
| **CSR** | Client-Side Rendering           | 客户端渲染   | 浏览器加载后            | 浏览器             |
| **ISR** | Incremental Static Regeneration | 增量静态再生 | 构建时 + 请求时按需再生 | 服务器             |

---

## 二、SSG（Static Site Generation）

### 2.1 原理

在 **构建阶段（build time）** 预先将所有页面渲染为静态 HTML 文件，部署到 CDN 上。用户访问时直接返回已生成的 HTML，无需服务器实时计算。

### 2.2 工作流程

```
npm run build
    ↓
Next.js 扫描所有页面
    ↓
执行 getStaticProps（如有）获取数据
    ↓
生成静态 HTML + JSON 文件
    ↓
部署到 CDN / 静态服务器
    ↓
用户请求 → CDN 直接返回 HTML
```

### 2.3 Next.js 中的实现

#### 默认行为（无数据获取）

```typescript
// app/page.tsx
// 如果页面不使用任何动态数据获取函数，Next.js 默认将其视为 SSG
export default function HomePage() {
  return <h1>静态页面</h1>;
}
```

#### Pages Router 中的 SSG

```typescript
// pages/blog/[slug].tsx

// 构建时调用，获取数据
export async function getStaticProps({ params }) {
  const post = await fetchPost(params.slug);
  return { props: { post } };
}

// 构建时调用，生成所有静态路径
export async function getStaticPaths() {
  const posts = await getAllPosts();
  return {
    paths: posts.map((post) => ({ params: { slug: post.slug } })),
    fallback: false, // 或 'blocking' / true
  };
}

export default function BlogPost({ post }) {
  return <article>{post.title}</article>;
}
```

#### App Router 中的 SSG

```typescript
// app/blog/[slug]/page.tsx

// 不设置 revalidate 即为 SSG
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug);
  return <article>{post.title}</article>;
}
```

### 2.4 适用场景

- 博客、文档站、营销页面
- 内容不频繁变化的页面
- 需要极致加载速度的页面
- SEO 要求高的公开页面

### 2.5 优缺点

| 优点                         | 缺点                   |
| :--------------------------- | :--------------------- |
| 加载速度最快（CDN 直接返回） | 内容更新需要重新构建   |
| 服务器压力最小               | 构建时间随页面数量增长 |
| SEO 友好                     | 不适合实时数据         |
| 可离线缓存                   | 数据可能过期           |

---

## 三、SSR（Server-Side Rendering）

### 3.1 原理

**每次请求时** 在服务器上执行 React 组件，生成 HTML 返回给浏览器。浏览器接收到 HTML 后立即进行 Hydration（水合），使页面可交互。

### 3.2 工作流程

```
用户请求页面
    ↓
Next.js 服务器接收请求
    ↓
执行 getServerSideProps（Pages Router）或 Server Component（App Router）
    ↓
在服务器端渲染 React 组件为 HTML
    ↓
返回 HTML 给浏览器
    ↓
浏览器下载 JS bundle
    ↓
React 在客户端 Hydration（水合）
    ↓
页面变为可交互
```

### 3.3 Next.js 中的实现

#### Pages Router 中的 SSR

```typescript
// pages/dashboard.tsx

// 每次请求时调用
export async function getServerSideProps(context) {
  const { req, res, query } = context;
  const user = await getUserFromRequest(req);

  if (!user) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  const data = await fetchDashboardData(user.id);
  return { props: { user, data } };
}

export default function Dashboard({ user, data }) {
  return <div>欢迎, {user.name}</div>;
}
```

#### App Router 中的 SSR

App Router 中，**Server Component 默认就是 SSR**（当页面包含动态数据时）：

```typescript
// app/dashboard/page.tsx

// 强制每次请求都重新渲染（SSR）
export const dynamic = 'force-dynamic';

// 或设置 revalidate 为 0
export const revalidate = 0;

export default async function Dashboard() {
  const user = await getCurrentUser(); // 服务端直接调用
  const data = await fetchDashboardData(user.id);

  return (
    <div>
      <h1>欢迎, {user.name}</h1>
      <DashboardData data={data} />
    </div>
  );
}
```

#### 动态路由 + SSR

```typescript
// app/users/[id]/page.tsx

// 不生成静态参数，每次请求动态获取
export default async function UserProfile({ params }) {
  const user = await fetchUser(params.id);
  return <Profile user={user} />;
}
```

### 3.4 适用场景

- 个性化内容（用户仪表盘、订单页面）
- 实时数据（股票行情、新闻流）
- 需要请求时鉴权的页面
- SEO 要求高且内容动态变化的页面

### 3.5 优缺点

| 优点                               | 缺点                           |
| :--------------------------------- | :----------------------------- |
| 数据永远是最新的                   | 服务器压力大（每次请求都渲染） |
| 支持个性化内容                     | 首屏响应时间比 SSG 慢          |
| SEO 友好                           | 需要服务器持续运行             |
| 可访问请求上下文（Cookie、Header） | 高并发时需要额外缓存策略       |

---

## 四、CSR（Client-Side Rendering）

### 4.1 原理

服务器返回一个几乎为空的 HTML 框架，浏览器下载 JavaScript 后，在客户端执行 React 代码，动态生成 DOM 并渲染页面。

### 4.2 工作流程

```
用户请求页面
    ↓
服务器返回空 HTML + JS bundle
    ↓
浏览器下载 JS
    ↓
React 在客户端执行
    ↓
生成 DOM 并渲染
    ↓
页面可交互
```

### 4.3 Next.js 中的实现

在 App Router 中，使用 `'use client'` 指令标记客户端组件：

```typescript
// app/interactive/page.tsx
'use client';

import { useState, useEffect } from 'react';

export default function InteractivePage() {
  const [count, setCount] = useState(0);
  const [data, setData] = useState(null);

  // 客户端数据获取
  useEffect(() => {
    fetch('/api/data')
      .then((res) => res.json())
      .then(setData);
  }, []);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>点击: {count}</button>
      {data ? <pre>{JSON.stringify(data)}</pre> : <p>加载中...</p>}
    </div>
  );
}
```

#### 混合渲染（SSR + CSR）

```typescript
// app/dashboard/page.tsx

// 服务端组件：获取初始数据（SSR）
export default async function DashboardPage() {
  const initialData = await getInitialData();

  return (
    <div>
      <h1>仪表盘</h1>
      {/* 客户端组件：处理交互 */}
      <InteractiveChart initialData={initialData} />
    </div>
  );
}

// components/InteractiveChart.tsx
'use client';

export function InteractiveChart({ initialData }) {
  const [data, setData] = useState(initialData);

  // 客户端交互逻辑
  const handleFilter = (filter) => {
    fetch(`/api/data?filter=${filter}`)
      .then((res) => res.json())
      .then(setData);
  };

  return <Chart data={data} onFilter={handleFilter} />;
}
```

### 4.4 适用场景

- 高度交互的应用（后台管理系统、编辑器）
- 不需要 SEO 的页面
- 实时协作类应用
- 数据完全依赖用户操作的页面

### 4.5 优缺点

| 优点                 | 缺点                    |
| :------------------- | :---------------------- |
| 服务器压力最小       | 首屏加载慢（需下载 JS） |
| 交互体验好           | SEO 不友好              |
| 适合复杂交互逻辑     | 白屏时间长              |
| 开发体验接近传统 SPA | 低端设备性能差          |

---

## 五、ISR（Incremental Static Regeneration）

### 5.1 原理

ISR 是 **SSG + SSR 的混合模式**。页面在构建时生成静态 HTML，但在部署后，可以按设定的时间间隔或在后台按需重新生成页面，无需重新构建整个项目。

### 5.2 工作流程

```
构建时：生成静态 HTML（SSG）
    ↓
部署后，用户访问：
    ↓
  - 如果在 revalidate 时间内 → 返回缓存的静态 HTML
  - 如果超过 revalidate 时间 → 返回缓存 HTML，同时后台重新生成
    ↓
重新完成后，后续请求使用新 HTML
    ↓
按需更新，无需全量重建
```

### 5.3 Next.js 中的实现

#### Pages Router 中的 ISR

```typescript
// pages/blog/[slug].tsx

export async function getStaticProps({ params }) {
  const post = await fetchPost(params.slug);

  return {
    props: { post },
    // 每 60 秒重新生成一次
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { slug: 'post-1' } }, { params: { slug: 'post-2' } }],
    fallback: 'blocking', // 新路径请求时 SSR 生成并缓存
  };
}
```

#### App Router 中的 ISR

```typescript
// app/blog/[slug]/page.tsx

// 每 60 秒重新验证
export const revalidate = 60;

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug);
  return <article>{post.title}</article>;
}
```

#### On-Demand Revalidation（按需重新验证）

```typescript
// app/api/revalidate/route.ts
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { path, tag } = await req.json();

  if (path) {
    revalidatePath(path); // 重新验证指定路径
  }
  if (tag) {
    revalidateTag(tag); // 重新验证指定标签
  }

  return NextResponse.json({ revalidated: true });
}
```

#### 使用场景：CMS 内容更新后触发

```typescript
// 在 CMS 的 Webhook 中调用
await fetch('https://yoursite.com/api/revalidate', {
  method: 'POST',
  body: JSON.stringify({ path: '/blog/new-post' }),
});
```

### 5.4 适用场景

- 内容频繁更新但不需要实时的页面（博客、新闻）
- 电商商品页面（价格、库存定期更新）
- 需要在 SSG 速度和 SSR 实时性之间取得平衡的场景
- 页面数量巨大，全量构建不现实的场景

### 5.5 优缺点

| 优点                   | 缺点                     |
| :--------------------- | :----------------------- |
| 兼顾速度和数据新鲜度   | 存在短暂的数据不一致窗口 |
| 无需全量重新构建       | 配置复杂度高于纯 SSG/SSR |
| 可按路径或标签精确控制 | 需要理解缓存失效机制     |
| 支持按需触发更新       | 首次访问新路径可能较慢   |

---

## 六、四种模式对比

### 6.1 核心差异

| 维度           | SSG          | SSR        | CSR          | ISR           |
| :------------- | :----------- | :--------- | :----------- | :------------ |
| **渲染时机**   | 构建时       | 每次请求   | 浏览器加载后 | 构建时 + 按需 |
| **HTML 内容**  | 完整         | 完整       | 空壳         | 完整          |
| **数据新鲜度** | 低（构建时） | 高（实时） | 高（实时）   | 中（可配置）  |
| **首屏速度**   | 最快         | 快         | 慢           | 最快          |
| **服务器压力** | 无           | 高         | 低           | 低            |
| **SEO**        | 优秀         | 优秀       | 差           | 优秀          |
| **适用场景**   | 静态内容     | 动态内容   | 交互应用     | 半动态内容    |

### 6.2 选择决策树

```
需要 SEO？
├── 否 → CSR
└── 是 → 内容是否个性化/实时？
         ├── 否 → 内容更新频率？
         │        ├── 几乎不变 → SSG
         │        └── 定期更新 → ISR
         └── 是 → SSR
```

---

## 七、Next.js App Router 中的渲染流程

### 7.1 Server Component 与 Client Component

```
App Router 页面
    ↓
默认是 Server Component（SSR/SSG/ISR）
    ↓
使用 'use client' 标记为 Client Component（CSR）
    ↓
两者可以嵌套组合使用
```

### 7.2 渲染决策

```typescript
// app/page.tsx — Server Component（默认）
// 在服务器上执行，可以访问数据库、文件系统等
export default async function HomePage() {
  const data = await db.query('SELECT * FROM posts'); // 服务端直接调用
  return <PostList posts={data} />;
}

// app/interactive.tsx — Client Component
'use client';
// 在浏览器上执行，可以访问 window、document、事件等
export function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### 7.3 数据获取与渲染模式的关系

```typescript
// SSG：不设置 revalidate 或 dynamic
export default async function StaticPage() {
  const data = await getData();
  return <div>{data}</div>;
}

// SSR：强制动态
export const dynamic = 'force-dynamic';
// 或
export const revalidate = 0;

// ISR：设置 revalidate 时间（秒）
export const revalidate = 3600; // 每小时重新生成
```

### 7.4 混合渲染示例

```typescript
// app/dashboard/page.tsx
// 这是一个 Server Component（SSR）
export default async function DashboardPage() {
  // 服务端获取数据
  const user = await getCurrentUser();
  const stats = await getStats();

  return (
    <div>
      <h1>{user.name} 的仪表盘</h1>
      {/* 服务端渲染的静态部分 */}
      <StatsOverview data={stats} />
      {/* 客户端组件：处理交互 */}
      <InteractiveChart initialData={stats.chartData} />
      <NotificationPanel />
    </div>
  );
}
```

---

## 八、Hydration（水合）

### 8.1 什么是水合

Hydration 是 SSR/SSG 中的关键步骤：浏览器接收到服务端生成的 HTML 后，下载 React JS bundle，将事件监听器绑定到已有 DOM 上，使静态 HTML 变为可交互的 React 应用。

### 8.2 水合过程

```
服务端渲染 HTML → 返回给浏览器
    ↓
浏览器解析并显示 HTML（用户可立即看到内容）
    ↓
浏览器下载 React JS bundle
    ↓
React 执行，将虚拟 DOM 与已有 HTML 对比
    ↓
匹配成功 → 绑定事件监听器（水合完成）
    ↓
匹配失败 → Hydration Mismatch 错误
```

### 8.3 常见水合错误及解决

详见：[Next.js Hydration Mismatch 问题](./error/nextjs-hydration-mismatch.md)

---

## 九、总结

| 模式    | 何时使用                                 |
| :------ | :--------------------------------------- |
| **SSG** | 内容固定、追求极致速度、SEO 优先         |
| **SSR** | 内容个性化、实时数据、SEO 优先           |
| **CSR** | 高度交互、无需 SEO、后台系统             |
| **ISR** | 内容定期更新、页面量大、平衡速度与新鲜度 |

> 💡 **核心原则**：一个项目中可以同时使用多种渲染模式。Next.js 允许在页面级别选择渲染策略，应根据每个页面的具体需求选择最合适的模式。
