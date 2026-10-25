import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isProtected =
    path.startsWith("/overview") ||
    path.startsWith("/transactions") ||
    path.startsWith("/budgets") ||
    path.startsWith("/accounts") ||
    path.startsWith("/savings") ||
    path.startsWith("/reports") ||
    path.startsWith("/ai-coach") ||
    path.startsWith("/settings");

  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");

  if (isProtected && !sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", path);
    return NextResponse.redirect(loginUrl);
  }

  // If logged in and visiting /login or /register, redirect to /overview
  const isAuthPage = path === "/login" || path === "/register";
  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL("/overview", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/overview/:path*",
    "/transactions/:path*",
    "/budgets/:path*",
    "/accounts/:path*",
    "/savings/:path*",
    "/reports/:path*",
    "/ai-coach/:path*",
    "/settings/:path*",
    "/login",
    "/register",
  ],
};
