import type { LucideIcon } from 'lucide-react';
import { ChatPreview, type ChatPreviewItem } from './chat-preview';

export interface AuthFeature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

interface AuthShellProps {
  headline: string;
  tagline: string;
  chats: ChatPreviewItem[];
  features: AuthFeature[];
  children: React.ReactNode;
}

export function AuthShell({ headline, tagline, chats, features, children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* 左侧品牌面板：两种主题下都保持深色 */}
      <aside className="relative hidden w-1/2 overflow-hidden bg-zinc-950 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        {/* 网格线背景 */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:52px_52px]"
        />
        {/* 径向光晕 */}
        <div
          aria-hidden
          className="absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-48 -left-32 h-[26rem] w-[26rem] rounded-full bg-violet-600/15 blur-3xl"
        />
        {/* 顶部渐变消隐 */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-zinc-950 to-transparent" />

        <header className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 9.75h4.5m-4.5 3.75h4.5M12 3.75c-3.75 0-6.75 2.25-6.75 6.75 0 3.375 1.875 5.25 3.75 6.75l-1.5 4.5 4.5-2.25c3 1.125 6.75 0 7.5-4.5"
              />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">Clair</span>
        </header>

        <div className="relative my-10">
          <h2 className="max-w-md text-3xl font-bold leading-snug tracking-tight text-white xl:text-4xl">
            {headline}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">{tagline}</p>

          <div className="mt-10">
            <ChatPreview chats={chats} />
          </div>
        </div>

        <footer className="relative grid grid-cols-3 gap-6 border-t border-white/10 pt-8">
          {features.map((f) => (
            <div key={f.title}>
              <f.icon className="h-4 w-4 text-indigo-400" />
              <p className="mt-2 text-sm font-medium text-zinc-200">{f.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">{f.desc}</p>
            </div>
          ))}
        </footer>
      </aside>

      {/* 右侧表单面板：跟随主题 */}
      <main className="relative flex flex-1 items-center justify-center px-6 py-12 sm:px-10">
        {children}
      </main>
    </div>
  );
}
