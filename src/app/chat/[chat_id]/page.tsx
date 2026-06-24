'use client';
import './style.css';
import { useChat } from '@ai-sdk/react';

import { useState } from 'react';
import MessageContent from '@/app/components/MessageContent';
export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat();
  const [isFocus, setIsFocus] = useState(false);
  return (
    <div className=" flex flex-col w-full max-w-[var(--chat-layout-width)] py-24 pt-24 mx-auto stretch focus:outline-none">
      {messages.map((message) => (
        <div key={message.id} className="whitespace-pre-wrap">
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part, i) => {
            switch (part.type) {
              case 'text':
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
            }
          })}
        </div>
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({ text: input });
          setInput('');
        }}
        className="fixed bottom-0 left-[var(--sidebar-offset,var(--chat-layout-side))] right-0 pb-4 bg-white flex justify-center items-center z-999"
      >
        <div
          // className={`dim-content ${isFocus ? 'dim-content' : ''} chat-content   w-[var(--chat-layout-width)] shadow-2xl rounded-[20px] border-gray-100 focus-within:border-blue-100    border-2  `}
          className="w-[var(--chat-layout-width)] shadow-2xl rounded-[20px] border-gray-100 focus-within:border-blue-100    border-2    "
        >
          <div className="w-full   max-w-[var(--chat-layout-width)] min-w-[300px]  ">
            <textarea
              className="custom-scrollbar w-full border-0 resize-none overflow-y-auto focus:outline-none  p-1   "
              value={input}
              placeholder="请输入您的问题..."
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsFocus(true)}
              onBlur={() => setIsFocus(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit(); // 触发表单 onSubmit
                }
              }}
            />
          </div>
          <div className="flex justify-between px-2 pb-1 items-center">
            <div>1</div>
            <div>2</div>
            <div>3</div>
          </div>
        </div>
      </form>
      {/*    <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage({ text: input });
          setInput('');
        }}
      ></form> */}
    </div>
  );
}
