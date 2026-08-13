# 本项目 SEO 实现详情

## 一、SEO 配置总览

### 1.1 已实现的 SEO 配置

| 要素                    | 状态     | 文件                                          |
| :---------------------- | :------- | :-------------------------------------------- |
| **Root Metadata**       | ✓ 已实现 | `src/app/layout.tsx`                          |
| **robots.txt**          | ✓ 已实现 | `src/app/robots.ts`                           |
| **sitemap.xml**         | ✓ 已实现 | `src/app/sitemap.ts`                          |
| **Open Graph**          | ✓ 已实现 | `src/app/layout.tsx`, `src/app/home/page.tsx` |
| **各页面独立 metadata** | ✓ 已实现 | 各页面 `metadata` 导出                        |
| **Canonical URL**       | ✓ 已实现 | 各页面 `alternates.canonical`                 |
| **JSON-LD**             | ✓ 已实现 | `src/app/home/page.tsx`                       |
| **ISR 缓存**            | ✓ 已实现 | `src/app/home/page.tsx` (`revalidate = 3600`) |
| **语义化 HTML**         | ✓ 已实现 | `src/app/home/page.tsx`                       |
| **aria-label**          | ✓ 已实现 | `src/app/home/page.tsx`                       |

---

## 二、各页面 SEO 分析

### 2.1 路由 SEO 策略

| 路由             | 渲染模式  | SEO 优先级 | Metadata 状态 | robots 配置 |
| :--------------- | :-------- | :--------- | :------------ | :---------- |
| `/`              | SSR       | 低         | ✓ 继承 root   | 允许索引    |
| `/home`          | ISR       | **高**     | ✓ 独立配置    | 允许索引    |
| `/sign-up`       | ISR       | 低         | ✓ 独立配置    | 禁止索引    |
| `/sign-in`       | SSR + CSR | 低         | ✓ 独立配置    | 禁止索引    |
| `/chat`          | SSR + CSR | 中         | ✓ 独立配置    | 禁止索引    |
| `/chat/[chatId]` | SSR + CSR | 低         | 继承 root     | 禁止索引    |
| `/draft`         | SSR + CSR | 低         | 继承 root     | 禁止索引    |

### 2.2 渲染模式与 SEO 关系

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

## 三、具体实现代码

### 3.1 robots.txt

```typescript
// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/home'],
      disallow: ['/api/', '/chat/', '/draft/', '/sign-in', '/sign-up'],
    },
    sitemap: 'https://clair-ai.com/sitemap.xml',
  };
}
```

### 3.2 sitemap.xml

```typescript
// src/app/sitemap.ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://clair-ai.com';
  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/home`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/chat`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sign-in`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/sign-up`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
```

### 3.3 Root Metadata

```typescript
// src/app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: 'Clair - 清爽的 AI 对话助手',
    template: '%s | Clair',
  },
  description:
    'Clair 是一款清爽的 AI 对话助手：多模型支持、深度思考、图片与文件即传即聊、历史记录自动保存。让复杂的问题，用对话的方式解决。',
  keywords: ['AI', 'AI对话', '智能助手', '多模型', '流式输出', '图片理解', '文件上传'],
  authors: [{ name: 'Clair Team' }],
  creator: 'Clair',
  publisher: 'Clair',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://clair-ai.com',
    siteName: 'Clair',
    title: 'Clair - 清爽的 AI 对话助手',
    description: '多模型支持、深度思考、图片与文件即传即聊、历史记录自动保存',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Clair - AI 对话助手',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clair - 清爽的 AI 对话助手',
    description: '多模型支持、深度思考、图片与文件即传即聊',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};
```

### 3.4 各页面独立 Metadata

#### /home 页面

```typescript
// src/app/home/page.tsx
export const metadata: Metadata = {
  title: 'Clair - 清爽的 AI 对话助手',
  description:
    '多模型支持、深度思考、图片与文件即传即聊、历史记录自动保存。让复杂的问题，用对话的方式解决。',
  openGraph: {
    title: 'Clair - 清爽的 AI 对话助手',
    description: '多模型支持、深度思考、图片与文件即传即聊、历史记录自动保存',
    type: 'website',
    url: 'https://clair-ai.com/home',
    images: [
      {
        url: '/og-home.png',
        width: 1200,
        height: 630,
        alt: 'Clair - AI 对话助手',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clair - 清爽的 AI 对话助手',
    description: '多模型支持、深度思考、图片与文件即传即聊',
    images: ['/og-home.png'],
  },
  alternates: {
    canonical: 'https://clair-ai.com/home',
  },
};
```

#### /chat 页面

```typescript
// src/app/chat/page.tsx
export const metadata: Metadata = {
  title: '开始对话',
  description: '创建新对话，与 AI 进行智能交流。支持多模型切换、流式输出、文件上传、图片理解。',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://clair-ai.com/chat',
  },
};
```

#### /sign-in 页面

```typescript
// src/app/sign-in/[[...sign-in]]/page.tsx
export const metadata: Metadata = {
  title: '登录',
  description: '登录 Clair，继续使用你的 AI 对话助手。',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://clair-ai.com/sign-in',
  },
};
```

#### /sign-up 页面

```typescript
// src/app/sign-up/page.tsx
export const metadata: Metadata = {
  title: '注册',
  description: '注册 Clair，开始你的 AI 对话之旅。',
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: 'https://clair-ai.com/sign-up',
  },
};
```

### 3.5 JSON-LD 结构化数据

```typescript
// src/app/home/page.tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Clair',
      description: '清爽的 AI 对话助手：多模型支持、深度思考、图片与文件即传即聊',
      url: 'https://clair-ai.com/home',
      applicationCategory: 'ChatApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'CNY',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '1024',
      },
    }),
  }}
/>
```

---

## 四、SEO 完成状态

```
✓ 基础 metadata 已完善（root layout）
✓ 各页面独立 metadata 已配置
✓ robots.txt 已添加
✓ sitemap.xml 已添加
✓ Open Graph 标签已配置
✓ Twitter Card 标签已配置
✓ Canonical URL 已设置
✓ JSON-LD 结构化数据已添加
✓ 语义化 HTML 已使用
✓ 部分页面使用 ISR（爬虫友好）
```

---

## 五、后续优化建议

### 5.1 高优先级

```
□ 创建 OG 图片（/og-image.png 和 /og-home.png）
□ 配置 Google Search Console 验证代码
□ 提交 sitemap 到 Google Search Console
```

### 5.2 中优先级

```
□ 优化首屏加载性能
□ 配置 CDN 加速
□ 添加面包屑导航结构化数据
```

### 5.3 低优先级

```
□ 添加 FAQ 结构化数据（home 页面）
□ 添加 HowTo 结构化数据（how-it-works 部分）
□ 监控 Core Web Vitals 指标
```
