import { NextRequest, NextResponse } from 'next/server';
import { createBBFRoute } from '@/lib/bbf-proxy';

const handlers: Record<string, (req: NextRequest) => Promise<NextResponse>> = {
  auth: createBBFRoute('auth'),
  chat: createBBFRoute('chat'),
  storage: createBBFRoute('storage'),
};

export async function GET(req: NextRequest) {
  const service = req.nextUrl.pathname.match(/\/api\/bbf\/([^/]+)/)?.[1];
  if (!service || !handlers[service]) {
    return NextResponse.json({ error: 'Invalid service' }, { status: 400 });
  }
  return handlers[service](req);
}

export async function POST(req: NextRequest) {
  const service = req.nextUrl.pathname.match(/\/api\/bbf\/([^/]+)/)?.[1];
  if (!service || !handlers[service]) {
    return NextResponse.json({ error: 'Invalid service' }, { status: 400 });
  }
  return handlers[service](req);
}

export async function PUT(req: NextRequest) {
  const service = req.nextUrl.pathname.match(/\/api\/bbf\/([^/]+)/)?.[1];
  if (!service || !handlers[service]) {
    return NextResponse.json({ error: 'Invalid service' }, { status: 400 });
  }
  return handlers[service](req);
}

export async function DELETE(req: NextRequest) {
  const service = req.nextUrl.pathname.match(/\/api\/bbf\/([^/]+)/)?.[1];
  if (!service || !handlers[service]) {
    return NextResponse.json({ error: 'Invalid service' }, { status: 400 });
  }
  return handlers[service](req);
}

export async function PATCH(req: NextRequest) {
  const service = req.nextUrl.pathname.match(/\/api\/bbf\/([^/]+)/)?.[1];
  if (!service || !handlers[service]) {
    return NextResponse.json({ error: 'Invalid service' }, { status: 400 });
  }
  return handlers[service](req);
}
