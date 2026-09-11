'use client';

import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ChatMockup() {
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

      <div className="space-y-3 pt-4">
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-neutral-800 to-neutral-600 px-3 py-2 text-sm text-white">
            帮我写一段用 Python 抓取网页标题的代码
          </div>
        </div>
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