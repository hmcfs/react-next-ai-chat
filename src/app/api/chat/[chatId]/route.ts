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
  //console.log('params', await params);
  const lastMsg = messages[messages.length - 1];
  if (lastMsg?.role === 'user' && chatId) {
    try {
      const textContent =
        lastMsg.parts
          ?.filter((p) => p.type === 'text')
          .map((p) => p.text)
          .join('') ?? '';
      await prisma.chatMessage.create({
        data: {
          chatId,
          role: lastMsg.role,
          content: textContent,
        },
      });
    } catch (error) {
      console.error('[DB] Failed to save user message:', error);
    }
  }
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
