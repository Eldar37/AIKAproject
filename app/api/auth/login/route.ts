import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { AUTH_COOKIE, signAuthToken } from "@/lib/auth/jwt";
import { authCookieOptions } from "@/lib/auth/cookies";
import { assertAuthConfig, isDatabaseConfigured } from "@/lib/config/runtime";
import { createSimpleSession, simpleUserFromSession } from "@/lib/simple-mode/data";
import { handleRouteError } from "@/lib/utils/http";
import { loginSchema } from "@/lib/utils/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const payload = loginSchema.parse(await request.json());

    if (!isDatabaseConfigured()) {
      const session = createSimpleSession({
        email: payload.email,
        name: payload.email.split("@")[0] || "AIKA user",
        language: "ru"
      });
      const token = await signAuthToken(session);
      const response = NextResponse.json({
        user: simpleUserFromSession(session),
        mode: "simple"
      });

      response.cookies.set(AUTH_COOKIE, token, authCookieOptions());
      return response;
    }

    assertAuthConfig();

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
      include: { profile: true, business: true, progress: true, streaks: true }
    });

    if (!user || !(await verifyPassword(payload.password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = await signAuthToken({ userId: user.id, email: user.email });
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile: user.profile,
        business: user.business,
        progress: user.progress,
        streak: user.streaks
      }
    });

    response.cookies.set(AUTH_COOKIE, token, authCookieOptions());

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
