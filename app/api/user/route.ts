import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentSession, requireUserId } from "@/lib/auth/middleware";
import { AUTH_COOKIE, signAuthToken } from "@/lib/auth/jwt";
import { authCookieOptions } from "@/lib/auth/cookies";
import { isSimpleMode } from "@/lib/config/runtime";
import { simpleUserFromSession } from "@/lib/simple-mode/data";
import { handleRouteError, jsonResponse } from "@/lib/utils/http";
import { userPatchSchema } from "@/lib/utils/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (isSimpleMode()) {
      const session = await getCurrentSession();
      return jsonResponse({ user: session ? simpleUserFromSession(session) : null, mode: "simple" });
    }

    const userId = await requireUserId();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        business: true,
        progress: true,
        streaks: true,
        achievements: { orderBy: { unlockedAt: "desc" }, take: 12 }
      }
    });

    return jsonResponse({ user });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (isSimpleMode()) {
      const session = await getCurrentSession();
      if (!session) return jsonResponse({ user: null }, { status: 401 });

      const payload = userPatchSchema.parse(await request.json());
      const nextSession = {
        ...session,
        name: payload.name ?? session.name,
        language: payload.language ?? session.language,
        experienceLevel: payload.experienceLevel ?? session.experienceLevel,
        business: session.business
          ? {
              ...session.business,
              name: payload.businessName ?? session.business.name,
              niche: payload.niche ?? session.business.niche,
              description: payload.description ?? session.business.description,
              stage: payload.stage ?? session.business.stage,
              budget: payload.budget ?? session.business.budget,
              targetAudience: payload.targetAudience ?? session.business.targetAudience,
              channels: payload.channels ?? session.business.channels,
              firstSaleDone: payload.firstSaleDone ?? session.business.firstSaleDone,
              monthlyRevenue: payload.monthlyRevenue ?? session.business.monthlyRevenue,
              goals: payload.goals ?? session.business.goals,
              aiMode: payload.aiMode ?? session.business.aiMode
            }
          : session.business
      };
      const response = NextResponse.json({ user: simpleUserFromSession(nextSession), mode: "simple" });
      response.cookies.set(AUTH_COOKIE, await signAuthToken(nextSession), authCookieOptions());
      return response;
    }

    const userId = await requireUserId();
    const payload = userPatchSchema.parse(await request.json());

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(payload.name ? { name: payload.name } : {}),
        profile: {
          upsert: {
            create: {
              avatarUrl: payload.avatarUrl ?? undefined,
              timezone: payload.timezone ?? "Asia/Bishkek",
              language: payload.language ?? "ru",
              experienceLevel: payload.experienceLevel ?? "beginner"
            },
            update: {
              avatarUrl: payload.avatarUrl,
              timezone: payload.timezone,
              language: payload.language,
              experienceLevel: payload.experienceLevel
            }
          }
        },
        business: {
          upsert: {
            create: {
              name: payload.businessName ?? null,
              niche: payload.niche ?? null,
              description: payload.description ?? null,
              stage: payload.stage ?? "START",
              budget: payload.budget ?? null,
              targetAudience: payload.targetAudience ?? null,
              channels: payload.channels ?? ["instagram", "whatsapp"],
              firstSaleDone: payload.firstSaleDone ?? false,
              monthlyRevenue: payload.monthlyRevenue ?? null,
              goals: payload.goals ?? [],
              aiMode: payload.aiMode ?? "START_MODE"
            },
            update: {
              name: payload.businessName,
              niche: payload.niche,
              description: payload.description,
              stage: payload.stage,
              budget: payload.budget,
              targetAudience: payload.targetAudience,
              channels: payload.channels,
              firstSaleDone: payload.firstSaleDone,
              monthlyRevenue: payload.monthlyRevenue,
              goals: payload.goals,
              aiMode: payload.aiMode
            }
          }
        }
      },
      include: { profile: true, business: true, progress: true, streaks: true }
    });

    return jsonResponse({ user });
  } catch (error) {
    return handleRouteError(error);
  }
}
