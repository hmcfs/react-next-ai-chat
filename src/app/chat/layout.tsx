'use client';

import ModelCheck from '@/app/chat/chat-components/ModelCheck';
import { debounce } from '@/lib/debounce';
import { Model, useQuestionStore } from '@/lib/store';
import { clsx } from 'clsx';
import { PanelLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { useShallow } from 'zustand/react/shallow';
import ChatSidebar from '../../components/my/Navibar';

//   封装 cn 工具函数，自动合并 & 去重 Tailwind class
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  //   初始值固定为桌面端状态，SSR/CSR 首次渲染完全一致
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const prevIsMobileRef = useRef(false);
  const { model, setModel } = useQuestionStore(
    useShallow((s) => ({ model: s.model, setModel: s.setModel }))
  );
  const changeModel = (model: Model) => {
    setModel(model);
    localStorage.setItem('model', model);
  };
  useEffect(() => {
    setMounted(true);

    const syncState = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setOpen(!mobile);
      prevIsMobileRef.current = mobile;
    };

    syncState();

    const debouncedResize = debounce(() => {
      const mobile = window.innerWidth < 768;
      if (prevIsMobileRef.current !== mobile) {
        setOpen(!mobile);
        prevIsMobileRef.current = mobile;
      }
      setIsMobile(mobile);
    }, 200);

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      debouncedResize.cancel();
    };
  }, []);

  //  用 cn() 替代模板字符串，彻底消除空白字符差异
  const sidebarContainerClass = cn(
    'h-screen z-[9999] bg-gray-50 box-border transition-all duration-300 ease-in-out',
    mounted && isMobile
      ? cn('fixed left-0 top-0 w-[240px]', open ? 'translate-x-0' : '-translate-x-full')
      : cn('relative flex-shrink-0 overflow-hidden', open ? 'w-[240px]' : 'w-0')
  );

  const sidebarInnerClass = cn(
    'w-[240px] h-full',
    !open && !(mounted && isMobile) && 'opacity-0 pointer-events-none'
  );

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/*  侧边栏容器 */}
      <div className={sidebarContainerClass}>
        <div className={sidebarInnerClass}>
          <ChatSidebar open={open} setOpen={setOpen} />
        </div>
      </div>

      {/*   Mobile backdrop */}
      {mounted && isMobile && open && (
        <div
          className="fixed inset-0 z-[9998] bg-black/20 transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      {/*  Main area */}
      <div className="relative flex-1 h-screen min-w-0 overflow-y-auto">
        <ModelCheck
          parentModel={model}
          changeModel={changeModel}
          className="absolute top-4 left-4"
        />

        {/* 桌面端收起按钮 */}
        {mounted && !isMobile && !open && (
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="absolute top-3 left-3 z-50 cursor-pointer rounded-md bg-white p-1.5 shadow-md hover:bg-gray-100"
            title="展开侧边栏"
          >
            <PanelLeft className="h-5 w-5 rotate-180 transition-transform duration-300" />
          </button>
        )}

        {/* 移动端收起时的按钮 */}
        {mounted && isMobile && !open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="fixed top-3 left-3 z-50 cursor-pointer rounded-md bg-white p-1.5 shadow-md hover:bg-gray-100"
          >
            <PanelLeft className="h-5 w-5" />
          </button>
        )}

        {children}
      </div>
    </div>
  );
}
