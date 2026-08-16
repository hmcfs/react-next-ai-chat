'use client';

import { clientApi } from '@/lib/http/client-api';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('请填写用户名和密码');
      return;
    }

    setIsLoading(true);
    try {
      const res = await clientApi.post<{ token: string; userId: string }>('/api/bff/login', {
        username: email.trim(),
        password,
      });

      if (res.code === 1 && res.data?.token) {
        router.push('/chat');
      } else {
        setError(res.msg || '用户名或密码错误');
      }
    } catch (err) {
      console.error('登录请求异常：', err);
      setError('网络异常，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const socialPlaceholder = () => toast.info('暂未开放，敬请期待');

  return (
    <div className="w-full max-w-md">
      {/* 移动端品牌 */}
      <div className="mb-10 flex items-center gap-2.5 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 9.75h4.5m-4.5 3.75h4.5M12 3.75c-3.75 0-6.75 2.25-6.75 6.75 0 3.375 1.875 5.25 3.75 6.75l-1.5 4.5 4.5-2.25c3 1.125 6.75 0 7.5-4.5"
            />
          </svg>
        </div>
        <span className="text-lg font-semibold tracking-tight">Clair</span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">欢迎回来</h1>
      <p className="mt-2 text-sm text-muted-foreground">登录以继续使用 Clair</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium">
            用户名或邮箱
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-11 w-full rounded-xl border border-input bg-transparent pl-10 pr-4 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              密码
            </label>
            <a
              href="mailto:support@clair-ai.com"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              忘记密码？
            </a>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 w-full rounded-xl border border-input bg-transparent pl-10 pr-11 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? '隐藏密码' : '显示密码'}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground text-sm font-semibold text-background shadow-lg shadow-black/10 transition-all hover:opacity-90 active:translate-y-px disabled:pointer-events-none disabled:opacity-60 dark:shadow-white/5"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              登录中...
            </>
          ) : (
            '登录'
          )}
        </button>
      </form>

      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">或继续使用</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={socialPlaceholder}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-input bg-transparent text-sm font-medium transition-colors hover:bg-muted"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </button>
        <button
          type="button"
          onClick={socialPlaceholder}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-input bg-transparent text-sm font-medium transition-colors hover:bg-muted"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.54 1.14-1.873 1.14-.384 0-.984-.36-1.568-.84-.689-.554-1.291-1.15-1.291-1.95 0-.864.394-1.73 1.052-2.32.548-.5 1.443-.81 2.21-.81.79 0 1.55.32 2.04.72.04.03.07.05.11.08h-.004zm-2.27 3.61c.38 0 2.31.18 3.61 1.66.01 0 1.19.86 1.19 2.66 0 1.86-1.11 2.94-1.81 3.62-.47.47-.83.88-.83 1.4 0 .5.33.94.67 1.38.34.44.86 1.03 1.24 1.8.38.78.65 1.53.65 2.2 0 1.82-1.03 3.1-1.72 3.82-.54.56-1.18 1.11-2.01 1.11-.84 0-1.11-.53-2.12-.53-.93 0-1.33.55-2.09.55-.76 0-1.32-.49-1.85-1.03-.71-.72-1.5-1.89-1.5-3.42 0-1.5.54-2.89 1.08-3.82.36-.62 1.07-1.41 1.89-1.41.73 0 1.22.48 2.03.48.79 0 1.23-.5 2.03-.5.78 0 1.46.62 1.8 1.04.38.46.81.82 1.02 1.16 0 0 .42-.16.85-.3.22-.07.51-.15.82-.15.83 0 1.08.44 1.08.44s-.36.54-.67 1.04c-.35.56-.6.88-1.17.88-.48 0-.96-.25-1.28-.5-.27-.21-.7-.5-1.4-.5-.98 0-2.32.87-2.32 2.6 0 1.08.46 2.06 1.09 2.76.44.5.91.82 1.42.82.5 0 .89-.56 1.36-.56.47 0 .83.38 1.13.74.43.51.63.87.63 1.18 0 .56-.52 1.02-1.12 1.49-.58.47-1.34.94-2.36.94-1.15 0-2.08-.5-2.81-1.02-.72-.52-1.29-1.17-1.79-1.82-.72-.95-1.24-1.97-1.24-3.34 0-1.85.89-3.39 1.84-4.3.69-.67 1.49-1.02 2.3-1.02.99 0 1.71.5 2.5.5.77 0 1.19-.48 1.99-.48.81 0 1.61.5 2.28 1.2.41.44.9 1.03.9 1.89 0 .36-.05.72-.15 1.04.11-.01.22-.01.33-.01.59 0 1.14.15 1.62.39z" />
          </svg>
          Apple
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        还没有账户？{' '}
        <Link
          href="/register"
          className="font-semibold text-foreground underline-offset-4 transition-colors hover:underline"
        >
          立即注册
        </Link>
      </p>
    </div>
  );
}
