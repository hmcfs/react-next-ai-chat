'use client';

import ChatInput from '@/app/chat/chat-components/ChatInput';
import ModelCheck from '@/app/chat/chat-components/ModelCheck';
import { MODEL_LIST } from '@/constants/index';
import { clientApi } from '@/lib/http/client-api';
import { Model, useFileStore, useQuestionStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';

export default function Chat() {
  const { setTitle, setIsNewChat, setMessages, setModel: setQuestionModel } = useQuestionStore(
    useShallow((state) => ({
      setTitle: state.setTitle,
      setIsNewChat: state.setIsNewChat,
      setMessages: state.setMessages,
      setModel: state.setModel,
    }))
  );
  const { concatFiles } = useFileStore(
    useShallow((state) => ({
      concatFiles: state.concatFiles,
    }))
  );
  const [input, setInput] = useState('');

  const router = useRouter();
  const [model, setModel] = useState(() => {
    if (typeof window === 'undefined') return MODEL_LIST[0].label;
    const localModel = localStorage.getItem('model');
    if (localModel) return localModel;
    localStorage.setItem('model', MODEL_LIST[0].value);
    return MODEL_LIST[0].value;
  });
  const changeModel = (model: Model) => {
    localStorage.setItem('model', model);
    setModel(model);
  };
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
      setQuestionModel(model as Model);
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
      <ModelCheck
        parentModel={model as Model}
        changeModel={changeModel}
        className="absolute top-4 left-4"
      />
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
          className="z-50 w-4/5 py-3 px-4 flex justify-center"
        >
          <ChatInput value={input} onChange={setInput} onSend={submit} />
        </form>
      </div>
      <div className="h-1/10"></div>
    </div>
  );
}
