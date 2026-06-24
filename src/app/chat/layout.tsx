'use client';

import { useState, useEffect, useRef } from 'react';
import ChatSidebar from '../components/Navibar';
import { PanelLeft } from 'lucide-react';
import { debounce } from '@/lib/debounce';

function getInitialMobileState() {
  if (typeof window === 'undefined') return { isMobile: false, open: true };
  const mobile = window.innerWidth < 768;
  return { isMobile: mobile, open: !mobile };
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(() => getInitialMobileState().isMobile);
  const [open, setOpen] = useState(() => getInitialMobileState().open);
  const prevIsMobileRef = useRef(isMobile);

  // ✅ 添加调试日志，确认状态是否真的变了
  useEffect(() => {
    console.log('[ChatLayout] open:', open, 'isMobile:', isMobile);
  }, [open, isMobile]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      if (prevIsMobileRef.current !== mobile) {
        setOpen(!mobile);
        prevIsMobileRef.current = mobile;
      }
      setIsMobile(mobile);
    };

    const debouncedResize = debounce(handleResize, 200);
    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      debouncedResize.cancel();
    };
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <div
        className={`
          h-screen z-[9999] bg-gray-50 box-border transition-all duration-300 ease-in-out
          ${
            isMobile
              ? `fixed left-0 top-0 w-[240px] ${open ? 'translate-x-0' : '-translate-x-full'}`
              : `relative flex-shrink-0 ${open ? 'w-[240px]' : 'w-0'} overflow-hidden`
          }
        `}
      >
        <div
          className={`w-[240px] h-full ${!open && !isMobile ? 'opacity-0 pointer-events-none' : ''}`}
        >
          <ChatSidebar open={open} setOpen={setOpen} />
        </div>
      </div>

      {/* Mobile backdrop */}
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-black/20 z-[9998] transition-opacity duration-300"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main area */}
      <div className="flex-1 h-screen overflow-y-auto min-w-0 relative">
        {!isMobile && !open && (
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="absolute top-3 left-3 z-50 rounded-md hover:bg-gray-100 bg-white shadow-md cursor-pointer p-1.5"
            title={open ? '收起侧边栏' : '展开侧边栏'}
          >
            <PanelLeft
              className={`w-5 h-5 transition-transform duration-300 ${!open ? 'rotate-180' : ''}`}
            />
          </button>
        )}

        {/* 移动端收起时的按钮 */}
        {isMobile && !open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="fixed top-3 left-3 z-50 rounded-md hover:bg-gray-100 bg-white shadow-md cursor-pointer p-1.5"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        )}

        {children}
      </div>
    </div>
  );
}
