import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { NextRequest } from 'next/server';
const bailian = createOpenAI({
  apiKey: process.env.BAILIAN_API_KEY,
  baseURL: process.env.BAILIAN_BASE_URL,
});

export async function POST(req: NextRequest) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: bailian('qwen-plus'),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
