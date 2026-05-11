import type { Prisma } from "@prisma/client";

type UserWithBusiness = Prisma.UserGetPayload<{
  include: {
    profile: true;
    business: true;
    progress: true;
    streaks: true;
  };
}>;

export function buildBusinessMemory(user: UserWithBusiness) {
  const business = user.business;
  const profile = user.profile;
  const progress = user.progress;
  const streak = user.streaks;

  return [
    "Trusted business memory:",
    `Name: ${user.name}`,
    `Language: ${profile?.language ?? "ru"}`,
    `Experience: ${profile?.experienceLevel ?? "beginner"}`,
    `Business name: ${business?.name ?? "not set"}`,
    `Niche: ${business?.niche ?? "not set"}`,
    `Description: ${business?.description ?? "not set"}`,
    `Stage: ${business?.stage ?? "START"}`,
    `AI mode: ${business?.aiMode ?? "START_MODE"}`,
    `Online: ${business?.isOnline ?? true}`,
    `Budget: ${business?.budget ?? "not set"}`,
    `Audience: ${business?.targetAudience ?? "not set"}`,
    `Channels: ${business?.channels?.join(", ") || "not set"}`,
    `Goals: ${business?.goals?.join(", ") || "not set"}`,
    `First sale done: ${business?.firstSaleDone ? "yes" : "no"}`,
    `Monthly revenue: ${business?.monthlyRevenue ?? 0}`,
    `Progress: ${progress?.stageProgress ?? 0}%`,
    `Tasks completed: ${progress?.tasksCompleted ?? 0}`,
    `Current streak: ${streak?.current ?? 0}`
  ].join("\n");
}

export function formatContextualUserMessage(memory: string, userMessage: string) {
  return `${memory}\n\nUntrusted user message:\n${userMessage}`;
}
