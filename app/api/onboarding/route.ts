import { NextRequest, NextResponse } from "next/server";
import { determineModeFromOnboarding, getModeDefinition } from "@/lib/ai/modes";
import { createDailyTasksForUser } from "@/lib/business/tasks";
import { prisma } from "@/lib/db/prisma";
import { getCurrentSession, requireUserId } from "@/lib/auth/middleware";
import { AUTH_COOKIE, signAuthToken } from "@/lib/auth/jwt";
import { authCookieOptions } from "@/lib/auth/cookies";
import { isSimpleMode } from "@/lib/config/runtime";
import { applySimpleOnboarding, simpleTasks, simpleUserFromSession } from "@/lib/simple-mode/data";
import { handleRouteError, jsonResponse } from "@/lib/utils/http";
import { onboardingSchema } from "@/lib/utils/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const payload = onboardingSchema.parse(await request.json());

    if (isSimpleMode()) {
      const session = await getCurrentSession();
      if (!session) return jsonResponse({ error: "Authentication required" }, { status: 401 });

      const nextSession = applySimpleOnboarding(session, payload);
      const response = NextResponse.json({
        user: simpleUserFromSession(nextSession),
        tasks: simpleTasks(nextSession.business?.aiMode),
        aiMode: nextSession.business?.aiMode,
        mode: "simple"
      });

      response.cookies.set(AUTH_COOKIE, await signAuthToken(nextSession), authCookieOptions());
      return response;
    }

    const userId = await requireUserId();
    const aiMode = determineModeFromOnboarding({
      hasBusiness: payload.hasBusiness,
      mainGoal: payload.mainGoal,
      monthlyRevenue: payload.monthlyRevenue
    });
    const mode = getModeDefinition(aiMode);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        profile: {
          upsert: {
            create: { experienceLevel: payload.experienceLevel },
            update: { experienceLevel: payload.experienceLevel }
          }
        },
        business: {
          upsert: {
            create: {
              name: payload.businessName,
              niche: payload.niche,
              description: payload.description,
              stage: mode.stage,
              isOnline: payload.isOnline,
              budget: payload.budget,
              targetAudience: payload.targetAudience,
              channels: payload.channels,
              firstSaleDone: false,
              monthlyRevenue: payload.monthlyRevenue,
              goals: [payload.mainGoal],
              aiMode
            },
            update: {
              name: payload.businessName,
              niche: payload.niche,
              description: payload.description,
              stage: mode.stage,
              isOnline: payload.isOnline,
              budget: payload.budget,
              targetAudience: payload.targetAudience,
              channels: payload.channels,
              monthlyRevenue: payload.monthlyRevenue,
              goals: [payload.mainGoal],
              aiMode
            }
          }
        },
        progress: {
          upsert: {
            create: {
              currentStage: mode.stage,
              stageProgress: 5,
              totalScore: 10,
              tasksCompleted: 0,
              daysActive: 1,
              milestones: []
            },
            update: {
              currentStage: mode.stage,
              stageProgress: 5,
              totalScore: 10
            }
          }
        }
      },
      include: { profile: true, business: true, progress: true }
    });

    const tasks = await createDailyTasksForUser(userId, aiMode, true);
    return jsonResponse({ user, tasks, aiMode });
  } catch (error) {
    return handleRouteError(error);
  }
}
