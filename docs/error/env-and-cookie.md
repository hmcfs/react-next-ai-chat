# Next.js 环境变量与 Cookie 常见问题

## 问题一：客户端组件无法获取 JWT_SECRET

### 错误现象

```typescript
// src/lib/jwt.ts
const JWT_SECRET = process.env.JWT_SECRET as string;

console.log(JWT_SECRET); // 前端控制台: null
// 后端控制台: your-secret-key
```

### 出现原因

Next.js 的环境变量有**作用域限制**：

| 环境变量前缀             | 客户端可访问 | 服务端可访问 |
| ------------------------ | ------------ | ------------ |
| `JWT_SECRET`             | ❌ 否        | ✅ 是        |
| `NEXT_PUBLIC_JWT_SECRET` | ✅ 是        | ✅ 是        |

### 为什么这样设计？

- **安全性**：服务端环境变量（如密钥、数据库密码）不应暴露给浏览器
- **构建时注入**：`NEXT_PUBLIC_` 前缀的变量会在构建时注入到客户端代码中

### 错误示例

```typescript
// ❌ 错误：客户端组件引用了需要 JWT_SECRET 的工具
'use client';
import { getUserInfoByToken } from '@/lib/jwt'; // jwt.ts 需要 JWT_SECRET

function LoginForm() {
  const userInfo = getUserInfoByToken(token); // JWT_SECRET 为 null，验证失败
}
```

### 正确做法

**方案一：只在服务端使用 JWT 工具**

```typescript
// ✅ 正确：API Route（服务端）中使用
export async function POST(req: NextRequest) {
  const token = cookieStore.get('token')?.value;
  const userInfo = verifyToken(token); // 服务端有 JWT_SECRET
  return Response.json({ info: userInfo });
}
```

**方案二：客户端通过接口获取用户信息**

```typescript
// ✅ 正确：客户端调用接口，让服务端解析 Token
const res = await clientApi.post('/api/bff/login', { username, password });
setUserInfo(res.data.info); // 服务端返回已解析的用户信息
```

### 容易混淆的地方

| 误区                           | 正确理解                                     |
| ------------------------------ | -------------------------------------------- |
| "所有代码都能访问 `.env`"      | 只有服务端和 `NEXT_PUBLIC_` 前缀的变量可访问 |
| "客户端可以解析 JWT"           | 客户端没有密钥，无法验证 Token               |
| "添加 `NEXT_PUBLIC_` 前缀就行" | 会暴露密钥，严重安全问题                     |

---

## 问题二：客户端无法获取 HttpOnly Cookie

### 错误现象

```typescript
'use client';

// ❌ 无法获取 HttpOnly Cookie
const token = document.cookie; // 看不到 token
const token = Cookies.get('token'); // undefined
```

### 出现原因

Cookie 的 `HttpOnly` 属性限制：

| Cookie 类型     | `document.cookie` | 请求自动携带 | 服务端读取 |
| --------------- | ----------------- | ------------ | ---------- |
| 普通 Cookie     | ✅ 可以           | ✅ 是        | ✅ 可以    |
| HttpOnly Cookie | ❌ 不可以         | ✅ 是        | ✅ 可以    |

### 为什么使用 HttpOnly？

- **防 XSS 攻击**：JavaScript 无法读取，即使页面被注入恶意脚本
- **自动携带**：浏览器发送请求时自动带上，无需手动处理

### 错误示例

```typescript
// ❌ 错误：客户端尝试读取 HttpOnly Cookie
'use client';

function getUserInfo() {
  const token = document.cookie.split(';').find((c) => c.includes('token'));
  // token 为 undefined，因为是 HttpOnly
}
```

### 正确做法

**方案一：通过接口让服务端处理**

```typescript
// ✅ 正确：客户端调用接口，服务端从 Cookie 读取 Token
const res = await fetch('/api/me'); // 浏览器自动携带 HttpOnly Cookie
const user = await res.json();
```

**方案二：服务端组件直接读取**

```typescript
// ✅ 正确：Server Component 或 API Route
import { cookies } from 'next/headers';

const cookieStore = await cookies();
const token = cookieStore.get('token')?.value; // 可以读取
```

### 客户端 vs 服务端获取 Cookie 对比

| 场景           | 获取方式                        | 能否读取 HttpOnly |
| -------------- | ------------------------------- | ----------------- |
| **客户端组件** | `document.cookie`               | ❌ 不可以         |
| **客户端组件** | `js-cookie` 库                  | ❌ 不可以         |
| **服务端组件** | `cookies()` from `next/headers` | ✅ 可以           |
| **API Route**  | `cookies()` from `next/headers` | ✅ 可以           |
| **Middleware** | `request.cookies`               | ✅ 可以           |

### 容易混淆的地方

| 误区                        | 正确理解                                          |
| --------------------------- | ------------------------------------------------- |
| "Cookie 都能被 JS 读取"     | HttpOnly Cookie 无法被 JS 读取                    |
| "客户端需要手动携带 Token"  | 浏览器会自动携带 Cookie，无需手动处理             |
| "HttpOnly 更安全所以都用它" | 如果需要客户端读取（如主题设置），不能用 HttpOnly |

---

## 总结

### 核心原则

1. **密钥类变量**（JWT_SECRET、DB_PASSWORD）只在服务端使用
2. **客户端需要公开变量**使用 `NEXT_PUBLIC_` 前缀
3. **Token 验证**只在服务端进行
4. **HttpOnly Cookie** 客户端读不到，但请求会自动携带

### 推荐架构

```
客户端组件
    ↓ 调用接口
API Route（服务端）
    ↓ 读取 HttpOnly Cookie 中的 Token
    ↓ 验证 JWT
    ↓ 返回用户信息
客户端组件接收数据
```

### 快速排查清单

- [ ] 客户端组件是否引用了需要密钥的工具函数？
- [ ] 环境变量是否需要 `NEXT_PUBLIC_` 前缀？
- [ ] 是否尝试在客户端读取 HttpOnly Cookie？
- [ ] Token 验证是否只在服务端进行？
