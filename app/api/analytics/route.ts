import { prisma } from "@/lib/db/prisma";
import { requireUserId } from "@/lib/auth/middleware";
import { getDashboardSnapshot } from "@/lib/business/tasks";
import { todayRange } from "@/lib/business/gamification";
import { errorResponse, handleRouteError, jsonResponse } from "@/lib/utils/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await requireUserId();
    const snapshot = await getDashboardSnapshot(userId);
    if (!snapshot) return errorResponse("User not found", 404);

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 29);
    const [tasks, content, streak] = await Promise.all([
      prisma.task.findMany({
        where: { userId, createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true, status: true, xpReward: true }
      }),
      prisma.contentHistory.findMany({
        where: { userId, createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true }
      }),
      prisma.streak.findUnique({ where: { userId } })
    ]);

    const activity = Array.from({ length: 30 }).map((_, index) => {
      const date = new Date(thirtyDaysAgo);
      date.setDate(thirtyDaysAgo.getDate() + index);
      const key = date.toISOString().slice(0, 10);
      return {
        date: key,
        tasks: tasks.filter((task) => task.createdAt.toISOString().slice(0, 10) === key).length,
        completed: tasks.filter((task) => task.status === "completed" && task.createdAt.toISOString().slice(0, 10) === key).length,
        content: content.filter((item) => item.createdAt.toISOString().slice(0, 10) === key).length
      };
    });

    const { start, end } = todayRange();
    const todayCompleted = await prisma.task.count({
      where: { userId, status: "completed", completedAt: { gte: start, lt: end } }
    });

    return jsonResponse({
      stats: {
        tasksCompleted: snapshot.completedCount,
        todayCompleted,
        contentGenerated: snapshot.contentCount,
        streak,
        xp: snapshot.user.profile?.xp ?? 0,
        level: snapshot.user.profile?.level ?? 1,
        growthScore: snapshot.growthScore,
        stage: snapshot.user.business?.stage ?? "START",
        achievements: snapshot.achievements
      },
      activity
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
