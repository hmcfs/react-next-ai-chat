# Next.js 组件类型与渲染策略完全指南

## 目录

1. [核心概念](#核心概念)
2. [组件分类](#组件分类)
3. [渲染策略对比](#渲染策略对比)
4. [如何区分组件类型](#如何区分组件类型)
5. [常见场景判断](#常见场景判断)
6. [混合使用模式](#混合使用模式)
7. [常见错误与排查](#常见错误与排查)

---

## 核心概念

### Next.js App Router 的两种组件

| 类型           | 声明方式                  | 运行位置       | 渲染时机       |
| -------------- | ------------------------- | -------------- | -------------- |
| **服务端组件** | 默认（无需声明）          | Node.js 服务器 | 构建时或请求时 |
| **客户端组件** | 文件顶部加 `'use client'` | 浏览器         | 页面加载后     |

### 渲染策略

| 策略           | 缩写 | 说明              | 触发时机               |
| -------------- | ---- | ----------------- | ---------------------- |
| 静态站点生成   | SSG  | 构建时生成 HTML   | `npm run build`        |
| 服务端渲染     | SSR  | 每次请求生成 HTML | 用户访问页面           |
| 增量静态再生成 | ISR  | SSG + 定时更新    | 超过 `revalidate` 时间 |
| 客户端渲染     | CSR  | 浏览器 JS 渲染    | 页面水合后             |

---

## 组件分类

### 1. 服务端组件（Server Component）

**默认就是服务端组件，无需任何声明。**

#### 特征

```typescript
// app/page.tsx - 没有 'use client'，就是服务端组件

export default function Page() {
  return <div>我是服务端组件</div>;
}
```

| 特性           | 支持情况 | 说明                   |
| -------------- | -------- | ---------------------- |
| `useState`     | ❌       | 无法使用状态           |
| `useEffect`    | ❌       | 无生命周期             |
| `onClick`      | ❌       | 无事件监听             |
| `onChange`     | ❌       | 无事件监听             |
| `window`       | ❌       | 无浏览器 API           |
| `document`     | ❌       | 无浏览器 API           |
| `localStorage` | ❌       | 无浏览器 API           |
| `cookies()`    | ✅       | 可读取 Cookie          |
| `headers()`    | ✅       | 可读取请求头           |
| `fs` 模块      | ✅       | 可读写文件             |
| 数据库直连     | ✅       | 可直接查询             |
| 环境变量       | ✅       | 可访问所有 `.env` 变量 |

#### 示例

```typescript
import { cookies } from 'next/headers';
import db from '@/lib/db';

export default async function Page() {
  // 服务端独有的能力
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  const users = await db.query('SELECT * FROM users');

  return (
    <div>
      <h1>用户列表</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

### 2. 客户端组件（Client Component）

**文件顶部必须加 `'use client'`。**

#### 特征

```typescript
// app/components/ClientButton.tsx
'use client';  // ← 必须声明

import { useState } from 'react';

export default function ClientButton() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      点击 {count} 次
    </button>
  );
}
```

| 特性           | 支持情况 | 说明                             |
| -------------- | -------- | -------------------------------- |
| `useState`     | ✅       | 可以使用状态                     |
| `useEffect`    | ✅       | 有生命周期                       |
| `onClick`      | ✅       | 可监听事件                       |
| `onChange`     | ✅       | 可监听事件                       |
| `window`       | ✅       | 可使用浏览器 API                 |
| `document`     | ✅       | 可使用浏览器 API                 |
| `localStorage` | ✅       | 可读写本地存储                   |
| `cookies()`    | ❌       | 无法使用（用 `document.cookie`） |
| `headers()`    | ❌       | 无法使用                         |
| `fs` 模块      | ❌       | 无法使用                         |
| 数据库直连     | ❌       | 不推荐（暴露凭证）               |
| 环境变量       | ⚠️       | 只能访问 `NEXT_PUBLIC_` 前缀     |

#### 示例

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // 客户端独有的能力
    const saved = localStorage.getItem('theme');
    if (saved) setTheme(saved);
  }, []);

  return (
    <button onClick={() => {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    }}>
      切换主题
    </button>
  );
}
```

---

## 渲染策略对比

### SSG（静态站点生成）

```typescript
// app/home/page.tsx
// 默认就是 SSG（没有动态数据）

export default function HomePage() {
  return <h1>欢迎使用 Clair AI</h1>;
}
```

| 特征         | 说明                 |
| ------------ | -------------------- |
| 构建时机     | `npm run build` 时   |
| 更新方式     | 重新构建             |
| 适用场景     | 内容不经常变化的页面 |
| 性能         | 最快（预渲染 HTML）  |
| 构建输出标记 | `○`                  |

### SSR（服务端渲染）

```typescript
// app/chat/page.tsx
import { cookies } from 'next/headers';

// 使用了 cookies()，自动变为 SSR
export default async function ChatPage() {
  const cookieStore = await cookies();
  const user = cookieStore.get('user')?.value;

  return <div>欢迎, {user}</div>;
}
```

| 特征         | 说明                   |
| ------------ | ---------------------- |
| 构建时机     | 每次请求时             |
| 更新方式     | 自动（每次请求最新）   |
| 适用场景     | 需要实时数据的页面     |
| 性能         | 较慢（每次请求都渲染） |
| 构建输出标记 | `ƒ`                    |

### ISR（增量静态再生成）

```typescript
// app/blog/[slug]/page.tsx
export const revalidate = 3600;  // 1 小时重新生成

export default async function BlogPage({ params }) {
  const post = await fetchPost(params.slug);
  return <article>{post.content}</article>;
}
```

| 特征         | 说明                             |
| ------------ | -------------------------------- |
| 构建时机     | 首次请求时                       |
| 更新方式     | 超过 `revalidate` 时间后重新生成 |
| 适用场景     | 内容偶尔变化的页面               |
| 性能         | 快（缓存 + 定时更新）            |
| 构建输出标记 | `λ`                              |

### CSR（客户端渲染）

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}
```

| 特征         | 说明                 |
| ------------ | -------------------- |
| 构建时机     | 浏览器中             |
| 更新方式     | 用户交互时           |
| 适用场景     | 需要交互的组件       |
| 性能         | 取决于交互频率       |
| 构建输出标记 | 不显示（客户端组件） |

---

## 如何区分组件类型

### 判断流程图

```
这个组件需要什么？
    │
    ├─ 用户交互（点击、输入、滚动）？
    │   └─ 是 → 客户端组件 ('use client')
    │
    ├─ 浏览器 API（window、localStorage）？
    │   └─ 是 → 客户端组件 ('use client')
    │
    ├─ React Hooks（useState、useEffect）？
    │   └─ 是 → 客户端组件 ('use client')
    │
    ├─ 读取数据库？
    │   └─ 是 → 服务端组件（默认）
    │
    ├─ 读取 Cookie/Headers？
    │   └─ 是 → 服务端组件（默认）
    │
    └─ 纯展示内容？
        └─ 是 → 服务端组件（默认）
```

### 快速判断表

| 需求         | 组件类型 | 声明方式       |
| ------------ | -------- | -------------- |
| 按钮点击     | 客户端   | `'use client'` |
| 表单输入     | 客户端   | `'use client'` |
| 滚动加载     | 客户端   | `'use client'` |
| 动画效果     | 客户端   | `'use client'` |
| 读取数据库   | 服务端   | 默认           |
| 读取 Cookie  | 服务端   | 默认           |
| 读取 Headers | 服务端   | 默认           |
| 纯展示内容   | 服务端   | 默认           |
| SEO 友好内容 | 服务端   | 默认           |

### 代码特征判断

```typescript
// 判断方法：看文件内容

// 1. 有 'use client' → 客户端组件
'use client';
export default function Comp() { ... }

// 2. 使用了 React Hooks → 必须是客户端组件
import { useState } from 'react';  // 需要 'use client'

// 3. 使用了浏览器 API → 必须是客户端组件
window.innerWidth  // 需要 'use client'

// 4. 使用了 next/headers → 必须是服务端组件
import { cookies } from 'next/headers';  // 不能是客户端组件

// 5. 异步函数 + 数据库 → 服务端组件
export default async function Page() {
  const data = await db.query();  // 服务端组件
}
```

---

## 常见场景判断

### 场景 1：登录表单

```typescript
// ❌ 错误：服务端组件无法处理表单
export default function LoginForm() {
  return (
    <form onSubmit={handleSubmit}>  // onSubmit 无效
      <input onChange={handleChange} />  // onChange 无效
    </form>
  );
}

// ✅ 正确：客户端组件
'use client';

export default function LoginForm() {
  const [email, setEmail] = useState('');

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
    </form>
  );
}
```

### 场景 2：用户信息展示

```typescript
// ✅ 服务端组件：读取 Cookie 获取用户信息
import { cookies } from 'next/headers';

export default async function UserProfile() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const user = await getUserByToken(token);

  return <div>{user.name}</div>;
}

// ✅ 客户端组件：通过接口获取用户信息
'use client';

export default function UserProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(setUser);
  }, []);

  return <div>{user?.name}</div>;
}
```

### 场景 3：主题切换

```typescript
// ✅ 必须是客户端组件
'use client';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  return (
    <button onClick={() => {
      setTheme(theme === 'light' ? 'dark' : 'light');
      document.documentElement.className = theme;
    }}>
      切换主题
    </button>
  );
}
```

### 场景 4：文章列表

```typescript
// ✅ 服务端组件：SEO 友好，首屏即有内容
import db from '@/lib/db';

export default async function ArticleList() {
  const articles = await db.query('SELECT * FROM articles');

  return (
    <ul>
      {articles.map(a => (
        <li key={a.id}>{a.title}</li>
      ))}
    </ul>
  );
}
```

---

## 混合使用模式

### 模式 1：服务端包裹客户端

```typescript
// app/page.tsx（服务端组件）
import SearchForm from './SearchForm';  // 客户端组件
import ArticleList from './ArticleList';  // 服务端组件

export default async function Page() {
  const articles = await fetchArticles();

  return (
    <div>
      <SearchForm />  {/* 客户端组件：处理搜索交互 */}
      <ArticleList data={articles} />  {/* 服务端组件：展示列表 */}
    </div>
  );
}
```

### 模式 2：客户端包裹服务端（不推荐）

```typescript
// ❌ 错误：客户端组件不能直接导入服务端组件
'use client';
import ServerComp from './ServerComp';  // 会导致 ServerComp 变为客户端

// ✅ 正确：通过 props 传递数据
'use client';

export default function ClientWrapper({ children }) {
  return <div>{children}</div>;
}

// page.tsx
import ClientWrapper from './ClientWrapper';
import ServerComp from './ServerComp';

export default function Page() {
  return (
    <ClientWrapper>
      <ServerComp />  {/* 保持服务端渲染 */}
    </ClientWrapper>
  );
}
```

### 模式 3：服务端组件传递数据给客户端组件

```typescript
// app/page.tsx（服务端组件）
import Chart from './Chart';  // 客户端组件

export default async function Page() {
  const data = await fetchAnalytics();  // 服务端获取数据

  return <Chart data={data} />;  // 传递给客户端组件渲染
}

// app/Chart.tsx（客户端组件）
'use client';

export default function Chart({ data }) {
  const [hovered, setHovered] = useState(null);

  return (
    <div>
      {data.map(item => (
        <div
          key={item.id}
          onMouseEnter={() => setHovered(item.id)}
          style={{ backgroundColor: hovered === item.id ? 'blue' : 'gray' }}
        >
          {item.value}
        </div>
      ))}
    </div>
  );
}
```

---

## 常见错误与排查

### 错误 1：`window is not defined`

```typescript
// ❌ 错误：在服务端使用浏览器 API
export default function Page() {
  const width = window.innerWidth;  // 报错
  return <div>{width}</div>;
}

// ✅ 正确：移到客户端组件
'use client';

export default function Page() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);

  return <div>{width}</div>;
}
```

### 错误 2：`cookies() is not a function`

```typescript
// ❌ 错误：在客户端使用服务端 API
'use client';
import { cookies } from 'next/headers';

export default function Page() {
  const token = cookies().get('token'); // 报错
}

// ✅ 正确：通过接口获取
('use client');

export default function Page() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/me')
      .then((r) => r.json())
      .then(setUser);
  }, []);
}
```

### 错误 3：`process.env.XXX` 为 null

```typescript
// ❌ 错误：客户端访问非 NEXT_PUBLIC 环境变量
'use client';

const API_KEY = process.env.API_KEY; // null

// ✅ 正确：添加前缀或使用服务端
const API_KEY = process.env.NEXT_PUBLIC_API_KEY; // 可以访问
```

### 错误 4：事件监听无效

```typescript
// ❌ 错误：服务端组件无法监听事件
export default function Page() {
  return <button onClick={() => alert('hi')}>点击</button>;  // 无效
}

// ✅ 正确：客户端组件
'use client';

export default function Page() {
  return <button onClick={() => alert('hi')}>点击</button>;  // 有效
}
```

### 错误 5：Hooks 报错

```typescript
// ❌ 错误：服务端组件使用 Hooks
export default function Page() {
  const [count, setCount] = useState(0); // 报错
}

// ✅ 正确：客户端组件
('use client');

export default function Page() {
  const [count, setCount] = useState(0); // 正常
}
```

---

## 总结

### 一句话判断

```
需要交互？ → 客户端组件
纯展示？ → 服务端组件
```

### 核心原则

| 原则           | 说明                                    |
| -------------- | --------------------------------------- |
| 默认服务端     | 不声明就是服务端组件                    |
| 交互必须客户端 | 点击、输入、滚动等都需要 `'use client'` |
| 服务端优先     | 能不用客户端就不用                      |
| 数据流向       | 服务端 → 客户端（通过 props）           |
| 环境变量       | 客户端只能访问 `NEXT_PUBLIC_` 前缀      |
| Cookie 读取    | 客户端无法读取 HttpOnly Cookie          |

### 最佳实践

1. **尽量使用服务端组件**（性能更好、SEO 友好）
2. **只在需要交互时使用客户端组件**
3. **客户端组件尽量小**（减少打包体积）
4. **数据获取放在服务端**（安全、快速）
5. **交互逻辑放在客户端**（用户体验好）

### 快速参考表

| 需求         | 组件类型 | 声明           |
| ------------ | -------- | -------------- |
| 按钮点击     | 客户端   | `'use client'` |
| 表单输入     | 客户端   | `'use client'` |
| 状态管理     | 客户端   | `'use client'` |
| 浏览器 API   | 客户端   | `'use client'` |
| 数据库查询   | 服务端   | 默认           |
| Cookie 读取  | 服务端   | 默认           |
| 纯 HTML 展示 | 服务端   | 默认           |
| SEO 内容     | 服务端   | 默认           |
