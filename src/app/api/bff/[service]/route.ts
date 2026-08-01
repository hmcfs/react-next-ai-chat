import { createBBFRoute } from '@/lib/bff-proxy';
import { NextRequest } from 'next/server';

const handler = createBBFRoute();

export async function GET(req: NextRequest) {
  return handler(req);
}
export async function POST(req: NextRequest) {
  return handler(req);
}
export async function PUT(req: NextRequest) {
  return handler(req);
}
export async function DELETE(req: NextRequest) {
  return handler(req);
}
export async function PATCH(req: NextRequest) {
  return handler(req);
}
