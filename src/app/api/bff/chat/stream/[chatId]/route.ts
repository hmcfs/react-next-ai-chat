import { createBBFRoute } from '@/lib/bff-proxy';
import { NextRequest } from 'next/server';

const handler = createBBFRoute();
export async function POST(req: NextRequest) {
  const response = handler(req);
  return response;
}
