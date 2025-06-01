import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth(req => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // 認証が必要なルート
  const protectedRoutes = ['/dashboard', '/tasks', '/profile'];

  // 認証済みユーザーがアクセスできないルート（ログイン、登録ページなど）
  const authRoutes = ['/auth/signin', '/auth/signup'];

  // 保護されたルートへのアクセス
  if (protectedRoutes.some(route => nextUrl.pathname.startsWith(route))) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/auth/signin', nextUrl));
    }
  }

  // 認証済みユーザーが認証ページにアクセスした場合
  if (authRoutes.includes(nextUrl.pathname)) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * 以下を除くすべてのリクエストパスにマッチ:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
