'use client';
import { clientApi } from '@/lib/http/client-api';
import { useAuthStore } from '@/lib/store';
import type { UserInfo } from '@/types/user.type';
import { AlertCircle, Eye, EyeOff, Loader2, Lock, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUserInfo, userInfo, clearUserInfo } = useAuthStore(
    useShallow((state) => ({
      setUserInfo: state.setUserInfo,
      userInfo: state.userInfo,
      clearUserInfo: state.clearUserInfo,
    }))
  );
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('请填写用户名和密码');
      return;
    }

    setIsLoading(true);
    try {
      const res = await clientApi.post<{
        token: string;
        info: UserInfo;
      }>('/api/bff/login', {
        username: email.trim(),
        password,
      });

      if (res.code === 1 && res.data?.token && res.data?.info) {
        setUserInfo(res.data?.info);
        router.push('/chat');
      } else {
        if (userInfo) clearUserInfo();
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
          <svg
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M22 4L12 13 2 4" />
          </svg>
          QQ邮箱
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
