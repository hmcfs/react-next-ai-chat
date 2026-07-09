import { outputStreamService } from '@/lib/service/stream/outpputStream.service';
import { NextRequest, NextResponse } from 'next/server';

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
// 接口入参
type RequestBody = {
  model: string;
  messages: Messages;
  enableDeepThink?: boolean;
};
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json({ success: true });
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json()) as RequestBody;
  const { model, enableDeepThink = false, messages } = body;
  const outputStream = await outputStreamService(messages, model, id, enableDeepThink);
  return new Response(outputStream as unknown as ReadableStream<any>, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Stream-Type': 'ui-message',
      // 严格禁用缓存，流式标准组合
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Connection: 'keep-alive',
      // Nginx 关闭缓冲区，保证实时推流（必加）
      'X-Accel-Buffering': 'no',
    },
  });
}
