import { ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { ChatMockup } from './components/ChatMockup';
import { Faq } from './components/Faq';
import { Features } from './components/Features';
import { HowItWorks } from './components/HowItWorks';

// ISR：每小时重新生成一次
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Clair - 清爽的 AI 对话助手',
  description: '多模型支持、深度思考、图片与文件即传即聊、历史记录自动保存。让复杂的问题，用对话的方式解决。',
  openGraph: {
    title: 'Clair - 清爽的 AI 对话助手',
    description: '多模型支持、深度思考、图片与文件即传即聊、历史记录自动保存',
    type: 'website',
    url: 'https://clair-ai.com/home',
    images: [
      {
        url: '/og-home.png',
        width: 1200,
        height: 630,
        alt: 'Clair - AI 对话助手',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clair - 清爽的 AI 对话助手',
    description: '多模型支持、深度思考、图片与文件即传即聊',
    images: ['/og-home.png'],
  },
  alternates: {
    canonical: 'https://clair-ai.com/home',
  },
};

const STATS = [
  { value: '多模型', label: '随时切换对话模型' },
  { value: '流式输出', label: '逐字生成，即时响应' },
  { value: '50MB', label: '大文件上传上限' },
  { value: '图片理解', label: '上传即聊，看图问答' },
];

export default function HomePage() {
  return (
    <div className="min-h-dvh w-full bg-background text-foreground">
      {/* ===== 顶部导航 ===== */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link
            href="/home"
            className="group flex items-center gap-2 transition-opacity hover:opacity-80"
            aria-label="Clair 首页"
          >
            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/font2.png"
                alt="Clair 图标"
                width={32}
                height={32}
                className="h-8 w-8 object-cover"
              />
            </span>
            <span className="text-lg font-bold tracking-tight">Clair</span>
          </Link>
          <nav className="flex items-center gap-5">
            <a
              href="#features"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              功能
            </a>
            <a
              href="#faq"
              className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              常见问题
            </a>
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm transition-colors duration-200 hover:bg-muted"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              GitHub
            </a>
          </nav>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute -left-32 -top-24 h-96 w-96 rounded-full bg-neutral-400/15 blur-3xl dark:bg-neutral-500/10" />
          <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-neutral-300/15 blur-3xl dark:bg-neutral-600/10" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-neutral-400/10 blur-3xl dark:bg-neutral-500/10" />
        </div>

        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <div className="animate-in fade-in-0 slide-in-from-bottom-3 duration-500 ease-out">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                清爽 · 专注 · 强大
              </span>
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight animate-in fade-in-0 slide-in-from-bottom-3 duration-500 ease-out delay-75 sm:text-5xl">
              和 AI 对话，
              <br />
              <span className="bg-gradient-to-r from-neutral-900 via-neutral-600 to-neutral-400 bg-clip-text text-transparent dark:from-white dark:via-neutral-300 dark:to-neutral-500">
                像聊天一样简单
              </span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-3 duration-500 ease-out delay-150">
              Clair 是一款清爽的 AI 对话助手：多模型支持、深度思考、图片与文件即传即聊、历史记录自动保存。让复杂的问题，用对话的方式解决。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 animate-in fade-in-0 zoom-in-95 duration-500 ease-out delay-200">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 transition-all duration-200 hover:opacity-90 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                立即开始
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <a href="#features" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 transition-colors duration-200 hover:bg-muted">
                了解功能
              </a>
            </div>
          </div>

          <ChatMockup />
        </div>
      </section>

      {/* ===== 数据亮点 ===== */}
      <section className="border-y border-border/60 bg-muted/30">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-10 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.value} className="text-center">
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 功能 ===== */}
      <Features />

      {/* ===== 三步 ===== */}
      <HowItWorks />

      {/* ===== CTA 横幅 ===== */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-muted/50 px-8 py-14 text-center">
          <h2 className="text-3xl font-bold tracking-tight">准备好开始了吗？</h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            免费、清爽、即刻可用。打开 Clair，和 AI 聊聊你的第一个问题。
          </p>
          <Link
            href="/chat"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground text-background px-7 py-3 transition-all duration-200 hover:opacity-90 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            开始新的对话
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <Faq />

      {/* ===== 页脚 ===== */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg">
              <Image
                src="/font2.png"
                alt="Clair 图标"
                width={28}
                height={28}
                className="h-7 w-7 object-cover"
              />
            </span>
            <span className="text-sm font-semibold">Clair</span>
            <span className="text-xs text-muted-foreground">© 2026</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="#features" className="transition-colors hover:text-foreground">
              功能
            </a>
            <a href="#faq" className="transition-colors hover:text-foreground">
              常见问题
            </a>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              私有存储
            </span>
          </div>
        </div>
      </footer>

      {/* ===== JSON-LD 结构化数据 ===== */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Clair',
            description: '清爽的 AI 对话助手：多模型支持、深度思考、图片与文件即传即聊',
            url: 'https://clair-ai.com/home',
            applicationCategory: 'ChatApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'CNY',
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '1024',
            },
          }),
        }}
      />
    </div>
  );
}