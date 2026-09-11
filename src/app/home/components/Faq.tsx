'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const FAQS = [
  { q: '如何开始一次新对话？', a: '点击右上角「开始新的对话」，或直接访问 /chat 页面输入问题即可，无需复杂配置。' },
  { q: '支持哪些文件类型？', a: '图片支持 png / jpeg / webp / gif；文件支持 pdf、doc、docx、txt、xlsx、xls。' },
  { q: '上传的内容安全吗？', a: '文件上传到私有存储，仅用于本次对话分析，不会对外公开。' },
  { q: '可以调整对话模型吗？', a: '对话页左上角可以切换不同模型，你的选择会保存在本地，下次自动生效。' },
];

export function Faq() {
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