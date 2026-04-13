import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Stub: Replace with NextAuth.js middleware when auth is configured
// import { getToken } from 'next-auth/jwt';

const publicPaths = ['/login', '/forgot-password', '/api/webhooks'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static assets and Next.js internals
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Stub: Check for auth token
  // const token = await getToken({ req: request });
  // if (!token) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
