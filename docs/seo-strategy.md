# SEO 策略与项目实现

## 一、SEO 核心概念

### 1.1 为什么 SEO 需要 SSR/SSG

| 渲染模式    | 爬虫友好度 | 说明                                   |
| :---------- | :--------- | :------------------------------------- |
| **SSR/SSG** | ✓ 友好     | 爬虫直接获取完整 HTML                  |
| **CSR**     | ✗ 不友好   | 爬虫获取空骨架，需执行 JS 才能看到内容 |

```
CSR 页面：
  爬虫访问 → 返回 <div id="root"></div> → 爬虫看不到内容 → SEO 差

SSR/SSG 页面：
  爬虫访问 → 返回完整 HTML → 爬虫直接解析内容 → SEO 好
```

### 1.2 SEO 核心要素

| 要素                | 作用                     | 优先级 |
| :------------------ | :----------------------- | :----- |
| **Title**           | 页面标题，搜索结果中显示 | 高     |
| **Description**     | 页面描述，搜索结果摘要   | 高     |
| **Open Graph**      | 社交媒体分享时的预览     | 中     |
| **Canonical URL**   | 防止重复内容             | 中     |
| **Robots.txt**      | 控制爬虫访问权限         | 高     |
| **Sitemap**         | 告诉爬虫有哪些页面       | 高     |
| **Structured Data** | 结构化数据（JSON-LD）    | 低     |
| **语义化 HTML**     | 使用正确的 HTML 标签     | 中     |

---

## 二、Next.js SEO 实现方式

### 2.1 Metadata API（App Router）

```typescript
// 方式一：静态 metadata
export const metadata: Metadata = {
  title: '页面标题',
  description: '页面描述',
  openGraph: {
    title: 'OG 标题',
    description: 'OG 描述',
    images: ['/og-image.png'],
  },
};

// 方式二：动态 generateMetadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const data = await fetchData(params.id);
  return {
    title: data.title,
    description: data.description,
  };
}
```

### 2.2 robots.txt 和 sitemap

```typescript
// app/robots.ts
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/'],
    },
    sitemap: 'https://example.com/sitemap.xml',
  };
}

// app/sitemap.ts
export default function sitemap() {
  return [
    { url: 'https://example.com/', lastModified: new Date() },
    { url: 'https://example.com/about', lastModified: new Date() },
  ];
}
```

---

## 三、本项目 SEO 现状分析

### 3.1 已实现的 SEO 配置

| 要素              | 文件                                                                               | 状态     | 说明                                   |
| :---------------- | :--------------------------------------------------------------------------------- | :------- | :------------------------------------- |
| **Root Metadata** | <a href="../src/app/layout.tsx" target="_blank">src/app/layout.tsx</a>             | ✓ 已实现 | 基础 title + description               |
| **ISR 缓存**      | <a href="../src/app/home/page.tsx" target="_blank">src/app/home/page.tsx</a>       | ✓ 已实现 | `revalidate = 3600`                    |
| **ISR 缓存**      | <a href="../src/app/sign-up/page.tsx" target="_blank">src/app/sign-up/page.tsx</a> | ✓ 已实现 | `revalidate = 86400`                   |
| **SSR 布局**      | <a href="../src/app/chat/layout.tsx" target="_blank">src/app/chat/layout.tsx</a>   | ✓ 已实现 | SSR 外壳，爬虫可解析                   |
| **语义化 HTML**   | <a href="../src/app/home/page.tsx" target="_blank">src/app/home/page.tsx</a>       | ✓ 已实现 | 使用 `<header>`、`<main>`、`<section>` |
| **aria-label**    | <a href="../src/app/home/page.tsx" target="_blank">src/app/home/page.tsx</a>       | ✓ 已实现 | 无障碍访问标签                         |

### 3.2 缺失的 SEO 配置

| 要素                    | 状态   | 建议                               |
| :---------------------- | :----- | :--------------------------------- |
| **robots.txt**          | ✗ 缺失 | 添加 `app/robots.ts`               |
| **sitemap.xml**         | ✗ 缺失 | 添加 `app/sitemap.ts`              |
| **Open Graph**          | ✗ 缺失 | 添加 OG 标签                       |
| **各页面独立 metadata** | ✗ 缺失 | 每个页面设置独立 title/description |
| **Canonical URL**       | ✗ 缺失 | 防止重复内容                       |
| **JSON-LD**             | ✗ 缺失 | 结构化数据                         |

---

## 四、各页面 SEO 分析

### 4.1 路由 SEO 策略

| 路由             | 渲染模式  | SEO 优先级 | 当前状态        | 建议                   |
| :--------------- | :-------- | :--------- | :-------------- | :--------------------- |
| `/`              | SSR       | 低         | 仅重定向        | 保持现状               |
| `/home`          | ISR       | **高**     | 基础 metadata   | 添加独立 metadata + OG |
| `/sign-up`       | ISR       | 低         | 基础 metadata   | 保持现状               |
| `/sign-in`       | SSR + CSR | 低         | 无独立 metadata | 添加独立 metadata      |
| `/chat`          | SSR + CSR | 中         | 无独立 metadata | 添加独立 metadata      |
| `/chat/[chatId]` | SSR + CSR | 低         | 无独立 metadata | 不需要（用户私有内容） |
| `/draft`         | SSR + CSR | 低         | 无独立 metadata | 不需要（用户私有内容） |

### 4.2 渲染模式与 SEO 关系

```
SEO 友好页面（爬虫可索引）：
├─ /home（ISR）→ ✓ 爬虫可直接获取完整 HTML
├─ /sign-up（ISR）→ ✓ 爬虫可直接获取完整 HTML
├─ /sign-in（SSR）→ ✓ 爬虫可获取布局 HTML
└─ /chat（SSR + CSR）→ △ 爬虫可获取布局，内容需 JS

SEO 不友好页面（爬虫不可索引）：
├─ /chat/[chatId]（CSR）→ ✗ 用户私有对话，不应索引
└─ /draft/[id]（CSR）→ ✗ 用户私有草稿，不应索引
```

---

## 五、SEO 优化建议

### 5.1 高优先级（立即实施）

#### 添加 robots.txt

```typescript
// app/robots.ts
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/home'],
      disallow: ['/api/', '/chat/', '/draft/', '/sign-in', '/sign-up'],
    },
    sitemap: 'https://yourdomain.com/sitemap.xml',
  };
}
```

#### 添加 sitemap

```typescript
// app/sitemap.ts
export default function sitemap() {
  return [
    {
      url: 'https://yourdomain.com/',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://yourdomain.com/home',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}
```

#### 完善 Root Metadata

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: 'AI Chat - 智能对话助手',
    template: '%s | AI Chat',
  },
  description: '基于多模型的 AI 对话助手，支持流式输出、文件上传、图片理解',
  keywords: ['AI', 'Chat', '智能对话', 'AI助手'],
  authors: [{ name: 'Your Name' }],
  openGraph: {
    title: 'AI Chat - 智能对话助手',
    description: '基于多模型的 AI 对话助手',
    type: 'website',
    locale: 'zh_CN',
    siteName: 'AI Chat',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Chat - 智能对话助手',
    description: '基于多模型的 AI 对话助手',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};
```

### 5.2 中优先级（按需实施）

#### 各页面独立 Metadata

```typescript
// app/home/page.tsx
export const metadata: Metadata = {
  title: 'AI Chat - 智能对话助手',
  description: '支持多模型切换、流式输出、文件上传的 AI 对话平台',
  openGraph: {
    title: 'AI Chat - 智能对话助手',
    description: '支持多模型切换、流式输出、文件上传的 AI 对话平台',
    images: ['/og-home.png'],
  },
};

// app/chat/page.tsx
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '开始对话',
    description: '创建新对话，开始与 AI 交流',
    robots: {
      index: false, // 不索引（用户私有内容）
      follow: false,
    },
  };
}
```

### 5.3 低优先级（长期优化）

#### JSON-LD 结构化数据

```typescript
// app/home/page.tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'AI Chat',
      description: '智能对话助手',
      applicationCategory: 'ChatApplication',
      operatingSystem: 'Web',
    }),
  }}
/>
```

---

## 六、SEO 检查清单

```
基础 SEO：
  □ 每个页面有独立 title
  □ 每个页面有独立 description
  □ 使用语义化 HTML 标签
  □ 添加 alt 属性到图片
  □ 使用正确的 heading 层级（h1 > h2 > h3）

技术 SEO：
  □ 添加 robots.txt
  □ 添加 sitemap.xml
  □ 设置 canonical URL
  □ 配置 Open Graph 标签
  □ 配置 Twitter Card 标签
  □ 确保页面可被爬虫访问（SSR/SSG）

性能 SEO：
  □ 首屏加载时间 < 3 秒
  □ 使用图片优化（next/image）
  □ 使用字体优化（next/font）
  □ 启用 Gzip/Brotli 压缩
  □ 使用 CDN 加速
```

---

## 七、总结

```
本项目 SEO 现状：
  ✓ 基础 metadata 已配置
  ✓ 部分页面使用 ISR（爬虫友好）
  ✓ 语义化 HTML 已使用
  ✗ 缺少 robots.txt 和 sitemap
  ✗ 缺少 Open Graph 标签
  ✗ 各页面无独立 metadata

优化优先级：
  1. 添加 robots.txt + sitemap（高）
  2. 完善 Root Metadata（高）
  3. 添加 Open Graph 标签（中）
  4. 各页面独立 metadata（中）
  5. JSON-LD 结构化数据（低）
```
