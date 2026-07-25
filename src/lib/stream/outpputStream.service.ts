import { MODEL_LIST, MODEL_PROVIDER_MAP } from '@/constants/index';
import { COMPRESS_TRIGGER_COUNT, SUMMARY_THRESHOLD, updateSummary } from '@/lib/context/conpress';
import { markdownToText } from '@/lib/markdown';
import { prisma } from '@/lib/prisma';
import type { Message as MessageType } from '@/types/chat.type';
import { NextResponse } from 'next/server';

type Message = {
  role: string;
  text: string;
  attachments?: {
    url: string;
    fileType?: string;
    fileName?: string;
  }[];
};

type MessageProps = {
  messages: Message[];
  enableDeepThink: boolean;
  model: string;
};

type Attachment = {
  url: string;
  fileType: string;
  fileName: string;
};

const IMAGE_TYPES = ['jpeg', 'png', 'jpg', 'webp', 'gif'];

export async function outputStreamService(messagesProps: MessageProps, id?: string) {
  const { messages, enableDeepThink, model } = messagesProps;
  const files: Attachment[] = [];

  // 校验模型
  const modelConfig = MODEL_LIST.find((i) => i.value === model);
  if (!modelConfig) {
    return NextResponse.json({ msg: '不支持的模型', code: 0 }, { status: 400 });
  }
  const providerConfig = MODEL_PROVIDER_MAP[modelConfig.value] as Record<string, any>;
  const { baseURL, apiKey } = providerConfig;

  // ========== 1. 构建当前用户消息内容 ==========
  const lastMsg = messages[messages.length - 1];
  const userContent: MessageType['content'] = [
    { type: 'text', text: lastMsg.text?.trim() || '' },
  ];

  if (lastMsg.attachments?.length) {
    for (const item of lastMsg.attachments) {
      files.push({
        url: item.url,
        fileType: item.fileType || 'file',
        fileName: item.fileName || item.url.split('/').pop() || item.url,
      });
      if (IMAGE_TYPES.includes(item.fileType?.toLowerCase() || '')) {
        userContent.push({ type: 'image_url', image_url: { url: item.url } });
      } else if (item.fileType?.startsWith('pdf')) {
        userContent.push({
          type: 'text',
          text: `[系统提示: 用户上传了PDF文件 ${item.fileName}，请使用RAG工具提取内容]`,
        });
      }
    }
  }

  // ========== 2. 保存用户消息到数据库 ==========
  if (id && lastMsg.text?.trim()) {
    try {
      await prisma.chatMessage.create({
        data: {
          chatId: id,
          role: 'user',
          content: lastMsg.text.trim(),
          modelName: modelConfig.value,
          attachments:
            files.length > 0
              ? {
                  create: files.map((f) => ({
                    name: f.fileName,
                    type: f.fileType,
                    url: f.url,
                  })),
                }
              : undefined,
        },
      });
    } catch (err) {
      console.error('[DB] 保存用户消息失败', err);
    }
  }

  // ========== 3. 加载记忆（摘要压缩 + 最近对话）==========
  let hasSummary = false;
  let sessionSummary = '';
  let lastCompressedMsgId: string | null = null;
  let msgCount = 0;

  if (id) {
    try {
      const session = await prisma.chatSession.findUnique({
        where: { chatId: id },
        select: { summary: true, lastCompressedMsgId: true },
      });
      sessionSummary = session?.summary || '';
      lastCompressedMsgId = session?.lastCompressedMsgId || null;
      hasSummary = !!sessionSummary;

      msgCount = await prisma.chatMessage.count({
        where: { chatId: id, type: 'chat' },
      });
    } catch (err) {
      console.error('[DB] 获取会话摘要失败', err);
    }
  }

  const RECENT_COUNT = 6; // 摘要模式下保留的最近原始消息数
  const historyMsgs: MessageType[] = [];

  try {
    if (hasSummary) {
      // ---- 情况 A: 已有摘要 → 补最近几条原始消息 ----
      historyMsgs.push({
        role: 'system',
        content: [{ type: 'text', text: `以下是对话历史摘要，请结合该摘要理解上下文：\n${sessionSummary}` }],
      });
      const recentRecords = await prisma.chatMessage.findMany({
        where: { chatId: id, type: 'chat' },
        orderBy: { createTime: 'asc' },
        take: RECENT_COUNT,
      });
      for (const record of recentRecords) {
        if (record.role === 'user' && record.content === lastMsg.text?.trim()) continue;
        historyMsgs.push({
          role: record.role as 'user' | 'assistant',
          content: [{ type: 'text', text: record.content }],
        });
      }
    } else if (msgCount > SUMMARY_THRESHOLD) {
      // ---- 情况 B: 无摘要，但历史过长 → 首先生成摘要 ----
      const allRecords = await prisma.chatMessage.findMany({
        where: { chatId: id, type: 'chat' },
        orderBy: { createTime: 'asc' },
      });
      const allTexts = allRecords.map((r) => `${r.role}: ${r.content}`);
      console.log('[Summary] 首次压缩中，共 %d 条消息...', allRecords.length);
      const newSummary = await updateSummary('', allTexts);
      if (newSummary) {
        try {
          const latestId = allRecords[allRecords.length - 1].msgId;
          await prisma.chatSession.update({
            where: { chatId: id },
            data: { summary: newSummary, lastCompressedMsgId: latestId },
          });
          console.log('[Summary] 首次摘要已保存');
        } catch (err) {
          console.error('[Summary] 保存摘要失败', err);
        }
        historyMsgs.push({
          role: 'system',
          content: [{ type: 'text', text: `以下是对话历史摘要，请结合该摘要理解上下文：\n${newSummary}` }],
        });
      }
      // 追加最近 RECENT_COUNT 条原始消息
      const recentRecords = await prisma.chatMessage.findMany({
        where: { chatId: id, type: 'chat' },
        orderBy: { createTime: 'asc' },
        take: RECENT_COUNT,
      });
      for (const record of recentRecords) {
        if (record.role === 'user' && record.content === lastMsg.text?.trim()) continue;
        historyMsgs.push({
          role: record.role as 'user' | 'assistant',
          content: [{ type: 'text', text: record.content }],
        });
      }
    } else {
      // ---- 情况 C: 无摘要，历史较短 → 直接加载原始消息 ----
      const historyRecords = await prisma.chatMessage.findMany({
        where: { chatId: id, type: 'chat' },
        orderBy: { createTime: 'asc' },
        take: 10,
      });
      for (const record of historyRecords) {
        if (record.role === 'user' && record.content === lastMsg.text?.trim()) continue;
        historyMsgs.push({
          role: record.role as 'user' | 'assistant',
          content: [{ type: 'text', text: record.content }],
        });
      }
    }
  } catch (err) {
    console.error('[DB] 加载历史消息失败', err);
  }

  // ========== 4. 组装最终消息列表 ==========
  const finalMessages = [...historyMsgs, { role: 'user' as const, content: userContent }];

  // ========== 5. 请求大模型 ==========
  const requestBody = {
    model: modelConfig.value,
    messages: finalMessages,
    stream: true,
    enable_thinking: enableDeepThink || false,
  };

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
    console.error('模型调用失败:', errText);
    return NextResponse.json(
      { msg: `模型调用失败: ${errText}`, code: 0 },
      { status: modelResp.status }
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let fullAnswer = '';
  let fullReasoning = '';

  // 异步检查并更新摘要：lastCompressedMsgId 之后新增超过阈值才压缩
  async function updateSummaryAsync() {
    if (!id || !lastCompressedMsgId) return;
    try {
      // 获取上次压缩消息的时间戳
      const compressedMsg = await prisma.chatMessage.findUnique({
        where: { msgId: lastCompressedMsgId },
        select: { createTime: true },
      });
      if (!compressedMsg) return;

      // 统计新增消息数
      const newCount = await prisma.chatMessage.count({
        where: {
          chatId: id,
          type: 'chat',
          createTime: { gt: compressedMsg.createTime },
        },
      });
      if (newCount < COMPRESS_TRIGGER_COUNT) return;

      // 达到阈值，拉取新增消息，合并压缩
      const newRecords = await prisma.chatMessage.findMany({
        where: {
          chatId: id,
          type: 'chat',
          createTime: { gt: compressedMsg.createTime },
        },
        orderBy: { createTime: 'asc' },
      });
      if (newRecords.length === 0) return;

      const newTexts = newRecords.map((r) => `${r.role}: ${r.content}`);
      const merged = await updateSummary(sessionSummary, newTexts);
      if (merged && merged !== sessionSummary) {
        const latestId = newRecords[newRecords.length - 1].msgId;
        await prisma.chatSession.update({
          where: { chatId: id },
          data: { summary: merged, lastCompressedMsgId: latestId },
        });
        console.log('[Summary] 摘要已合并更新');
      }
    } catch (err) {
      console.error('[Summary] 异步更新摘要失败', err);
    }
  }

  // ========== 6. 流式转换 + 保存助手回复 ==========
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
          if (delta.reasoning_content) {
            fullReasoning += delta.reasoning_content;
            controller.enqueue(
              encoder.encode(
                JSON.stringify({ type: 'reasoning-delta', textDelta: delta.reasoning_content }) +
                  '\n'
              )
            );
          }
          if (delta.content) {
            fullAnswer += delta.content;
            controller.enqueue(
              encoder.encode(
                JSON.stringify({ type: 'text-delta', textDelta: delta.content }) + '\n'
              )
            );
          }
        } catch (e) {
          console.error('解析模型响应失败:', e);
          continue;
        }
      }
    },
    async flush() {
      if (!id || !fullAnswer) return;
      try {
        await prisma.chatMessage.create({
          data: {
            chatId: id,
            role: 'assistant',
            content: fullAnswer,
            reasoningContent: markdownToText(fullReasoning || '') || '',
            modelName: modelConfig.value,
            enableDeepThink,
          },
        });
        console.log('[DB] 保存助手消息成功');
      } catch (err) {
        console.error('[DB] 保存助手消息失败', err);
      }

      // 异步更新摘要（不阻塞响应用户）
      if (hasSummary) {
        updateSummaryAsync().catch((err) =>
          console.error('[Summary] 异步更新失败', err)
        );
      }
    },
  });

  return modelResp.body.pipeThrough(streamTransformer);
}
