'use client';

import Markdown from '@/components/my/ReactMarkdown';
import { useFileStore, useQuestionStore } from '@/lib/store';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';
import './style.css';

type TextContentItem = { type: 'text'; text: string };
type ImageContentItem = { type: 'image_url'; image_url: { url: string } };
type MessageContent = string | Array<TextContentItem | ImageContentItem>;

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: MessageContent;
  reasoningContent?: string;
};

export default function Chat() {
  const [input, setInput] = useState('');
  const params = useParams();
  const chatId = params.chatId as string;

  const [isFocus, setIsFocus] = useState(false);
  const [thinkingOpen, setThinkingOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    getMessageParams,
    setIsNewChat,
    isNewChat,
    storeMessages,
    setStoreMsgs,
    clearMessages,
    setModel,
  } = useQuestionStore(
    useShallow((state) => ({
      getMessageParams: state.getMessageParams,
      setIsNewChat: state.setIsNewChat,
      isNewChat: state.isNewChat,
      storeMessages: state.messages,
      clearMessages: state.clearMessages,
      setModel: state.setModel,
      setStoreMsgs: state.setMessages,
    }))
  );

  const { clearFiles, concatFiles } = useFileStore(
    useShallow((state) => ({
      clearFiles: state.clear,
      concatFiles: state.concatFiles,
    }))
  );

  const hasConsume = useRef(false);
  console.log('getMessageParams', getMessageParams());
  console.log('storeMessages', storeMessages);
  const messageBodyRef = useRef<ReturnType<typeof getMessageParams>>(getMessageParams());

  const text = messageBodyRef.current?.messages?.[0]?.text || '';
  const reasoningRef = useRef('');
  const contentRef = useRef('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isNewChat && !hasConsume.current && text) {
      setIsNewChat(false);
      setInput(text);
      hasConsume.current = true;
      sendMessage();
    }
  }, []);

  const initMsg = () => {
    const attachments = concatFiles();
    setStoreMsgs([
      {
        role: 'user',
        text: input || text,
        attachments: attachments.length > 0 ? attachments : undefined,
      },
    ]);
    messageBodyRef.current = getMessageParams();
  };

  const clearContent = () => {
    setInput('');
    clearMessages();
    clearFiles();
  };

  async function sendMessage() {
    const prompt = input.trim() || text;
    if (loading || !prompt) return;

    initMsg();
    contentRef.current = '';
    reasoningRef.current = '';
    setThinkingOpen(true);

    const userMsg: ChatMessage = { role: 'user', content: prompt };
    setMessages((prev) => [
      ...prev,
      userMsg,
      { role: 'assistant', content: '', reasoningContent: '' },
    ]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`/api/chat/draft/${chatId}`, {
        method: 'POST',
        body: JSON.stringify(messageBodyRef.current),
        headers: { 'Content-Type': 'application/json' },
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimLine = line.trim();
          if (!trimLine) continue;

          try {
            const chunk = JSON.parse(trimLine);
            if (chunk.type === 'reasoning-delta') reasoningRef.current += chunk.textDelta;
            else if (chunk.type === 'text-delta') contentRef.current += chunk.textDelta;

            requestAnimationFrame(() => {
              setMessages((prev) => {
                const list = [...prev];
                const lastMsg = list[list.length - 1];
                if (lastMsg?.role === 'assistant') {
                  list[list.length - 1] = {
                    ...lastMsg,
                    content: contentRef.current,
                    reasoningContent: reasoningRef.current,
                  };
                }
                return list;
              });
            });
          } catch (e) {
            continue;
          }
        }
      }
      clearContent();
      console.log('输出消息', messages);
    } catch (e) {
      console.error('AI生成失败:', e);
      toast.error('AI生成失败');
    } finally {
      setLoading(false);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col w-full max-w-[var(--chat-layout-width)] mx-auto min-h-screen bg-white">
      {/* ==================== 消息列表区域 ==================== */}
      <div className="flex-1 py-6 pt-20 px-4 pb-40">
        {/* ---------- 空状态 ---------- */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-24 select-none">
            <div
              className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-violet-500 
                            flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20"
            >
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">开始新的对话</h2>
            <p className="text-gray-400 text-sm">输入你的问题，我来为你解答 ✨</p>
          </div>
        )}

        {/* ---------- 消息列表 ---------- */}
        <div className="space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* 头像 */}
              <div className="shrink-0 pt-0.5">
                {msg.role === 'user' ? (
                  <div
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 
                                  flex items-center justify-center shadow-sm"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                ) : (
                  <div
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 
                                  flex items-center justify-center shadow-sm"
                  >
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* 消息主体 */}
              <div
                className={`flex flex-col min-w-0 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* 深度思考区块 */}
                {msg.role === 'assistant' && msg.reasoningContent && (
                  <CollapsibleThinking
                    content={msg.reasoningContent}
                    isOpen={thinkingOpen}
                    onToggle={() => setThinkingOpen((p) => !p)}
                  />
                )}

                {/* 消息气泡 */}
                <div
                  className={`px-4 py-3 leading-relaxed text-[0.95rem] ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-tr-sm shadow-md shadow-blue-500/10'
                      : 'bg-gray-50 text-gray-800 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.content as string}</p>
                  ) : (
                    <Markdown
                      content={
                        (msg.content as string) ||
                        (loading && idx === messages.length - 1 ? '' : '')
                      }
                    />
                  )}
                  {/* 加载动画：仅最后一条 AI 消息、内容为空、正在加载时显示 */}
                  {msg.role === 'assistant' &&
                    loading &&
                    idx === messages.length - 1 &&
                    !(msg.content as string) && <TypingIndicator />}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div ref={bottomRef} />
      </div>

      {/* ==================== 输入区域 ==================== */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          sendMessage();
          setInput('');
        }}
        className="sticky bottom-0 z-50 bg-gradient-to-t from-white via-white/95 to-white/80 
                   backdrop-blur-xl border-t border-gray-100/80 py-4 px-4 flex justify-center"
      >
        <div
          className={`w-full min-w-[300px] rounded-2xl border-2 transition-all duration-300 
                      ${
                        isFocus
                          ? 'border-blue-300/80 bg-white shadow-lg shadow-blue-500/5'
                          : 'border-gray-200 bg-gray-50/80 shadow-sm hover:border-gray-300'
                      }`}
        >
          <textarea
            className="custom-scrollbar w-full border-0 resize-none overflow-y-auto 
                       focus:outline-none px-4 pt-3 pb-1 bg-transparent max-h-[200px] 
                       text-gray-800 placeholder-gray-400 text-[0.95rem] leading-relaxed"
            value={input}
            placeholder="请输入您的问题..."
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          {/* 底部工具栏 */}
          <div className="flex justify-between items-center px-3 pb-2">
            <span className="text-[11px] text-gray-300 select-none">
              Enter 发送 · Shift+Enter 换行
            </span>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
                        ${
                          loading || !input.trim()
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95'
                        }`}
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 12h14M12 5l7 7-7 7"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ==================== 打字加载动画 ====================
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-2 px-1">
      <div className="flex gap-1">
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="text-xs text-gray-400 ml-1">思考中</span>
    </div>
  );
}

// ==================== 可折叠的深度思考区块 ====================
function CollapsibleThinking({
  content,
  isOpen,
  onToggle,
}: {
  content: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mb-2 w-full">
      <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 overflow-hidden shadow-sm">
        {/* 标题栏 - 可点击折叠 */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm 
                     text-amber-800 hover:bg-amber-100/60 transition-colors duration-200"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">💭</span>
            <span className="font-medium">深度思考</span>
          </div>
          <svg
            className={`w-4 h-4 text-amber-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* 内容区 - 折叠动画 */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pb-3 text-sm text-amber-900/80 whitespace-pre-wrap leading-relaxed border-t border-amber-200/50 pt-2">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}
