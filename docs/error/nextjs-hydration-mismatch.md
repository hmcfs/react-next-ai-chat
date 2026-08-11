# Next.js Hydration Mismatch 问题

## 问题描述

在 `ChatLayout` 组件中遇到水合错误，控制台报 `Hydration failed because the server rendered HTML didn't match the client`，Diff 显示 `<button>` 与 `<div>` 标签不匹配，且 `className` 字符串存在不可见的字符差异。

## 根因分析

### 根因一：状态分歧

在 `useState` 初始化函数中直接调用了 `getInitialMobileState()` 读取 `window.innerWidth`。服务端渲染时 `window` 不存在返回默认桌面端状态，而客户端水合时立即返回真实移动端状态，导致 React 首帧虚拟 DOM 与服务端 HTML 结构完全不同。

### 根因二：空白字符差异

使用多行模板字符串拼接 Tailwind class，其中的换行符 `\n` 和缩进空格在服务端序列化与 Turbopack 客户端编译时被处理方式不同，导致即使逻辑分支一致，最终的 className 字符串也无法逐字节匹配。

## 解决方案

| 修复维度         | 错误做法 ❌                                | 正确做法 ✅                           | 原理说明                                          |
| :--------------- | :----------------------------------------- | :------------------------------------ | :------------------------------------------------ |
| **状态初始化**   | `useState(() => getWindowState())`         | `useState(false)` + `useEffect` 同步  | 保证 SSR/CSR 首次渲染输出完全一致的基准 HTML      |
| **条件渲染守卫** | 直接 `{isMobile && <Button />}`            | `{mounted && isMobile && <Button />}` | 挂载前强制走服务端分支，避免水合期间出现 DOM 差异 |
| **Class 拼接**   | 多行模板字符串 `` `${cond ? 'a' : 'b'}` `` | `cn('base', cond && 'a')`             | 消除隐藏空白字符，输出纯净单行字符串              |
| **样式冲突**     | 手动管理互斥的 Tailwind 类                 | `clsx` + `tailwind-merge` 封装 `cn()` | 自动过滤 falsy 值并去重冲突类名                   |

## 解决方案：useSyncExternalStore（React 18）

React 18 提供了 `useSyncExternalStore` Hook，专门用于解决 SSR 场景下读取外部数据（如 `window`、`document`、`localStorage` 等）导致的水合不匹配问题。

### 使用场景

当组件需要读取浏览器 API 或外部 store 时，使用 `useSyncExternalStore` 替代 `useState` + `useEffect` 的组合。

### API 说明

```typescript
useSyncExternalStore<T>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => T,
  getServerSnapshot?: () => T
)
```

- **subscribe**：订阅外部 store 变化的函数，返回取消订阅函数
- **getSnapshot**：客户端读取当前值的函数
- **getServerSnapshot**：服务端读取当前值的函数（可选，SSR 时必须提供）

### 示例：响应式窗口宽度

```typescript
import { useSyncExternalStore } from 'react';

// 订阅窗口 resize 事件
function subscribe(callback: () => void) {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}

// 客户端获取当前窗口宽度
function getClientSnapshot() {
  return window.innerWidth;
}

// 服务端获取默认值（SSR 时使用）
function getServerSnapshot() {
  return 1024; // 默认桌面端宽度
}

// 在组件中使用
function ResponsiveComponent() {
  const width = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const isMobile = width < 768;

  return (
    <div>
      {isMobile ? <MobileView /> : <DesktopView />}
    </div>
  );
}
```

### 示例：读取 localStorage

```typescript
import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getClientSnapshot() {
  return localStorage.getItem('theme') || 'light';
}

function getServerSnapshot() {
  return 'light'; // 服务端默认值
}

function ThemeSelector() {
  const theme = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  return <div className={theme}>Current theme: {theme}</div>;
}
```

### 与 useState + useEffect 对比

| 方案                     | 优点                                  | 缺点                                     |
| :----------------------- | :------------------------------------ | :--------------------------------------- |
| `useState` + `useEffect` | 简单易懂                              | 需要手动管理 mounted 状态，可能产生 FOUC |
| `useSyncExternalStore`   | React 官方推荐，自动处理 SSR/CSR 差异 | 需要编写 subscribe 和 snapshot 函数      |

## 最佳实践

1. **优先使用 useSyncExternalStore**：React 18+ 项目中，读取浏览器 API 或外部 store 时，优先使用 `useSyncExternalStore` 而非 `useState` + `useEffect` 组合。它能自动处理 SSR/CSR 差异，避免水合不匹配。

2. **SSR 安全铁律**：永远不要在 `useState`、`useMemo` 等初始化阶段访问 `window`、`document`、`localStorage` 或 `Date.now()`。所有浏览器 API 调用必须使用 `useSyncExternalStore` 或包裹在 `useEffect` 中。

3. **告别模板字符串拼 Class**：在 Next.js + Tailwind 项目中，将所有动态 class 拼接统一替换为 `cn()` 工具函数（`clsx` + `twMerge`）。这不仅是代码规范，更是预防 Hydration Error 的工程化防线。

4. **双态组件标准模式**：对于依赖响应式/用户环境的组件，采用 **"固定初始值 → mounted 标记 → 条件渲染"** 三步法。虽然会产生短暂的客户端闪烁（FOUC），但这是保证 SSR 稳定性的必要代价；若追求极致体验，应优先改用纯 CSS 媒体查询（如 `md:hidden`）替代 JS 判断。

5. **排查干扰项**：当代码逻辑确认无误但仍报 Hydration 错误时，务必使用浏览器无痕模式测试，排除翻译插件、暗黑模式扩展等注入额外 DOM 节点的干扰。

> 💡 **核心认知**：Hydration 错误的本质不是"客户端写错了"，而是"服务端和客户端没有达成共识"。修复思路永远是**向服务端的确定性对齐**，而非试图让服务端猜测客户端的环境。
