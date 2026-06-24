'use client';
import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { clientApi } from '../../lib/client-request';
export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat();
  const [isFocus, setIsFocus] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      if (!input.trim()) return;
      const res = await clientApi.post<{ id: string; title: string }>('/api/chat/session', {
        content: input,
      });
      const { id, title } = res;

      sendMessage({ text: input });
      setInput('');
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <div className="w-full h-screen min-h-[250px] flex flex-col justify-between items-center">
      <div></div>
      <div className="w-4/5 flex flex-col justify-around items-center">
        <span className="text-center text-gray-400 mb-10 text-3xl font-bold">
          <span className=" bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            开始新的对话吧
          </span>
          ✨
        </span>
        <form
          onSubmit={handleSubmit}
          className="  z-50 w-4/5  backdrop-blur-sm  border-gray-100 py-3 px-4 flex justify-center"
        >
          <div
            className={`w-full  min-w-[300px] shadow-xl rounded-2xl border-2  bg-white transition-colors duration-200 ${
              isFocus ? 'border-blue-200 ' : 'border-gray-100  '
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
              rows={2}
            />
            <div className="flex justify-between px-3 pb-2 items-center text-xs text-gray-400">
              <div>1</div>
              <div>2</div>
              <div>3</div>
            </div>
          </div>
        </form>
      </div>
      <div className="h-1/10"></div>
    </div>
  );
}
