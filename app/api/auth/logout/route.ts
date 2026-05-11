import { NextResponse } from "next/server";
import { authCookieOptions } from "@/lib/auth/cookies";
import { AUTH_COOKIE } from "@/lib/auth/jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, "", authCookieOptions(0));
  return response;
}
