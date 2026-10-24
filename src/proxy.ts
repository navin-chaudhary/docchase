import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPrefixes = [
  "/dashboard",
  "/clients",
  "/requests",
  "/templates",
  "/documents",
  "/reminders",
  "/activity",
  "/profile",
];

const authPages = ["/login", "/register", "/forgot-password", "/reset-password"];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

  const isSecure =
    request.url.startsWith("https://") ||
    request.headers.get("x-forwarded-proto") === "https" ||
    request.cookies.has("__Secure-authjs.session-token") ||
    request.cookies.has("__Secure-next-auth.session-token");

  let token = await getToken({
    req: request,
    secret,
    secureCookie: isSecure,
  });

  if (!token && isSecure) {
    token = await getToken({
      req: request,
      secret,
      secureCookie: false,
    });
  }

  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isAuthPage = authPages.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`)
  );

  if (isProtected && !token) {
    const loginUrl = new URL("/login", request.url);
    const callback = `${pathname}${search}`;
    loginUrl.searchParams.set("callbackUrl", callback);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthPage && token) {
    const rawCallbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    const redirectUrl =
      rawCallbackUrl &&
      rawCallbackUrl.startsWith("/") &&
      !rawCallbackUrl.startsWith("//")
        ? rawCallbackUrl
        : "/dashboard";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/requests/:path*",
    "/templates/:path*",
    "/documents/:path*",
    "/reminders/:path*",
    "/activity/:path*",
    "/profile/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
