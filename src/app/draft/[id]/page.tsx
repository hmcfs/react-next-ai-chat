'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MODEL_LIST } from '@/constants/index';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
type Messages = {
  model: string;
  enableDeepThink: boolean;
  messages: {
    role: string;
    text: string;
    attachments?: {
      url: string;
      minType?: string;
    }[];
  }[];
};
type TextContentItem = { type: 'text'; text: string };
type ImageContentItem = { type: 'image_url'; image_url: { url: string } };
type MessageContent = string | Array<TextContentItem | ImageContentItem>;

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: MessageContent;
  reasoningContent?: string; // 深度思考内容，仅assistant存在
};

export default function Draft() {
  // 文件上传
  const [file, setFile] = useState<File | null>(null);

  // AI对话状态
  const [id] = useState('123'); // 临时会话ID，实际可从路由/db获取
  const [selectedModel, setSelectedModel] = useState('qwen3.6-flash');
  const [enableDeepThink, setEnableDeepThink] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<{ url: string; minType?: string }[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const streamingContentRef = useRef('');
  const streamingReasoningRef = useRef('');

  // 文件上传逻辑（原样保留）
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetFile = e.target.files?.[0];
    if (!targetFile) return;
    const MAX_SIZE = 1024 * 1024 * 8;
    if (targetFile.size > MAX_SIZE) {
      toast.error('文件过大，请上传小于8MB的文件');
      return;
    }
    setFile(targetFile);
    const formData = new FormData();
    formData.append('file', targetFile);
    try {
      const res = await fetch('/api/common/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      console.log('data:', data.data.url);
      setFileList((prev) => [...prev, { url: data.data.url, minType: targetFile?.type }]);
      console.log('上传结果:', data);
      toast.success('文件上传成功');
    } catch (err) {
      toast.error('文件上传失败');
    }
  };

  const sendAiMessage = async () => {
    const prompt = inputText.trim();
    if (!prompt || loading) return;

    // 重置 ref
    streamingContentRef.current = '';
    streamingReasoningRef.current = '';

    const userMsg: ChatMessage = { role: 'user', content: prompt };
    setMessages((prev) => [
      ...prev,
      userMsg,
      { role: 'assistant', content: '', reasoningContent: '' },
    ]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch(`/api/chat/draft/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,

          messages: {
            model: selectedModel,
            enableDeepThink,
            messages: [{ role: 'user', text: prompt, attachments: fileList }],
          },
          enableDeepThink,
        }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimLine = line.trim();
          if (!trimLine) continue;
          try {
            const chunk = JSON.parse(trimLine);

            // ✅ 2. 只更新 ref，不触发 setState
            if (chunk.type === 'reasoning-delta') {
              streamingReasoningRef.current += chunk.textDelta;
            } else if (chunk.type === 'text-delta') {
              streamingContentRef.current += chunk.textDelta;
            }

            // ✅ 3. 用 requestAnimationFrame 节流渲染（每帧最多更新一次）
            requestAnimationFrame(() => {
              setMessages((prev) => {
                const list = [...prev];
                const lastMsg = list[list.length - 1];
                if (lastMsg?.role === 'assistant') {
                  // 创建新对象，避免引用污染
                  list[list.length - 1] = {
                    ...lastMsg,
                    content: streamingContentRef.current,
                    reasoningContent: streamingReasoningRef.current,
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
    } catch (err) {
      console.error('AI生成失败:', err);
      toast.error('AI生成失败');
    } finally {
      setLoading(false);
    }
  };

  // 回车发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendAiMessage();
    }
  };

  // 自动滚动到底部
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <h1>草稿箱 + AI多模型流式对话</h1>

      {/* 文件上传区域 */}
      <div className="flex items-center gap-4 flex-wrap">
        <Button size="sm" variant="outline" className="relative overflow-hidden">
          上传附件
          {/*             accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.7z" */}
          <Input
            accept="image/*,.doc,.docx,.pdf"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleFileChange}
            type="file"
          />
        </Button>
        {file && <p className="text-sm text-gray-500">已选择：{file.name}</p>}
      </div>

      {/* 模型配置栏 */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Label>模型</Label>
          <Select value={selectedModel} onValueChange={setSelectedModel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择模型" />
            </SelectTrigger>
            <SelectContent>
              {MODEL_LIST.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={enableDeepThink}
            onCheckedChange={(v) => setEnableDeepThink(!!v)}
            id="deep-think"
          />
          <Label htmlFor="deep-think">开启深度思考(R1专用)</Label>
        </div>
      </div>

      {/* 聊天窗口 */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div
            ref={chatContainerRef}
            className="h-[450px] overflow-y-auto space-y-4 border rounded p-3"
          >
            {messages.length === 0 && (
              <p className="text-gray-400 text-center py-20">输入内容开始对话</p>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* 深度思考区块（仅AI且有思考内容才显示） */}
                {msg.role === 'assistant' && msg.reasoningContent && (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded mb-1 max-w-[85%] text-sm text-amber-800 whitespace-pre-wrap">
                    <div className="font-bold mb-1">🤔 深度思考</div>
                    {msg.reasoningContent}
                  </div>
                )}
                {/* 主回答/用户消息 */}
                <div
                  className={`p-3 rounded max-w-[85%] whitespace-pre-wrap ${
                    msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {msg.content || (loading && idx === messages.length - 1 ? '思考中...' : '')}
                </div>
              </div>
            ))}
          </div>

          {/* 输入框 */}
          <div className="flex gap-2">
            <Input
              placeholder="输入问题，回车发送（Shift+Enter换行）"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <Button onClick={sendAiMessage} disabled={loading || !inputText.trim()}>
              {loading ? '生成中...' : '发送'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
