import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentSession, requireUserId } from "@/lib/auth/middleware";
import { calculateGrowthScore, calculateStageProgress, detectBusinessStage } from "@/lib/business/gamification";
import { isSimpleMode } from "@/lib/config/runtime";
import { simpleProgress } from "@/lib/simple-mode/data";
import { handleRouteError, jsonResponse } from "@/lib/utils/http";
import { progressUpdateSchema } from "@/lib/utils/validators";
import type { BusinessStage } from "@/types/aika";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const payload = progressUpdateSchema.parse(await request.json());

    if (isSimpleMode()) {
      const session = await getCurrentSession();
      const simple = session ? simpleProgress(session) : { progress: null };
      return jsonResponse({
        progress: simple.progress
          ? { ...simple.progress, totalScore: payload.firstSaleDone ? 35 : simple.progress.totalScore }
          : null,
        mode: "simple"
      });
    }

    const userId = await requireUserId();
    const [business, tasksCompleted, contentCount, progress] = await Promise.all([
      prisma.businessProfile.findUnique({ where: { userId } }),
      prisma.task.count({ where: { userId, status: "completed" } }),
      prisma.contentHistory.count({ where: { userId } }),
      prisma.progress.upsert({ where: { userId }, update: {}, create: { userId, milestones: [] } })
    ]);

    const stage = detectBusinessStage({
      firstSaleDone: payload.firstSaleDone || business?.firstSaleDone,
      monthlyRevenue: payload.monthlyRevenue ?? business?.monthlyRevenue,
      tasksCompleted
    });
    const milestones = payload.milestone && !progress.milestones.includes(payload.milestone)
      ? [...progress.milestones, payload.milestone]
      : progress.milestones;

    const updated = await prisma.progress.update({
      where: { userId },
      data: {
        currentStage: stage,
        stageProgress: calculateStageProgress(tasksCompleted, stage),
        totalScore: calculateGrowthScore({
          stage: stage as BusinessStage,
          tasksCompleted,
          daysActive: progress.daysActive,
          contentCount,
          firstSaleDone: payload.firstSaleDone || business?.firstSaleDone
        }),
        tasksCompleted,
        milestones
      }
    });

    if (business) {
      await prisma.businessProfile.update({
        where: { userId },
        data: {
          stage,
          firstSaleDone: payload.firstSaleDone || business.firstSaleDone,
          monthlyRevenue: payload.monthlyRevenue ?? business.monthlyRevenue
        }
      });
    }

    return jsonResponse({ progress: updated });
  } catch (error) {
    return handleRouteError(error);
  }
}
