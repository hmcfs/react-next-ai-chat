'use client';

import ChatInput from '@/app/chat/chat-components/ChatInput';
import { clientApi } from '@/lib/http/client-api';
import { useFileStore, useQuestionStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';

export default function Chat() {
  const { setTitle, setIsNewChat, setMessages } = useQuestionStore(
    useShallow((state) => ({
      setTitle: state.setTitle,
      setIsNewChat: state.setIsNewChat,
      setMessages: state.setMessages,
    }))
  );
  const { concatFiles } = useFileStore(
    useShallow((state) => ({
      concatFiles: state.concatFiles,
    }))
  );
  const [input, setInput] = useState('');

  const router = useRouter();
  const submit = async () => {
    try {
      if (!input.trim()) return;
      const res = await clientApi.post<{ chatId: string; title: string }>('/api/bff/chat/session', {
        content: input,
      });
      const { chatId, title } = res.data || {};

      if (!res.code) {
        toast.error(res.msg || '创建对话失败');
        setInput('');
        return;
      }
      setTitle(title || '');
      setIsNewChat(true);
      const fs = concatFiles();
      setMessages([
        {
          role: 'user',
          text: input,
          attachments: fs.length > 0 ? fs : undefined,
        },
      ]);

      router.push(`/chat/${chatId}`);

      setInput('');
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="w-full relative h-screen min-h-[250px] flex flex-col justify-between items-center">
      <div></div>
      <div className="w-4/5 flex flex-col justify-around items-center">
            <span className="text-center text-gray-400 mb-10 text-3xl font-bold">
          <span className=" bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
      开始新的对话吧 
        </span>✨
               </span>  
         

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="z-50 w-full py-3 px-4 flex justify-center"
        >
          <ChatInput value={input} onChange={setInput} onSend={submit} />
        </form>
      </div>
      <div className="h-1/10"></div>
    </div>
  );
}
