import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, verifyAuthToken } from "@/lib/auth/jwt";

const protectedPages = ["/dashboard", "/chat", "/journey", "/content", "/tasks", "/analytics", "/onboarding"];
const publicApiPrefixes = ["/api/auth", "/api/health"];

function corsHeaders(request: NextRequest) {
  const origin = request.headers.get("origin");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const allowed = new Set([request.nextUrl.origin, appUrl].filter(Boolean));
  const headers = new Headers();

  if (origin && allowed.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }

  headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Vary", "Origin");
  return headers;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api");
  const isPublicApi = publicApiPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const isProtectedPage = protectedPages.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const headers = isApi ? corsHeaders(request) : undefined;

  if (isApi && request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers });
  }

  if ((isApi && !isPublicApi) || isProtectedPage) {
    const session = await verifyAuthToken(request.cookies.get(AUTH_COOKIE)?.value);

    if (!session) {
      if (isApi) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401, headers });
      }

      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isApi && headers) {
    const response = NextResponse.next();
    headers.forEach((value, key) => response.headers.set(key, value));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/chat/:path*", "/journey/:path*", "/content/:path*", "/tasks/:path*", "/analytics/:path*", "/onboarding/:path*"]
};
