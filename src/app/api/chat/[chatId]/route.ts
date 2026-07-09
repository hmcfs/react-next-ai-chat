import { prisma } from '@/lib/prisma';
import { createOpenAI } from '@ai-sdk/openai';
import { convertToModelMessages, streamText, UIMessage } from 'ai';
import { NextRequest } from 'next/server';
const bailian = createOpenAI({
  apiKey: process.env.BAILIAN_API_KEY,
  baseURL: process.env.BAILIAN_BASE_URL,
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
  const { messages, chatId }: { messages: UIMessage[]; chatId: string } = await req.json();

  const result = streamText({
    model: bailian('qwen-plus'),
    messages: await convertToModelMessages(messages),

    onFinish: async ({ text }) => {
      if (!chatId || !text) return;

      try {
        await prisma.chatMessage.create({
          data: {
            chatId,
            role: 'assistant',
            content: text,
          },
        });
      } catch (error) {
        console.error('[DB] Failed to save assistant message:', error);
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
