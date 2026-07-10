'use client';

import ModelCheck from '@/app/chat/components/ModelCheck';
import { MODEL_LIST } from '@/constants/index';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

import Tool from '@/app/chat/components/Tool';
import { toast } from 'sonner';
import { clientApi } from '../../lib/client-request';
import { useChatStore } from '../../lib/store/useChatStore';
export default function Chat() {
  const { title, setTitle, setIsNewChat, setContent } = useChatStore((state) => state);
  const [input, setInput] = useState('');

  const [isFocus, setIsFocus] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [showTip, setShowTip] = useState(false);
  const [model, setModel] = useState(() => {
    if (typeof window === 'undefined') return MODEL_LIST[0].label;
    const localModel = localStorage.getItem('model');
    if (localModel) return localModel;
    localStorage.setItem('model', MODEL_LIST[0].label);
    return MODEL_LIST[0].label;
  });
  const changeModel = (model: string) => {
    localStorage.setItem('model', model);
    setModel(model);
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      if (!input.trim()) return;
      const res = await clientApi.post<{ chatId: string; title: string }>('/api/chat/session', {
        content: input,
      });
      const { chatId, title } = res.data || {};

      if (!res.code) {
        toast.error(res.msg || '创建对话失败');
        setInput('');
        return;
      }
      setTitle(title || '');
      setContent(input || '');
      setIsNewChat(true);
      router.push(`/chat/${chatId}`);

      setInput('');
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="w-full relative h-screen min-h-[250px] flex flex-col justify-between items-center">
      <ModelCheck parentModel={model} changeModel={changeModel} className="absolute top-4 left-4" />
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
              <Tool />
            </div>
          </div>
        </form>
      </div>
      <div className="h-1/10"></div>
    </div>
  );
}
