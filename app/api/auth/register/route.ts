import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { AUTH_COOKIE, signAuthToken } from "@/lib/auth/jwt";
import { authCookieOptions } from "@/lib/auth/cookies";
import { handleRouteError } from "@/lib/utils/http";
import { registerSchema } from "@/lib/utils/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const payload = registerSchema.parse(await request.json());
    const existing = await prisma.user.findUnique({ where: { email: payload.email } });

    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(payload.password);
    const user = await prisma.user.create({
      data: {
        email: payload.email,
        name: payload.name,
        passwordHash,
        profile: { create: {} },
        progress: { create: { milestones: [] } },
        streaks: { create: {} }
      },
      include: { profile: true, progress: true, streaks: true }
    });

    const token = await signAuthToken({ userId: user.id, email: user.email });
    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, profile: user.profile }
    });

    response.cookies.set(AUTH_COOKIE, token, authCookieOptions());

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
