import Link from 'next/link';
import { SignInForm } from './SignInForm';

export default function SignInPage() {
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

        {/* 登录表单 */}
        <SignInForm />
      </div>
    </div>
  );
}