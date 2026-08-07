'use client';

import { useEffect, useRef, useState } from 'react';
import PreviewFiles from './PreviewFiles';
import Tool from './Tool';
import { useFilePaste } from './useFilePaste';
import { handlePlainTextPaste } from '@/lib/handlePlainTextPaste';

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  placeholder?: string;
}

/** 共享输入框：预览 + 多行文本域（Enter 发送 / Shift+Enter 换行 / 粘贴上传）+ 工具栏 */
export default function ChatInput({ value, onChange, onSend, placeholder }: ChatInputProps) {
  const [isFocus, setIsFocus] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const handlePaste = useFilePaste();
  const isComposingRef = useRef(false);

  // contentEditable 不受控：外部 value 变化（发送后清空 / 自动发送预填）时同步到 DOM
  useEffect(() => {
    const el = contentRef.current;
    if (!el || isComposingRef.current) return;
    if (el.innerText !== value) {
      el.innerText = value;
    }
  }, [value]);

  const handleInput = () => {
    const el = contentRef.current;
    if (el && !isComposingRef.current) {
      onChange(el.innerText);
    }
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = () => {
    isComposingRef.current = false;
    // 输入法确认后更新值
    const el = contentRef.current;
    if (el) onChange(el.innerText);
  };

  const handleBlur = () => {
    setIsFocus(false);
    // 用 &nbsp; 替换末尾空格，防止被浏览器修剪
    const el = contentRef.current;
    if (el) {
      const text = el.innerText;
      if (text && text.endsWith(' ')) {
        el.innerText = text.replace(/ +$/, (m) => '\u00A0'.repeat(m.length));
        onChange(el.innerText);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const el = contentRef.current;
    if (!el) return;
    const isAtTop = el.scrollTop === 0 && e.deltaY < 0;
    const isAtBottom = el.scrollTop + el.clientHeight >= el.scrollHeight && e.deltaY > 0;
    if (!isAtTop && !isAtBottom) {
      e.stopPropagation();
    }
  };

  const handlePasteEvent = (e: React.ClipboardEvent<HTMLDivElement>) => {
    handlePlainTextPaste(e.nativeEvent, () => handlePaste(e as any));
  };

  return (
    <div
      className={`w-full min-w-[300px] rounded-2xl border bg-card transition-all duration-300 ${
        isFocus
          ? 'border-blue-400/70 ring-2 ring-blue-400/10 shadow-md'
          : 'border-border shadow-sm'
      }`}
    >
      <PreviewFiles />
      <div className="relative min-h-[60px] mt-4">
        {/* 占位符：用普通 span 代替 :empty 伪元素，避免 SSR/客户端 className 不一致 */}
        {!value && (
          <span className="pointer-events-none absolute left-4 top-3 text-[0.95rem] text-muted-foreground">
            {placeholder || '请输入您的问题...'}
          </span>
        )}
        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          className="custom-scrollbar w-full border-0 resize-none overflow-y-auto focus:outline-none px-4 pt-3 pb-2 bg-transparent max-h-[300px] min-h-[44px] text-foreground text-[0.95rem] leading-relaxed"
          onInput={handleInput}
          onFocus={() => setIsFocus(true)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onPaste={handlePasteEvent}
          onWheel={handleWheel}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
        />
      </div>
      <div className="flex justify-between px-4 pb-2 items-center text-xs text-muted-foreground">
        <Tool />
      </div>
    </div>
  );
}