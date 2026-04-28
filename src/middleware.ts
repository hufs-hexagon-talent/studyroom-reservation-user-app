import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/email', '/notice'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 공개 경로는 통과
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 루트 페이지는 통과 (예약 현황은 비인증도 볼 수 있음)
  if (pathname === '/') {
    return NextResponse.next();
  }

  // 쿠키 존재 확인 (인증 검증)
  try {
    const hasAuth =
      request.cookies.has('accessToken') ||
      request.cookies.has('refreshToken');

    if (!hasAuth) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } catch {
    // 쿠키 파싱 실패 시 로그인으로 리다이렉트
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
