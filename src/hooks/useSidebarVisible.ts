import { useState } from 'react';
import { useRef, useEffect } from 'react';
export function useSidebarVisible(threshold: number = 150) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const e = ref.current;
    if (!e) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setIsCollapsed(width < threshold);
      }
    });
    observer.observe(e);
    setIsCollapsed(e.clientWidth < threshold);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, isCollapsed };
}
