import { NextRequest, NextResponse } from 'next/server';
import { createBBFRoute } from '@/lib/bbf-proxy';

const handler = createBBFRoute();
export async function POST(req: NextRequest) {
  return handler(req);
}
