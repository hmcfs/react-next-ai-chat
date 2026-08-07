'use client';

import {
  ArrowRight,
  Brain,
  ChevronDown,
  ClipboardPaste,
  FileUp,
  History,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

/* ============ 滚动入场 hook ============ */
function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/* ============ 数据 ============ */
const STATS = [
  { value: '多模型', label: '随时切换对话模型' },
  { value: '流式输出', label: '逐字生成，即时响应' },
  { value: '50MB', label: '大文件上传上限' },
  { value: '图片理解', label: '上传即聊，看图问答' },
];

const FEATURES = [
  {
    icon: MessageSquare,
    title: '多模型对话',
    desc: '内置多款对话模型，流畅的流式输出，随时切换满足不同场景。',
  },
  {
    icon: Brain,
    title: '深度思考',
    desc: 'AI 展示推理过程，复杂问题拆解得更清晰，答案更可靠。',
  },
  {
    icon: FileUp,
    title: '图片 / 文件上传',
    desc: '支持 PDF、Word、Excel、图片等，卡片式预览，点击在线查看。',
  },
  {
    icon: ClipboardPaste,
    title: '粘贴即传',
    desc: '截图、文件直接 Ctrl+V 粘贴上传，无需先保存到本地。',
  },
  {
    icon: History,
    title: '历史记录',
    desc: '对话自动保存，按时间分组，随时回看与续聊。',
  },
  {
    icon: Zap,
    title: '即时响应',
    desc: '流式生成 + 平滑动画，等待更少，反馈更快。',
  },
];

const STEPS = [
  {
    icon: MessageSquare,
    title: '输入你的问题',
    desc: '在输入框里输入任何想问的事，或直接粘贴截图与文件。',
  },
  {
    icon: Brain,
    title: 'AI 深度思考',
    desc: '模型流式生成答案，推理过程清晰可见，随时追问。',
  },
  {
    icon: History,
    title: '随时回来继续',
    desc: '对话自动保存到侧边栏，换设备也能接着聊。',
  },
];

const FAQS = [
  { q: '如何开始一次新对话？', a: '点击右上角「开始新的对话」，或直接访问 /chat 页面输入问题即可，无需复杂配置。' },
  { q: '支持哪些文件类型？', a: '图片支持 png / jpeg / webp / gif；文件支持 pdf、doc、docx、txt、xlsx、xls。' },
  { q: '上传的内容安全吗？', a: '文件上传到私有存储，仅用于本次对话分析，不会对外公开。' },
  { q: '可以调整对话模型吗？', a: '对话页左上角可以切换不同模型，你的选择会保存在本地，下次自动生效。' },
];

/* ============ 聊天演示（带打字动画） ============ */
function ChatMockup() {
  const reply = '当然可以！用 requests + BeautifulSoup 抓取网页标题：';
  const [typed, setTyped] = useState('');

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setTyped(reply.slice(0, i));
      if (i >= reply.length) clearInterval(timer);
    }, 45);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-xl shadow-neutral-500/5 animate-in fade-in-0 zoom-in-95 duration-500 ease-out delay-100">
      {/* 窗口头部 */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
          <span className="text-sm font-medium">Clair · 深度思考</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs text-muted-foreground">在线</span>
        </div>
      </div>

      {/* 对话内容 */}
      <div className="space-y-3 pt-4">
        {/* 用户气泡（深色渐变） */}
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-neutral-800 to-neutral-600 px-3 py-2 text-sm text-white">
            帮我写一段用 Python 抓取网页标题的代码
          </div>
        </div>
        {/* AI 气泡 */}
        <div className="flex items-start gap-2">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
          <div className="max-w-[88%] rounded-2xl rounded-tl-sm border border-border/60 bg-muted px-3 py-2 text-sm leading-relaxed text-foreground">
            {typed}
            <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-pulse bg-foreground align-middle" />
            <br />
            <span className="mt-1.5 block rounded-md bg-card px-2 py-1 font-mono text-xs text-neutral-600 dark:text-neutral-400">
              title = soup.find(&apos;title&apos;).text
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ 功能网格（滚动入场） ============ */
function Features() {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <section id="features" className="mx-auto max-w-5xl px-6 py-20">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">让对话更高效</h2>
        <p className="mt-3 text-muted-foreground">把复杂的操作，藏进简单的对话里</p>
      </div>
      <div
        ref={ref}
        className={`mt-12 grid gap-4 transition-all duration-700 ease-out sm:grid-cols-2 lg:grid-cols-3 ${
          inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
        }`}
      >
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-transform duration-200 group-hover:scale-110">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-medium">{f.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============ 三步说明（滚动入场） ============ */
function HowItWorks() {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <section className="border-y border-border/60 bg-muted/30">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">三步开始</h2>
          <p className="mt-3 text-muted-foreground">从提问到获得答案，只需几秒钟</p>
        </div>
        <div
          ref={ref}
          className={`mt-12 grid gap-6 transition-all duration-700 ease-out sm:grid-cols-3 ${
            inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border border-border bg-card p-6 shadow-sm">
              <span className="absolute right-4 top-4 text-4xl font-bold text-foreground/10">{i + 1}</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-medium">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ FAQ 折叠 ============ */
function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-2xl px-6 py-20">
      <h2 className="text-center text-3xl font-bold tracking-tight">常见问题</h2>
      <div className="mt-8 space-y-3">
        {FAQS.map((item, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-200"
          >
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors duration-200 hover:bg-muted"
            >
              <span className="font-medium">{item.q}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                  open === i ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`transition-all duration-300 ease-in-out ${
                open === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============ 主页面 ============ */
export default function HomePage() {
  const router = useRouter();

  const btnPrimary =
    'inline-flex items-center gap-2 rounded-full bg-foreground text-background transition-all duration-200 hover:opacity-90 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground';
  const btnGhost =
    'inline-flex items-center gap-2 rounded-full border border-border bg-card transition-colors duration-200 hover:bg-muted';

  return (
    <div className="min-h-dvh w-full bg-background text-foreground">
      {/* ===== 顶部导航 ===== */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <button
            type="button"
            onClick={() => router.push('/home')}
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
          </button>
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
              {/* GitHub Octocat 官方图标 */}
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
        {/* 背景光斑（中性灰阶，弱化 AI 蓝） */}
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
          <div className="absolute -left-32 -top-24 h-96 w-96 rounded-full bg-neutral-400/15 blur-3xl dark:bg-neutral-500/10" />
          <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-neutral-300/15 blur-3xl dark:bg-neutral-600/10" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-neutral-400/10 blur-3xl dark:bg-neutral-500/10" />
        </div>

        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
          {/* 左侧文案 */}
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
              <button
                type="button"
                onClick={() => router.push('/chat')}
                className={`${btnPrimary} px-6 py-3`}
              >
                立即开始
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </button>
              <a href="#features" className={`${btnGhost} px-6 py-3`}>
                了解功能
              </a>
            </div>
          </div>

          {/* 右侧聊天演示 */}
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
          <button
            type="button"
            onClick={() => router.push('/chat')}
            className={`${btnPrimary} mt-8 px-7 py-3`}
          >
            开始新的对话
            <ArrowRight className="h-4 w-4" />
          </button>
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
    </div>
  );
}
