import { randomUUID } from "crypto";
import { determineModeFromOnboarding, getModeDefinition, tasksForMode } from "@/lib/ai/modes";
import type { AuthTokenPayload, SessionBusinessContext } from "@/lib/auth/jwt";
import type { AIMode } from "@/types/aika";

type RegistrationPayload = {
  email: string;
  name: string;
  language?: "ru" | "ky" | "en";
};

type OnboardingPayload = {
  hasBusiness: boolean;
  businessName?: string | null;
  niche: string;
  description?: string | null;
  isOnline: boolean;
  budget: "low" | "medium" | "high";
  mainGoal: "first_sale" | "grow_audience" | "increase_revenue" | "build_brand";
  experienceLevel: "beginner" | "intermediate" | "advanced";
  targetAudience?: string | null;
  channels: string[];
  monthlyRevenue?: number | null;
};

export function createSimpleSession(payload: RegistrationPayload): AuthTokenPayload {
  return {
    userId: `simple_${randomUUID()}`,
    email: payload.email,
    name: payload.name,
    language: payload.language ?? "ru",
    experienceLevel: "beginner",
    local: true
  };
}

export function applySimpleOnboarding(session: AuthTokenPayload, payload: OnboardingPayload): AuthTokenPayload {
  const aiMode = determineModeFromOnboarding({
    hasBusiness: payload.hasBusiness,
    mainGoal: payload.mainGoal,
    monthlyRevenue: payload.monthlyRevenue
  });
  const mode = getModeDefinition(aiMode);

  return {
    ...session,
    experienceLevel: payload.experienceLevel,
    business: {
      name: payload.businessName ?? null,
      niche: payload.niche,
      description: payload.description ?? null,
      stage: mode.stage,
      isOnline: payload.isOnline,
      budget: payload.budget,
      targetAudience: payload.targetAudience ?? null,
      channels: payload.channels,
      firstSaleDone: false,
      monthlyRevenue: payload.monthlyRevenue ?? null,
      goals: [payload.mainGoal],
      aiMode
    }
  };
}

export function simpleUserFromSession(session: AuthTokenPayload) {
  const now = new Date();
  const business = session.business;
  const stage = business?.stage ?? "START";

  return {
    id: session.userId,
    email: session.email,
    name: session.name ?? nameFromEmail(session.email),
    createdAt: now,
    updatedAt: now,
    profile: {
      id: "simple_profile",
      userId: session.userId,
      avatarUrl: null,
      timezone: "Asia/Bishkek",
      language: session.language ?? "ru",
      experienceLevel: session.experienceLevel ?? "beginner",
      xp: 0,
      level: 1
    },
    business: business ? simpleBusiness(session.userId, business) : null,
    progress: {
      id: "simple_progress",
      userId: session.userId,
      currentStage: stage,
      stageProgress: business ? 12 : 0,
      totalScore: business ? 18 : 0,
      tasksCompleted: 0,
      daysActive: 1,
      milestones: [],
      updatedAt: now
    },
    streaks: {
      id: "simple_streak",
      userId: session.userId,
      current: 1,
      longest: 1,
      lastActive: now,
      updatedAt: now
    },
    achievements: []
  };
}

export function simpleTasks(mode?: string) {
  const selectedMode = asMode(mode);
  return tasksForMode(selectedMode).map((task, index) => ({
    id: `simple_task_${index + 1}`,
    title: task.title,
    description: task.description,
    type: task.type,
    status: "pending",
    priority: task.priority,
    xpReward: task.xpReward,
    dueDate: new Date(),
    createdAt: new Date(),
    completedAt: null
  }));
}

export function simpleAnalytics(session: AuthTokenPayload) {
  const business = session.business;
  const stage = business?.stage ?? "START";
  const today = new Date();
  const activity = Array.from({ length: 30 }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (29 - index));
    return {
      date: date.toISOString().slice(0, 10),
      tasks: index > 26 ? 3 : 0,
      completed: index > 27 ? 1 : 0,
      content: index > 28 ? 1 : 0
    };
  });

  return {
    stats: {
      tasksCompleted: business ? 1 : 0,
      todayCompleted: 0,
      contentGenerated: 0,
      xp: 0,
      level: 1,
      growthScore: business ? 18 : 0,
      stage,
      streak: { current: 1, longest: 1 },
      achievements: []
    },
    activity
  };
}

export function simpleRecommendations(session: AuthTokenPayload) {
  const mode = session.business?.aiMode ?? "START_MODE";
  return {
    recommendations: [
      `recommendation.mode.${mode}`,
      "recommendation.firstContact",
      "recommendation.firstPost"
    ]
  };
}

export function simpleProgress(session: AuthTokenPayload) {
  const user = simpleUserFromSession(session);
  return { progress: user.progress, achievements: [] };
}

export function simpleAssistantReply(message: string, mode?: string) {
  const topic = message.trim() || "бизнес";
  const selectedMode = mode ?? "START_MODE";

  return [
    `AIKA (${selectedMode})`,
    "",
    `Разберём запрос: ${topic}`,
    "",
    "1. Сформулируй один конкретный результат на сегодня.",
    "2. Напиши 10 потенциальным клиентам в Instagram или WhatsApp.",
    "3. Опубликуй короткий пост: проблема клиента, твоё решение, призыв написать в личку.",
    "4. Вечером отметь, сколько людей ответили, и улучши оффер."
  ].join("\n");
}

export function simpleGeneratedContent(type: string, platform: string, prompt: string) {
  const result = [
    `Платформа: ${platform}`,
    `Формат: ${type}`,
    "",
    `Заголовок: ${prompt}`,
    "",
    "Текст:",
    `Сегодня показываю решение для тех, кто хочет быстрее получить результат: ${prompt}.`,
    "Напишите в личку слово AIKA, и я помогу выбрать подходящий вариант.",
    "",
    "CTA: Напишите сейчас, чтобы получить консультацию."
  ].join("\n");

  return {
    id: `simple_content_${Date.now()}`,
    userId: "simple",
    type,
    platform,
    prompt,
    result,
    createdAt: new Date()
  };
}

function simpleBusiness(userId: string, business: SessionBusinessContext) {
  const now = new Date();
  return {
    id: "simple_business",
    userId,
    name: business.name ?? null,
    niche: business.niche ?? null,
    description: business.description ?? null,
    stage: business.stage ?? "START",
    isOnline: business.isOnline ?? true,
    budget: business.budget ?? null,
    targetAudience: business.targetAudience ?? null,
    channels: business.channels ?? ["instagram", "whatsapp"],
    firstSaleDone: business.firstSaleDone ?? false,
    monthlyRevenue: business.monthlyRevenue ?? null,
    goals: business.goals ?? [],
    aiMode: business.aiMode ?? "START_MODE",
    createdAt: now,
    updatedAt: now
  };
}

function asMode(mode?: string): AIMode {
  return mode === "GROWTH_MODE" ||
    mode === "SCALE_MODE" ||
    mode === "CONTENT_MODE" ||
    mode === "FIRST_MONEY_MODE"
    ? mode
    : "START_MODE";
}

function nameFromEmail(email: string) {
  return email.split("@")[0] || "AIKA user";
}
