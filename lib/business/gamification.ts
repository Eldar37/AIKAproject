import type { BusinessStage } from "@/types/aika";

export const LEVELS = [
  { level: 1, name: "Новичок", minXp: 0 },
  { level: 2, name: "Искатель ниши", minXp: 100 },
  { level: 3, name: "Первые шаги", minXp: 250 },
  { level: 4, name: "Создатель оффера", minXp: 450 },
  { level: 5, name: "Продавец", minXp: 700 },
  { level: 6, name: "Маркетолог", minXp: 1000 },
  { level: 7, name: "Предприниматель", minXp: 1400 },
  { level: 8, name: "Оператор роста", minXp: 1900 },
  { level: 9, name: "Стратег", minXp: 2500 },
  { level: 10, name: "Визионер", minXp: 3200 }
] as const;

export function calculateLevel(xp: number) {
  return [...LEVELS].reverse().find((level) => xp >= level.minXp) ?? LEVELS[0];
}

export function calculateStageProgress(tasksCompleted: number, stage: BusinessStage) {
  const stageWeight = stage === "START" ? 12 : stage === "GROWTH" ? 18 : 24;
  return Math.min(100, Math.round((tasksCompleted / stageWeight) * 100));
}

export function detectBusinessStage(input: {
  firstSaleDone?: boolean | null;
  monthlyRevenue?: number | null;
  tasksCompleted: number;
}): BusinessStage {
  if ((input.monthlyRevenue ?? 0) >= 150000 || input.tasksCompleted >= 24) return "SCALE";
  if (input.firstSaleDone || (input.monthlyRevenue ?? 0) > 0 || input.tasksCompleted >= 10) return "GROWTH";
  return "START";
}

export function calculateGrowthScore(input: {
  stage: BusinessStage;
  tasksCompleted: number;
  daysActive: number;
  contentCount: number;
  firstSaleDone?: boolean | null;
}) {
  const stageBase = input.stage === "START" ? 10 : input.stage === "GROWTH" ? 38 : 68;
  const taskScore = Math.min(25, input.tasksCompleted * 1.8);
  const activityScore = Math.min(18, input.daysActive * 2);
  const contentScore = Math.min(12, input.contentCount * 1.5);
  const salesScore = input.firstSaleDone ? 15 : 0;
  return Math.min(100, Math.round(stageBase + taskScore + activityScore + contentScore + salesScore));
}

export function updateStreakState(lastActive: Date, now = new Date(), current = 0, longest = 0) {
  const last = startOfDay(lastActive);
  const today = startOfDay(now);
  const diffDays = Math.round((today.getTime() - last.getTime()) / 86_400_000);

  if (diffDays <= 0) {
    return { current, longest: Math.max(longest, current), lastActive: now, daysActiveIncrement: 0 };
  }

  const nextCurrent = diffDays === 1 ? current + 1 : 1;
  return {
    current: nextCurrent,
    longest: Math.max(longest, nextCurrent),
    lastActive: now,
    daysActiveIncrement: 1
  };
}

export function achievementForTaskCount(tasksCompleted: number) {
  if (tasksCompleted >= 30) return { type: "task_30", title: "30 действий", icon: "🚀" };
  if (tasksCompleted >= 10) return { type: "task_10", title: "10 шагов к бизнесу", icon: "📈" };
  if (tasksCompleted >= 1) return { type: "first_task", title: "Первое действие", icon: "✅" };
  return null;
}

export function firstMoneySuggestion(aiMode: string, completedStartTasks: number) {
  return aiMode === "START_MODE" && completedStartTasks >= 5;
}

export function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function todayRange(now = new Date()) {
  const start = startOfDay(now);
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return { start, end };
}
