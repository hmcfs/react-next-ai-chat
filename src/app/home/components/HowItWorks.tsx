'use client';

import { History, Brain, MessageSquare } from 'lucide-react';
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

export function HowItWorks() {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section className="border-y border-border/60 bg-muted/30">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">三步开始</h2>
          <p className="mt-3 text-muted-foreground">从提问到得答案，只需几秒钟</p>
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