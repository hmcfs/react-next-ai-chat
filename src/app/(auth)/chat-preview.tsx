export interface ChatPreviewItem {
  role: 'user' | 'assistant';
  text: string;
}

interface ChatPreviewProps {
  chats: ChatPreviewItem[];
}

/**
 * 循环播放的对话预览：每组气泡按周期依次淡入淡出，
 * 配打字光标与「正在输入」提示，模拟真实对话节奏。
 * 遵循 prefers-reduced-motion，关闭后静态展示全部气泡。
 */
export function ChatPreview({ chats }: ChatPreviewProps) {
  const total = chats.length;

  return (
    <>
      <style>{`
        @keyframes cp-bubble {
          0% { opacity: 0; transform: translateY(10px) scale(0.98); }
          7% { opacity: 1; transform: translateY(0) scale(1); }
          ${100 / total - 4}% { opacity: 1; transform: translateY(0) scale(1); }
          ${100 / total}% { opacity: 0; transform: translateY(-6px) scale(0.98); }
          100% { opacity: 0; transform: translateY(-6px) scale(0.98); }
        }
        @keyframes cp-caret {
          0%, 45% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes cp-dots {
          0%, 60%, 100% { opacity: 0.25; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-2px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cp-bubble { animation: none !important; opacity: 1 !important; }
          .cp-caret, .cp-dots span { animation: none !important; opacity: 1 !important; }
        }
      `}</style>

      <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
        <div className="flex flex-col gap-4">
          {chats.map((chat, i) => (
            <div
              key={i}
              className="cp-bubble flex"
              style={{
                animation: `cp-bubble ${total * 3.2}s ease-in-out infinite`,
                animationDelay: `${i * 3.2}s`,
              }}
            >
              {chat.role === 'user' ? (
                <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-white px-4 py-2.5 text-sm leading-relaxed text-zinc-900 shadow-lg shadow-black/20">
                  {chat.text}
                </div>
              ) : (
                <div className="max-w-[85%]">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <div className="flex h-4 w-4 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-violet-600">
                      <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-zinc-400">Clair</span>
                  </div>
                  <div className="rounded-2xl rounded-tl-md border border-white/10 bg-zinc-900 px-4 py-2.5 text-sm leading-relaxed text-zinc-200">
                    {chat.text}
                    <span className="cp-caret ml-0.5 inline-block h-3.5 w-[2px] translate-y-[2px] bg-indigo-400" style={{ animation: 'cp-caret 1s step-end infinite' }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 底部「正在输入」提示 */}
        <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
          <span className="cp-dots flex items-center gap-1">
            {[0, 1, 2].map((n) => (
              <span
                key={n}
                className="h-1 w-1 rounded-full bg-zinc-400"
                style={{ animation: 'cp-dots 1.2s ease-in-out infinite', animationDelay: `${n * 0.18}s` }}
              />
            ))}
          </span>
          正在思考…
        </div>
      </div>
    </>
  );
}
