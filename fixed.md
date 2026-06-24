### 📋 Next.js Hydration Mismatch 问题复盘总结

本次在 `ChatLayout` 组件中遇到的水合错误，是 Next.js SSR 项目中最典型的“环境差异”问题。以下是完整的问题链路与处理方案总结：

#### 1. 核心问题诊断

- **报错现象**：控制台报 `Hydration failed because the server rendered HTML didn't match the client`，Diff 显示 `<button>` 与 `<div>` 标签不匹配，且 `className` 字符串存在不可见的字符差异。
- **根因一（状态分歧）**：在 `useState` 初始化函数中直接调用了 `getInitialMobileState()` 读取 `window.innerWidth`。服务端渲染时 `window` 不存在返回默认桌面端状态，而客户端水合时立即返回真实移动端状态，导致 React 首帧虚拟 DOM 与服务端 HTML 结构完全不同。
- **根因二（空白字符差异）**：使用多行模板字符串拼接 Tailwind class，其中的换行符 `\n` 和缩进空格在服务端序列化与 Turbopack 客户端编译时被处理方式不同，导致即使逻辑分支一致，最终的 className 字符串也无法逐字节匹配。

#### 2. 解决方案与关键修改

| 修复维度         | 错误做法 ❌                                | 正确做法 ✅                           | 原理说明                                          |
| :--------------- | :----------------------------------------- | :------------------------------------ | :------------------------------------------------ |
| **状态初始化**   | `useState(() => getWindowState())`         | `useState(false)` + `useEffect` 同步  | 保证 SSR/CSR 首次渲染输出完全一致的基准 HTML      |
| **条件渲染守卫** | 直接 `{isMobile && <Button />}`            | `{mounted && isMobile && <Button />}` | 挂载前强制走服务端分支，避免水合期间出现 DOM 差异 |
| **Class 拼接**   | 多行模板字符串 `` `${cond ? 'a' : 'b'}` `` | `cn('base', cond && 'a')`             | 消除隐藏空白字符，输出纯净单行字符串              |
| **样式冲突**     | 手动管理互斥的 Tailwind 类                 | `clsx` + `tailwind-merge` 封装 `cn()` | 自动过滤 falsy 值并去重冲突类名                   |

#### 3. 沉淀的最佳实践

1.  **SSR 安全铁律**：永远不要在 `useState`、`useMemo` 等初始化阶段访问 `window`、`document`、`localStorage` 或 `Date.now()`。所有浏览器 API 调用必须包裹在 `useEffect` 中。
2.  **告别模板字符串拼 Class**：在 Next.js + Tailwind 项目中，将所有动态 class 拼接统一替换为 `cn()` 工具函数（`clsx` + `twMerge`）。这不仅是代码规范，更是预防 Hydration Error 的工程化防线。
3.  **双态组件标准模式**：对于依赖响应式/用户环境的组件，采用 **“固定初始值 → mounted 标记 → 条件渲染”** 三步法。虽然会产生短暂的客户端闪烁（FOUC），但这是保证 SSR 稳定性的必要代价；若追求极致体验，应优先改用纯 CSS 媒体查询（如 `md:hidden`）替代 JS 判断。
4.  **排查干扰项**：当代码逻辑确认无误但仍报 Hydration 错误时，务必使用浏览器无痕模式测试，排除翻译插件、暗黑模式扩展等注入额外 DOM 节点的干扰。

> 💡 **核心认知**：Hydration 错误的本质不是“客户端写错了”，而是“服务端和客户端没有达成共识”。修复思路永远是**向服务端的确定性对齐**，而非试图让服务端猜测客户端的环境。
