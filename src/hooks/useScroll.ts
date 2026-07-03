import { useEffect, useRef } from 'react';

export function useScroll({
  loading,
  hasMore,
  onLoadMore,
  threshold = 80,
}: {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => Promise<void>;
  threshold?: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // ✅ 仅声明 ref，不在渲染阶段赋值
  const onLoadMoreRef = useRef(onLoadMore);
  const stateRef = useRef({ loading, hasMore });

  // ✅ 在 effect 中同步最新值到 ref（合规且安全）
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
    stateRef.current = { loading, hasMore };
  }); // ⚠️ 注意：这里故意省略依赖数组，确保每次渲染后都同步最新值

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        ticking = false;
        // ✅ 从 ref 读取最新状态，完全脱离闭包
        const { loading, hasMore } = stateRef.current;
        if (loading || !hasMore) return;

        const { scrollTop, clientHeight, scrollHeight } = el;
        if (Math.ceil(scrollTop + clientHeight) >= scrollHeight - threshold) {
          onLoadMoreRef.current();
        }
      });
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [threshold]); // ✅ 事件监听器只在 threshold 变化时重绑

  return scrollRef;
}
