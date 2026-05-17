// ============================================
// Middleware: Protects admin routes
// ============================================

import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = req.nextUrl.pathname === '/admin/login';
  const isAuthenticated = !!req.auth;

  // Allow access to login page
  if (isLoginPage) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    return NextResponse.next();
  }

  // Protect admin routes
  if (isAdminRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*'],
};
