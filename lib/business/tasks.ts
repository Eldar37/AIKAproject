import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { recommendationForMode, tasksForMode } from "@/lib/ai/modes";
import type { AIMode, BusinessStage } from "@/types/aika";
import {
  achievementForTaskCount,
  calculateGrowthScore,
  calculateLevel,
  calculateStageProgress,
  detectBusinessStage,
  firstMoneySuggestion,
  todayRange,
  updateStreakState
} from "./gamification";

export async function createDailyTasksForUser(userId: string, mode?: AIMode, force = false) {
  const { start, end } = todayRange();
  const existing = await prisma.task.findMany({
    where: {
      userId,
      dueDate: { gte: start, lt: end }
    },
    orderBy: [{ status: "asc" }, { createdAt: "asc" }]
  });

  if (existing.length >= 3 && !force) return existing;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { business: true }
  });

  const selectedMode = mode ?? ((user?.business?.aiMode as AIMode | undefined) || "START_MODE");
  const templates = tasksForMode(selectedMode);

  await prisma.task.createMany({
    data: templates.map((task) => ({
      userId,
      title: task.title,
      description: task.description,
      type: task.type,
      priority: task.priority,
      xpReward: task.xpReward,
      dueDate: new Date()
    }))
  });

  return prisma.task.findMany({
    where: {
      userId,
      dueDate: { gte: start, lt: end }
    },
    orderBy: [{ createdAt: "desc" }],
    take: 6
  });
}

export async function completeTaskForUser(userId: string, taskId: string, status: "completed" | "skipped", firstSaleDone = false) {
  return prisma.$transaction(async (tx) => {
    const task = await tx.task.findFirst({
      where: { id: taskId, userId }
    });

    if (!task) {
      throw new Error("Task not found");
    }

    const wasCompleted = task.status === "completed";
    const shouldAwardXp = status === "completed" && !wasCompleted;

    const updatedTask = await tx.task.update({
      where: { id: taskId },
      data: {
        status,
        completedAt: status === "completed" ? new Date() : null
      }
    });

    const profile = await tx.userProfile.upsert({
      where: { userId },
      update: {},
      create: { userId }
    });

    let newXp = profile.xp;
    let level = calculateLevel(profile.xp);
    if (shouldAwardXp) {
      newXp += task.xpReward;
      level = calculateLevel(newXp);
      await tx.userProfile.update({
        where: { userId },
        data: {
          xp: newXp,
          level: level.level
        }
      });
    }

    const streak = await tx.streak.upsert({
      where: { userId },
      update: {},
      create: { userId }
    });

    const nextStreak = status === "completed"
      ? updateStreakState(streak.lastActive, new Date(), streak.current, streak.longest)
      : { current: streak.current, longest: streak.longest, lastActive: streak.lastActive, daysActiveIncrement: 0 };

    await tx.streak.update({
      where: { userId },
      data: {
        current: nextStreak.current,
        longest: nextStreak.longest,
        lastActive: nextStreak.lastActive
      }
    });

    const tasksCompleted = await tx.task.count({
      where: { userId, status: "completed" }
    });

    const business = await tx.businessProfile.findUnique({ where: { userId } });
    const contentCount = await tx.contentHistory.count({ where: { userId } });
    const stage = detectBusinessStage({
      firstSaleDone: firstSaleDone || business?.firstSaleDone,
      monthlyRevenue: business?.monthlyRevenue,
      tasksCompleted
    });
    const stageProgress = calculateStageProgress(tasksCompleted, stage);
    const totalScore = calculateGrowthScore({
      stage,
      tasksCompleted,
      daysActive: Math.max(nextStreak.longest, nextStreak.current),
      contentCount,
      firstSaleDone: firstSaleDone || business?.firstSaleDone
    });

    await tx.progress.upsert({
      where: { userId },
      update: {
        currentStage: stage,
        stageProgress,
        totalScore,
        tasksCompleted,
        daysActive: { increment: nextStreak.daysActiveIncrement }
      },
      create: {
        userId,
        currentStage: stage,
        stageProgress,
        totalScore,
        tasksCompleted,
        daysActive: Math.max(1, nextStreak.current),
        milestones: stage === "GROWTH" ? ["first_income"] : []
      }
    });

    if (business) {
      await tx.businessProfile.update({
        where: { userId },
        data: {
          stage,
          firstSaleDone: firstSaleDone || business.firstSaleDone,
          aiMode: firstMoneySuggestion(business.aiMode, tasksCompleted) ? "FIRST_MONEY_MODE" : business.aiMode
        }
      });
    }

    const taskAchievement = achievementForTaskCount(tasksCompleted);
    if (taskAchievement) {
      await upsertAchievement(tx, userId, taskAchievement.type, taskAchievement.title, taskAchievement.type);
    }

    if (firstSaleDone) {
      await upsertAchievement(tx, userId, "first_sale", "first_sale", "first_sale");
    }

    if (nextStreak.current >= 7) {
      await upsertAchievement(tx, userId, "streak_7", "streak_7", "streak_7");
    }

    if (nextStreak.current >= 30) {
      await upsertAchievement(tx, userId, "streak_30", "streak_30", "streak_30");
    }

    return {
      task: updatedTask,
      xp: newXp,
      level,
      streak: nextStreak,
      stage,
      suggestion: business && firstMoneySuggestion(business.aiMode, tasksCompleted)
        ? "recommendation.mode.FIRST_MONEY_MODE"
        : null
    };
  });
}

export async function getDashboardSnapshot(userId: string) {
  const { start, end } = todayRange();
  const [user, tasks, completedCount, contentCount, achievements] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, business: true, progress: true, streaks: true }
    }),
    prisma.task.findMany({
      where: { userId, dueDate: { gte: start, lt: end } },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }]
    }),
    prisma.task.count({ where: { userId, status: "completed" } }),
    prisma.contentHistory.count({ where: { userId } }),
    prisma.achievement.findMany({ where: { userId }, orderBy: { unlockedAt: "desc" }, take: 8 })
  ]);

  if (!user) return null;

  const stage = (user.business?.stage ?? user.progress?.currentStage ?? "START") as BusinessStage;
  const growthScore = calculateGrowthScore({
    stage,
    tasksCompleted: completedCount,
    daysActive: user.progress?.daysActive ?? 0,
    contentCount,
    firstSaleDone: user.business?.firstSaleDone
  });

  return {
    user,
    tasks,
    completedCount,
    contentCount,
    achievements,
    growthScore,
    insight: buildInsight(user.business?.aiMode ?? "START_MODE", completedCount, contentCount, user.streaks?.lastActive)
  };
}

export function buildInsight(aiMode: string, tasksCompleted: number, contentCount: number, lastActive?: Date | null) {
  if (lastActive) {
    const inactiveDays = Math.floor((Date.now() - lastActive.getTime()) / 86_400_000);
    if (inactiveDays >= 3) {
      return "dashboard.defaultInsight";
    }
  }

  if (contentCount === 0 || contentCount < Math.max(1, Math.floor(tasksCompleted / 5))) {
    return "recommendation.firstPost";
  }

  if (firstMoneySuggestion(aiMode, tasksCompleted)) {
    return "recommendation.mode.FIRST_MONEY_MODE";
  }

  return recommendationForMode(aiMode);
}

async function upsertAchievement(
  tx: Prisma.TransactionClient,
  userId: string,
  type: string,
  title: string,
  description: string
) {
  await tx.achievement.upsert({
    where: { userId_type: { userId, type } },
    update: { icon: null },
    create: { userId, type, title, description, icon: null }
  });
}
