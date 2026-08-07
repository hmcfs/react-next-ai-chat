'use client';

import ChatInput from '@/app/chat/chat-components/ChatInput';
import ModelCheck from '@/app/chat/chat-components/ModelCheck';
import Markdown from '@/components/my/ReactMarkdown';
import { markdownToText } from '@/lib/markdown';
import { Model, useFileStore, useQuestionStore } from '@/lib/store';
import { Brain } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useShallow } from 'zustand/react/shallow';
import { clientApi } from '@/lib/http/client-api';

type TextContentItem = { type: 'text'; text: string };
type ImageContentItem = { type: 'image_url'; image_url: { url: string } };
type MessageContent = string | Array<TextContentItem | ImageContentItem>;

type ChatMessage = {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: MessageContent;
  reasoningContent?: string;
  createTime?: string;
  modelName?: string;
};

export default function Chat() {
  const [input, setInput] = useState('');
  const params = useParams();
  const chatId = params.chatId as string;

  const [thinkingOpen, setThinkingOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    getMessageParams,
    setIsNewChat,
    isNewChat,
    clearMessages,
    setStoreMsgs,
    model,
    setModel,
  } = useQuestionStore(
    useShallow((state) => ({
      getMessageParams: state.getMessageParams,
      setIsNewChat: state.setIsNewChat,
      isNewChat: state.isNewChat,
      clearMessages: state.clearMessages,
      setStoreMsgs: state.setMessages,
      model: state.model,
      setModel: state.setModel,
    }))
  );
  const changeModel = (model: Model) => {
    setModel(model);
    localStorage.setItem('model', model);
  };
  const { clearFiles, concatFiles } = useFileStore(
    useShallow((state) => ({
      clearFiles: state.clear,
      concatFiles: state.concatFiles,
    }))
  );

  const hasConsume = useRef(false);
  const messageBodyRef = useRef<ReturnType<typeof getMessageParams>>(getMessageParams());

  const text = messageBodyRef.current?.messages?.[0]?.text || '';
  const reasoningRef = useRef('');
  const contentRef = useRef('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isNewChat && !hasConsume.current) {
      hasConsume.current = true;
      // 从 store 读取待发送的首条消息（由落地页 setMessages 写入），交给 sendMessage 处理
      const pending = getMessageParams().messages?.[0]?.text;
      if (pending) {
        sendMessage(pending);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initMsg = (prompt: string) => {
    const attachments = concatFiles();
    setStoreMsgs([
      {
        role: 'user',
        text: prompt,
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

  async function sendMessage(overridePrompt?: string) {
    const prompt = (overridePrompt ?? input).trim() || text;
    if (loading || !prompt) return;

    setInput(prompt); // 让输入框显示待发送内容（contentEditable 同步）
    setIsNewChat(false); // 消费「新会话」标记
    initMsg(prompt);
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
      const res = await fetch(`/api/bff/chat/stream/${chatId}`, {
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
          } catch {
            continue;
          }
        }
      }
      clearContent();
    } catch (e) {
      console.error('AI生成失败:', e);
      toast.error('AI生成失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const getHistoryMsg = async () => {
      try {
        const res = await clientApi.get<{ messages: any[] }>(`/api/bff/chat/history/${chatId}`, {
          page: 1,
          pageSize: 6,
        });
        if (res.code && res.data?.messages) {
          const historyMessages: ChatMessage[] = res.data.messages
            .map((msg: any) => ({
              id: msg.msgId,
              role: msg.role as 'user' | 'assistant' | 'system',
              content: msg.content,
              reasoningContent: msg.reasoningContent || undefined,
              createTime: msg.createTime,
              modelName: msg.modelName?.trim(),
            }))
            .reverse();
          setMessages(historyMessages);
        } else {
          toast.error(res.msg || '获取历史消息失败');
        }
      } catch (error) {
        console.error('加载历史消息异常:', error);
        toast.error('加载历史消息异常');
      }
    };
    if (chatId && chatId.length === 32 && !isNewChat) {
      getHistoryMsg();
    } else if (chatId && chatId.length !== 32) {
      router.replace('/chat');
    }
    // isNewChat 为 true：新会话，跳过历史加载，避免覆盖自动发送的首条消息
    // 注意：isNewChat 不能加入依赖，否则消费标记后会导致历史被重复加载
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 格式化时间显示
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex relative flex-col w-full max-w-[var(--chat-layout-width)] mx-auto min-h-screen bg-background">
      {/* 顶部模型选择栏 */}
      <div className="sticky top-0 left-0 z-30 flex items-center bg-background/90 px-4 pt-3 pb-2 backdrop-blur-sm">
        <ModelCheck parentModel={model} changeModel={changeModel} />
      </div>

      {/* ==================== 消息列表区域 ==================== */}
      <div className="flex-1 py-6 px-4 pb-40">
        {/* ---------- 空状态 ---------- */}
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center mt-24 select-none">
            <div className="w-20 h-20 rounded-3xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10"
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
            <h2 className="text-2xl font-semibold text-foreground mb-2">开始新的对话</h2>
            <p className="text-muted-foreground text-sm">输入你的问题，我来为你解答</p>
          </div>
        )}

        {/* ---------- 加载状态 ---------- */}
        {messages.length === 0 && loading && (
          <div className="flex items-center justify-center mt-24">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0ms]" />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:150ms]" />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:300ms]" />
              <span className="ml-2">加载历史消息...</span>
            </div>
          </div>
        )}

        {/* ---------- 消息列表 ---------- */}
        <div className="space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* 头像 */}
              <div className="shrink-0 pt-0.5">
                {msg.role === 'user' ? (
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                    <svg
                      className="w-4 h-4"
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
                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                    <svg
                      className="w-4 h-4"
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
                      ? 'bg-blue-500 text-white rounded-2xl rounded-tr-sm shadow-sm'
                      : 'bg-muted text-foreground rounded-2xl rounded-tl-sm border border-border/60 shadow-sm'
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

                {/* 消息时间和模型信息 */}
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground px-1">
                  {msg.createTime && <span>{formatTime(msg.createTime)}</span>}
                  {msg.modelName && msg.role === 'assistant' && (
                    <span className="bg-muted px-2 py-0.5 rounded text-muted-foreground">
                      {msg.modelName}
                    </span>
                  )}
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
          sendMessage();
        }}
        className="sticky bottom-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/60 py-4 px-4 flex justify-center"
      >
        <ChatInput value={input} onChange={setInput} onSend={sendMessage} />
      </form>
    </div>
  );
}

// ==================== 打字加载动画 ====================
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-2 px-1">
      <div className="flex gap-1">
        <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
      </div>
      <span className="text-xs text-muted-foreground ml-1">思考中</span>
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
      <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 dark:border-amber-500/20 dark:bg-amber-500/10 overflow-hidden shadow-sm">
        {/* 标题栏 - 可点击折叠 */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 transition-colors duration-200"
        >
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-amber-500" />
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
            isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pb-3 text-sm text-amber-800/90 dark:text-amber-200/80 whitespace-pre-wrap leading-relaxed border-t border-amber-500/20 pt-2">
            <span>{markdownToText(content)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
