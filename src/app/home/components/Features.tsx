'use client';

import { Brain, ClipboardPaste, FileUp, History, MessageSquare, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

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

export function Features() {
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