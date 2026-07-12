'use client';

import 'katex/dist/katex.min.css';
import { useDeferredValue, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

// 从 children 中递归提取代码语言
function extractLang(className?: string): string {
  if (!className) return 'text';
  const match = className.match(/language-(\w+)/);
  return match ? match[1] : 'text';
}

// 从 children 中递归提取纯文本
function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return extractText((node as React.ReactElement).props.children);
  }
  return '';
}

export default function Markdown({ content }: { content: string }) {
  const deferredContent = useDeferredValue(content);

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeSanitize, rehypeKatex]}
      components={{
        // ============ 链接 ============
        a: ({ href, children, ...props }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 underline decoration-blue-300 
                       underline-offset-2 transition-colors duration-150"
            {...props}
          >
            {children}
          </a>
        ),

        // ============ 代码块容器 ============
        pre: ({ children, ...props }) => {
          return (
            <div className="my-4 rounded-xl overflow-hidden shadow-lg border border-gray-700/50">
              {children}
            </div>
          );
        },

        // ============ 代码块内容 ============
        code: ({ className, children, ...props }) => {
          // 判断是否为代码块（有 className 说明是 ```lang 语法）
          const isInline = !className;

          // ---- 行内代码 ----
          if (isInline) {
            return (
              <code
                className="px-1.5 py-0.5 rounded-md bg-gray-100  text-blue-500 
                           text-[0.875em] font-mono border border-gray-200/60"
                {...props}
              >
                {children}
              </code>
            );
          }

          // ---- 块级代码 ----
          const lang = extractLang(className);
          const codeText = extractText(children);

          return (
            <CodeBlock lang={lang} codeText={codeText} className={className} {...props}>
              {children}
            </CodeBlock>
          );
        },

        // ============ 引用块 ============
        blockquote: ({ children, ...props }) => (
          <blockquote
            className="my-4 pl-4 border-l-4 border-blue-400 bg-blue-50/60 
                       py-3 pr-4 rounded-r-lg text-gray-700 italic"
            {...props}
          >
            {children}
          </blockquote>
        ),

        // ============ 表格 ============
        table: ({ children, ...props }) => (
          <div className="my-4 overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200" {...props}>
              {children}
            </table>
          </div>
        ),
        thead: ({ children, ...props }) => (
          <thead className="bg-gray-50" {...props}>
            {children}
          </thead>
        ),
        th: ({ children, ...props }) => (
          <th
            className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
            {...props}
          >
            {children}
          </th>
        ),
        td: ({ children, ...props }) => (
          <td className="px-4 py-3 text-sm text-gray-700 border-t border-gray-100" {...props}>
            {children}
          </td>
        ),

        // ============ 分割线 ============
        hr: (props) => (
          <hr
            className="my-6 border-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"
            {...props}
          />
        ),
      }}
    >
      {deferredContent}
    </ReactMarkdown>
  );
}

// ==================== 代码块子组件（含复制按钮） ====================
function CodeBlock({
  lang,
  codeText,
  className,
  children,
  ...props
}: {
  lang: string;
  codeText: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = codeText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* 头部：语言标签 + 复制按钮 */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700/50">
        <span className="text-xs font-mono text-gray-400 uppercase tracking-wide">{lang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white 
                     transition-colors duration-200 px-2 py-1 rounded-md hover:bg-gray-700/50"
        >
          {copied ? (
            <>
              <svg
                className="w-3.5 h-3.5 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-green-400">已复制</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              复制
            </>
          )}
        </button>
      </div>
      {/* 代码内容 */}
      <pre
        className="overflow-x-auto bg-gray-900 p-4 text-sm text-gray-100 leading-relaxed"
        {...props}
      >
        <code className={className}>{children}</code>
      </pre>
    </>
  );
}
