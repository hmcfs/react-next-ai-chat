import { NextRequest, NextResponse } from 'next/server';
import { authProxy } from './proxy/auth';
export default async function proxy(req: NextRequest) {
  //console.log('当前环境:', process.env.NODE_ENV);
  const authResult = await authProxy(req);
  if (authResult) return authResult;
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Always run for Clerk-specific frontend API routes
    '/__clerk/(.*)',
  ],
};
