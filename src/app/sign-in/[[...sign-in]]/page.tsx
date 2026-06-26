'use client';

import { clientApi } from '@/lib/client-request';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const login = async () => {
    setError('');
    setIsLoading(true);

    const res = await clientApi.post<{
      code: number;

      message: string;
    }>(
      '/api/login',

      {
        username: email,
        password,
      }
    );

    if (!res.code) {
      setError(res?.msg || '用户名或密码错误');
      setIsLoading(false);
      return;
    }
    /*    let chatId = localStorage.getItem('chatId');
    if (chatId === null) {
      chatId = v4().replace(/-/g, '');

      localStorage.setItem('chatId', chatId);
    } */
    router.push('/chat');

    //router.refresh();
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password) {
      setError('请填写所有字段');
      return;
    }

    try {
      await login();
    } catch (error) {
      console.error('登录请求异常：', error);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-zinc-100 px-4 dark:from-zinc-950 dark:via-black dark:to-zinc-900">
      {/* 背景装饰 */}
      <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/10" />
      <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full from-amber-400/20 via-pink-400/20 to-purple-400/20 blur-3xl dark:from-amber-600/10 dark:via-pink-600/10 dark:to-purple-600/10" />
      <div className="absolute top-1/3 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl dark:bg-sky-600/5" />

      <div className="relative w-full max-w-md">
        {/* Logo / 标题 */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
            <svg
              className="h-7 w-7 text-white"
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
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            欢迎回来
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">登录您的账户以继续</p>
        </div>

        {/* 登录卡片 */}
        <div className="rounded-2xl border border-zinc-200/60 bg-white/70 p-8 shadow-xl shadow-zinc-900/5 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-900/70 dark:shadow-black/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 错误提示 */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400">
                <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            {/* 邮箱 */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                邮箱
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-zinc-200 bg-white/50 px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-white dark:placeholder-zinc-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20"
              />
            </div>

            {/* 密码 */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  密码
                </label>
                <button
                  type="button"
                  className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  忘记密码？
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-zinc-200 bg-white/50 px-4 py-2.5 pr-11 text-sm text-zinc-900 placeholder-zinc-400 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-white dark:placeholder-zinc-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  {showPassword ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  登录中...
                </span>
              ) : (
                '登录'
              )}
            </button>
          </form>

          {/* 社交登录 */}
          <div className="mt-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-700" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white/70 px-2 text-zinc-400 dark:bg-zinc-900/70 dark:text-zinc-500">
                  或继续使用
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white/50 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-800">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
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
              <button className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white/50 px-4 py-2.5 text-sm font-medium text-zinc-700 transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-800">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.54 1.14-1.873 1.14-.384 0-.984-.36-1.568-.84-.689-.554-1.291-1.15-1.291-1.95 0-.864.394-1.73 1.052-2.32.548-.5 1.443-.81 2.21-.81.79 0 1.55.32 2.04.72.04.03.07.05.11.08h-.004zm-2.27 3.61c.38 0 2.31.18 3.61 1.66.01 0 1.19.86 1.19 2.66 0 1.86-1.11 2.94-1.81 3.62-.47.47-.83.88-.83 1.4 0 .5.33.94.67 1.38.34.44.86 1.03 1.24 1.8.38.78.65 1.53.65 2.2 0 1.82-1.03 3.1-1.72 3.82-.54.56-1.18 1.11-2.01 1.11-.84 0-1.11-.53-2.12-.53-.93 0-1.33.55-2.09.55-.76 0-1.32-.49-1.85-1.03-.71-.72-1.5-1.89-1.5-3.42 0-1.5.54-2.89 1.08-3.82.36-.62 1.07-1.41 1.89-1.41.73 0 1.22.48 2.03.48.79 0 1.23-.5 2.03-.5.78 0 1.46.62 1.8 1.04.38.46.81.82 1.02 1.16 0 0 .42-.16.85-.3.22-.07.51-.15.82-.15.83 0 1.08.44 1.08.44s-.36.54-.67 1.04c-.35.56-.6.88-1.17.88-.48 0-.96-.25-1.28-.5-.27-.21-.7-.5-1.4-.5-.98 0-2.32.87-2.32 2.6 0 1.08.46 2.06 1.09 2.76.44.5.91.82 1.42.82.5 0 .89-.56 1.36-.56.47 0 .83.38 1.13.74.43.51.63.87.63 1.18 0 .56-.52 1.02-1.12 1.49-.58.47-1.34.94-2.36.94-1.15 0-2.08-.5-2.81-1.02-.72-.52-1.29-1.17-1.79-1.82-.72-.95-1.24-1.97-1.24-3.34 0-1.85.89-3.39 1.84-4.3.69-.67 1.49-1.02 2.3-1.02.99 0 1.71.5 2.5.5.77 0 1.19-.48 1.99-.48.81 0 1.61.5 2.28 1.2.41.44.9 1.03.9 1.89 0 .36-.05.72-.15 1.04.11-.01.22-.01.33-.01.59 0 1.14.15 1.62.39z" />
                </svg>
                Apple
              </button>
            </div>
          </div>

          {/* 注册链接 */}
          <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            还没有账户？{' '}
            <Link
              href="/sign-up"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              立即注册
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
