'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
 <NextThemesProvider
  attribute="class"        // 用 class 而不是 data-theme 属性
  defaultTheme="system"    // 默认跟随系统
  enableSystem             // 启用系统主题监听
  disableTransitionOnChange // 切换时禁用 CSS transition
>
      {children}
    </NextThemesProvider>
  );
}
