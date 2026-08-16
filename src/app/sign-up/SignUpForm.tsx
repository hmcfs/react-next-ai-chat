'use client';

import { clientApi } from '@/lib/http/client-api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AlertCircle, Check, Eye, EyeOff, Loader2, Lock, Mail, User } from 'lucide-react';

interface FieldErrors {
  username?: string;
  nickname?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const USERNAME_RE = /^[\w一-龥]{2,50}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignUpForm() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = (): boolean => {
    const next: FieldErrors = {};

    if (!username.trim()) {
      next.username = '请输入用户名';
    } else if (!USERNAME_RE.test(username.trim())) {
      next.username = '用户名需为 2-50 个字符（字母、数字、下划线或中文）';
    }

    if (email.trim() && !EMAIL_RE.test(email.trim())) {
      next.email = '邮箱格式不正确';
    }

    if (!password) {
      next.password = '请输入密码';
    } else if (password.length < 6) {
      next.password = '密码至少 6 位';
    }

    if (!confirmPassword) {
      next.confirmPassword = '请再次输入密码';
    } else if (password !== confirmPassword) {
      next.confirmPassword = '两次输入的密码不一致';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');

    if (!agreed) {
      setFormError('请先阅读并同意服务条款与隐私政策');
      return;
    }
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await clientApi.post('/api/bff/register', {
        username: username.trim(),
        password,
        nickname: nickname.trim() || undefined,
        email: email.trim() || undefined,
      });

      if (res.code !== 1) {
        setFormError(res.msg || '注册失败，请稍后重试');
        return;
      }

      // 注册成功，自动登录
      const loginRes = await clientApi.post<{ token: string; userId: string }>('/api/bff/login', {
        username: username.trim(),
        password,
      });

      if (loginRes.code === 1 && loginRes.data?.token) {
        router.push('/chat');
      } else {
        router.push('/sign-in');
      }
    } catch (err) {
      console.error('注册请求异常：', err);
      setFormError('网络异常，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (invalid?: string) =>
    `h-11 w-full rounded-xl border border-input bg-transparent pl-10 pr-4 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ${
      invalid ? 'border-destructive ring-3 ring-destructive/20' : ''
    }`;

  return (
    <div className="w-full max-w-md">
      {/* 移动端品牌 */}
      <div className="mb-10 flex items-center gap-2.5 lg:hidden">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 9.75h4.5m-4.5 3.75h4.5M12 3.75c-3.75 0-6.75 2.25-6.75 6.75 0 3.375 1.875 5.25 3.75 6.75l-1.5 4.5 4.5-2.25c3 1.125 6.75 0 7.5-4.5"
            />
          </svg>
        </div>
        <span className="text-lg font-semibold tracking-tight">Clair</span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">创建账户</h1>
      <p className="mt-2 text-sm text-muted-foreground">开始你的第一段对话，只需一分钟</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
        {formError && (
          <div className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 px-3.5 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="username" className="text-sm font-medium">
            用户名 <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="2-50 个字符，将作为你的登录名"
              className={inputClass(errors.username)}
            />
          </div>
          {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="nickname" className="text-sm font-medium">
            昵称
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center">
              <Check className="h-4 w-4 text-muted-foreground" />
            </span>
            <input
              id="nickname"
              type="text"
              autoComplete="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="展示给其他用户的名称（选填）"
              className={inputClass(errors.nickname)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            邮箱
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com（选填）"
              className={inputClass(errors.email)}
            />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            密码 <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位"
              className={inputClass(errors.password)}
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
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium">
            确认密码 <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="再次输入密码"
              className={inputClass(errors.confirmPassword)}
            />
          </div>
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-foreground"
          />
          <span>
            我已阅读并同意<span className="font-medium text-foreground">《服务条款》</span>与
            <span className="font-medium text-foreground">《隐私政策》</span>
          </span>
        </label>

        <button
          type="submit"
          disabled={isLoading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground text-sm font-semibold text-background shadow-lg shadow-black/10 transition-all hover:opacity-90 active:translate-y-px disabled:pointer-events-none disabled:opacity-60 dark:shadow-white/5"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              创建中...
            </>
          ) : (
            '创建账户'
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        已有账户？{' '}
        <Link
          href="/sign-in"
          className="font-semibold text-foreground underline-offset-4 transition-colors hover:underline"
        >
          去登录
        </Link>
      </p>
    </div>
  );
}
