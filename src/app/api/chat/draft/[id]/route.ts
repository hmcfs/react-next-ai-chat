import { NextRequest, NextResponse } from 'next/server';

// ===================== 1. 多模型服务商配置表（可自由扩展） =====================
type ProviderConfig = {
  baseURL: string;
  apiKey: string;
};
// 环境变量统一管理，新增模型只需要在这里加一行
const MODEL_PROVIDER_MAP: Record<string, ProviderConfig> = {
  // 阿里云百炼系列
  'qwen3.6-flash': {
    baseURL: process.env.BAILIAN_BASE_URL!,
    apiKey: process.env.BAILIAN_API_KEY!,
  },
  'qwen3-vl-flash': {
    baseURL: process.env.BAILIAN_BASE_URL!,
    apiKey: process.env.BAILIAN_API_KEY!,
  },
  // DeepSeek
  'deepseek-v3': {
    baseURL: process.env.DEEPSEEK_BASE_URL!,
    apiKey: process.env.DEEPSEEK_API_KEY!,
  },
  'deepseek-r1': {
    baseURL: process.env.DEEPSEEK_BASE_URL!,
    apiKey: process.env.DEEPSEEK_API_KEY!,
  },
  // 字节豆包
  'doubao-pro': {
    baseURL: process.env.DOUBAO_BASE_URL!,
    apiKey: process.env.DOUBAO_API_KEY!,
  },
  'doubao-vision': {
    baseURL: process.env.DOUBAO_BASE_URL!,
    apiKey: process.env.DOUBAO_API_KEY!,
  },
};
const MODEL_CAPABILITIES = {
  'o3-mini': { reasoningEffort: true },
  'deepseek-r1': { reasoningEffort: false, defaultThinking: true },
  'qwq-plus': { reasoningEffort: false, enableThinking: true },
  'gpt-4o': { reasoningEffort: false },
  'qwen-max': { reasoningEffort: false },
  'deepseek-chat': { reasoningEffort: false },
} as const;
// 消息类型定义（前端统一传入结构）
type TextContentItem = { type: 'text'; text: string };
type ImageContentItem = { type: 'image_url'; image_url: { url: string } };
type MessageContent = string | Array<TextContentItem | ImageContentItem>;
type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: MessageContent;
};
type MessageBody = {
  model: string;
  enableDeepThink: boolean;
  messages: Messages[];
};
type Messages = {
  role: string;
  text: string;
  attachments?: Attachment[];
};
type Attachment = {
  url: string;
  minType?: string;
};
// 接口入参
type RequestBody = {
  model: string;
  messages: ChatMessage[];
  enableDeepThink?: boolean;
};
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ success: true });
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // 1. 读取会话ID与请求体

  const { id } = await params;
  const body = (await req.json()) as RequestBody;
  const { model, messages, enableDeepThink = false, messages2 } = body;
  function pickMessages(messages: Messages[]) {
    return messages.map((i) => {
      const contentItems: Array<
        { type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }
      > = [{ type: 'text', text: i.text }];

      if (i.attachments && i.attachments.length > 0) {
        for (const item of i.attachments) {
          if (item.minType?.startsWith('image')) {
            contentItems.push({
              type: 'image_url',
              image_url: { url: item.url },
            });
          } else if (item.minType?.startsWith('pdf')) {
            contentItems.push({
              type: 'text',
              text: `[系统提示: 用户上传了PDF文件 ${item.url}，请使用RAG工具提取内容]`,
            });
          }
        }
      }

      return {
        role: i.role,
        content: contentItems,
      };
    });
  }

  // 校验模型是否存在配置
  const providerConfig = MODEL_PROVIDER_MAP[model];
  if (!providerConfig) {
    return Response.json({ error: '不支持的模型' }, { status: 400 });
  }
  const { baseURL, apiKey } = providerConfig;
  const msg = pickMessages(messages2.messages);
  // 2. 组装大模型请求体（自动兼容纯文本/多模态图片）
  const requestBody = {
    model,
    messages: msg || [],
    stream: true,
    enable_thinking: enableDeepThink || false, // DeepSeek-R1、通义深度思考等模型专属字段
    // reasoning_effort: 'medium',
  };
  console.log('api:');
  console.log('messages', messages2);
  console.log('messages2:', msg[0].content);
  // 3. 请求对应厂商流式接口
  const modelResp = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!modelResp.ok || !modelResp.body) {
    const errText = await modelResp.text();
    return Response.json({ error: `模型调用失败: ${errText}` }, { status: modelResp.status });
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  // 缓存完整回答与深度思考内容
  let fullAnswer = '';
  let fullReasoning = '';

  // 4. 流转换：统一输出 ai-sdk useChat 识别的 text-delta 流
  const streamTransformer = new TransformStream({
    transform(chunk, controller) {
      const rawChunk = decoder.decode(chunk, { stream: true });
      const lines = rawChunk.split('\n').filter((line) => line.trim());

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const dataStr = line.slice(6);
        if (dataStr === '[DONE]') continue;

        try {
          const payload = JSON.parse(dataStr);
          const choice = payload.choices?.[0];
          if (!choice?.delta) continue;

          const delta = choice.delta;
          // 深度思考内容（DeepSeek-R1、通义深度思考等模型专属字段）
          if (delta.reasoning_content) {
            fullReasoning += delta.reasoning_content;
            // 前端区分思考流，自定义type
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  type: 'reasoning-delta',
                  textDelta: delta.reasoning_content,
                }) + '\n'
              )
            );
          }
          // 正式回答文本
          if (delta.content) {
            fullAnswer += delta.content;
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  type: 'text-delta',
                  textDelta: delta.content,
                }) + '\n'
              )
            );
          }
        } catch (parseErr) {
          continue;
        }
      }
    },
    // 流结束：入库保存消息（区分思考内容与回答）
    async flush() {
      if (!id || !fullAnswer) return;
      try {
        /*   await prisma.chatMessage.create({
          data: {
            chatId:id,
            role: "assistant",
            content: fullAnswer,
            reasoningContent: fullReasoning || null, // 深度思考内容单独字段
            modelName: model, // 记录当前使用的模型
            enableDeepThink,
          },
        }); */
        console.log('[DB] 保存消息成功');
      } catch (dbErr) {
        console.error('[DB] 保存消息失败', dbErr);
      }
    },
  });

  // 返回流式响应，兼容前端useChat
  const outputStream = modelResp.body.pipeThrough(streamTransformer);
  return new Response(outputStream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Stream-Type': 'ui-message',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
