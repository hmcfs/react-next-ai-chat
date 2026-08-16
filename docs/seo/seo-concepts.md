# SEO 核心概念与策略

## 一、SEO 基础

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

## 二、SEO 要素详细定义

### 2.1 SSR/SSG - 技术基础

**定义**：服务端渲染（Server-Side Rendering）和静态站点生成（Static Site Generation）

**详细作用**：

- 让搜索引擎爬虫能够直接获取完整的 HTML 内容
- 无需执行 JavaScript 即可看到页面内容
- 提高首屏加载速度，改善用户体验
- 是 SEO 的基础设施，其他优化都建立在此基础上

**工作原理**：

```
传统 CSR（客户端渲染）：
  爬虫请求 → 服务器返回空 HTML + JS 文件 → 爬虫不执行 JS → 看不到内容 → SEO 差

SSR/SSG（服务端渲染）：
  爬虫请求 → 服务器返回完整 HTML → 爬虫直接解析内容 → SEO 好
```

**影响范围**：内容可抓取性（基础）

---

### 2.2 robots.txt - 爬虫引导

**定义**：网站根目录下的文本文件，用于告诉搜索引擎爬虫哪些页面可以访问，哪些不能

**详细作用**：

- **引导爬虫优先级**：告诉爬虫哪些页面重要，应该优先抓取
- **屏蔽敏感内容**：防止后台、测试页面、API 接口等被索引
- **节省爬虫配额**：避免爬虫浪费资源在不重要的页面上
- **提高收录效率**：让爬虫专注于重要页面，提高收录速度和质量

**工作原理**：

```
User-agent: *          # 适用于所有爬虫
Allow: /               # 允许访问首页
Disallow: /api/        # 禁止访问 API
Disallow: /admin/      # 禁止访问后台
Sitemap: /sitemap.xml  # 告诉爬虫网站地图位置
```

**影响范围**：收录效率（爬虫抓取的智能程度）

---

### 2.3 sitemap.xml - 页面地图

**定义**：XML 格式的文件，列出网站所有重要页面及其元信息

**详细作用**：

- **主动告知爬虫**：不需要爬虫通过链接发现页面，直接提供完整列表
- **新页面快速收录**：新页面可以立即被爬虫发现，无需等待其他页面链接
- **页面优先级标注**：可以标注每个页面的重要程度（0.0 - 1.0）
- **更新频率提示**：告诉爬虫页面更新的频率（always、hourly、daily、weekly、monthly、yearly、never）
- **最后修改时间**：帮助爬虫判断是否需要重新抓取

**工作原理**：

```xml
<url>
  <loc>https://example.com/home</loc>
  <lastmod>2026-08-13</lastmod>
  <changefreq>weekly</changefreq>
  <priority>1.0</priority>
</url>
```

**影响范围**：收录完整性（确保所有重要页面都被发现）

---

### 2.4 metadata - 页面元数据

**定义**：HTML `<head>` 中的元数据，包括 title、description、keywords 等

**详细作用**：

- **Title（标题）**：
  - 搜索结果中显示的主要标题
  - 浏览器标签页标题
  - 最重要的 SEO 因素之一
  - 建议长度：50-60 个字符

- **Description（描述）**：
  - 搜索结果中显示的摘要文本
  - 影响用户点击率
  - 建议长度：150-160 个字符

- **Keywords（关键词）**：
  - 页面主题关键词
  - 现代搜索引擎权重较低，但仍建议配置

- **Authors/Creator（作者）**：
  - 页面作者信息
  - 增加内容可信度

**工作原理**：

```html
<head>
  <title>Clair - 清爽的 AI 对话助手</title>
  <meta name="description" content="多模型支持、深度思考、图片与文件即传即聊" />
  <meta name="keywords" content="AI, AI对话, 智能助手, 多模型" />
</head>
```

**影响范围**：搜索结果展示质量 → 点击率（CTR）

---

### 2.5 Open Graph（OG）- 社交分享协议

**定义**：由 Facebook 开发的开放图谱协议，用于控制网页在社交媒体上分享时的显示效果

**详细作用**：

- **og:title**：分享时显示的标题
- **og:description**：分享时显示的描述文本
- **og:image**：分享时显示的预览图片（建议 1200x630px）
- **og:url**：页面的规范 URL
- **og:type**：内容类型（website、article、product 等）
- **og:locale**：语言区域（zh_CN、en_US 等）
- **og:site_name**：网站名称

**工作原理**：

```html
<meta property="og:title" content="Clair - 清爽的 AI 对话助手" />
<meta property="og:description" content="多模型支持、深度思考、图片与文件即传即聊" />
<meta property="og:image" content="https://clair-ai.com/og-image.png" />
<meta property="og:type" content="website" />
```

**支持平台**：

- Facebook
- Twitter（也支持 Twitter Card）
- 微信（部分支持）
- LinkedIn
- Discord
- Slack
- iMessage

**影响范围**：社交分享效果 → 传播效率和点击率

---

### 2.6 Canonical URL - 规范链接

**定义**：通过 `<link rel="canonical">` 标签指定页面的"原始版本"URL

**详细作用**：

- **防止重复内容**：同一内容有多个 URL 时，指定哪个是"正版"
- **权重集中**：避免页面权重分散到多个重复 URL
- **避免 SEO 惩罚**：防止被搜索引擎判定为抄袭或重复内容
- **统一索引**：确保搜索引擎只索引规范 URL

**常见重复内容场景**：

```
https://example.com 和 https://www.example.com
https://example.com 和 https://example.com/
https://example.com/page?utm_source=twitter（带追踪参数）
https://example.com/page 和 https://example.com/page/
```

**工作原理**：

```html
<link rel="canonical" href="https://clair-ai.com/home" />
```

**影响范围**：权重集中度 → 页面排名

---

### 2.7 JSON-LD - 结构化数据

**定义**：JSON for Linking Data，一种在网页中嵌入结构化数据的格式，使用 Schema.org 词汇表

**详细作用**：

- **帮助搜索引擎理解内容**：用结构化方式告诉搜索引擎页面内容的含义
- **富文本搜索结果**：可能触发搜索结果中的富文本展示（评分、价格、FAQ 等）
- **提高点击率**：富文本结果比普通结果点击率高 30%+
- **知识图谱**：可能被纳入搜索引擎的知识图谱
- **语音搜索优化**：帮助语音助手理解和回答用户问题

**常见类型**：

- **WebApplication**：Web 应用信息
- **Article**：文章信息
- **Product**：产品信息（价格、评分、库存）
- **FAQPage**：常见问题
- **HowTo**：操作指南
- **BreadcrumbList**：面包屑导航
- **Organization**：组织信息
- **Person**：个人信息

**工作原理**：

```json
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Clair",
  "description": "清爽的 AI 对话助手",
  "applicationCategory": "ChatApplication",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "CNY"
  }
}
```

**富文本结果示例**：

```
普通结果：
  Clair - AI 对话助手
  https://clair-ai.com
  多模型支持、深度思考...

富文本结果：
  Clair - AI 对话助手 ⭐⭐⭐⭐⭐ 4.8/5 (1024)
  https://clair-ai.com
  💰 免费 | 📱 Web 应用 | 💬 聊天应用
  多模型支持、深度思考...
```

**影响范围**：搜索结果丰富度 → 点击率 +30% 以上

---

## 三、Next.js SEO 实现方式

### 3.1 Metadata API（App Router）

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

### 3.2 robots.txt 和 sitemap

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

## 四、SEO 检查清单

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
  □ 添加 JSON-LD 结构化数据

性能 SEO：
  □ 首屏加载时间 < 3 秒
  □ 使用图片优化（next/image）
  □ 使用字体优化（next/font）
  □ 启用 Gzip/Brotli 压缩
  □ 使用 CDN 加速
```

---

## 五、SEO 效果验证

部署后可以通过以下方式验证 SEO 配置：

1. **Google Search Console**
   - 提交 sitemap.xml
   - 检查索引状态
   - 查看搜索表现

2. **Rich Results Test**
   - 访问 https://search.google.com/test/rich-results
   - 输入页面 URL
   - 检查结构化数据是否有效

3. **社交分享测试**
   - Twitter: https://cards-dev.twitter.com/validator
   - Facebook: https://developers.facebook.com/tools/debug/
   - 微信：直接分享链接查看预览

4. **robots.txt 测试**
   - 访问 https://yourdomain.com/robots.txt
   - 确认规则正确

5. **sitemap 测试**
   - 访问 https://yourdomain.com/sitemap.xml
   - 确认所有页面已列出
