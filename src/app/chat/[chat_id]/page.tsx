'use client';
import './style.css';
import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import MessageContent from '@/app/components/MessageContent';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat();
  const [isFocus, setIsFocus] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  //   新消息到达时自动滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col w-full max-w-[var(--chat-layout-width)] mx-auto min-h-screen">
      <div className="flex-1 py-6 pt-24 px-4 pb-32">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">开始新的对话吧 ✨</div>
        )}
        {messages.map((message) => (
          <div key={message.id} className="whitespace-pre-wrap mb-4">
            {message.role === 'user' ? 'User: ' : 'AI: '}
            {message.parts.map((part, i) => {
              if (part.type !== 'text') return null;
              return message.role === 'user' ? (
                <div key={`${message.id}-${i}`}>{part.text}</div>
              ) : (
                <div
                  key={`${message.id}-${i}`}
                  className="prose prose-slate max-w-none dark:prose-invert"
                >
                  <MessageContent content={part.text} />
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ✅ 输入框：不再依赖 CSS 变量做 fixed 偏移 */}
      {/* 改为由 Layout 的 flex 布局自然撑开，此处只做 sticky 吸底 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          sendMessage({ text: input });
          setInput('');
        }}
        className="sticky bottom-0 z-50   backdrop-blur-sm border-t border-gray-100 py-3 px-4 flex justify-center"
      >
        <div
          className={`w-full  min-w-[300px] shadow-xl rounded-2xl border-2 transition-colors duration-200 ${
            isFocus ? 'border-blue-200 bg-white' : 'border-gray-100 bg-gray-50'
          }`}
        >
          <textarea
            className="custom-scrollbar w-full border-0 resize-none overflow-y-auto focus:outline-none p-3 bg-transparent max-h-[200px]"
            value={input}
            placeholder="请输入您的问题..."
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.currentTarget.form?.requestSubmit();
              }
            }}
            rows={1}
          />
          <div className="flex justify-between px-3 pb-2 items-center text-xs text-gray-400">
            <div>1</div>
            <div>2</div>
            <div>3</div>
          </div>
        </div>
      </form>
    </div>
  );
}
