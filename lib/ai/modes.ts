import type { AIMode, BusinessStage } from "@/types/aika";

export type ModeTask = {
  title: string;
  description: string;
  type: "daily" | "milestone" | "challenge";
  priority: "low" | "medium" | "high";
  xpReward: number;
};

type ModeDefinition = {
  label: string;
  stage: BusinessStage;
  quickPrompts: string[];
  tasks: ModeTask[];
  recommendation: string;
};

export const AI_MODES: Record<AIMode, ModeDefinition> = {
  START_MODE: {
    label: "START",
    stage: "START",
    quickPrompts: ["chat.quick.start1", "chat.quick.start2", "chat.quick.start3"],
    tasks: [
      {
        title: "task.template.start.offer.title",
        description: "task.template.start.offer.description",
        type: "daily",
        priority: "high",
        xpReward: 20
      },
      {
        title: "task.template.start.contacts.title",
        description: "task.template.start.contacts.description",
        type: "daily",
        priority: "high",
        xpReward: 20
      },
      {
        title: "task.template.start.questions.title",
        description: "task.template.start.questions.description",
        type: "daily",
        priority: "medium",
        xpReward: 15
      }
    ],
    recommendation: "recommendation.mode.START_MODE"
  },
  GROWTH_MODE: {
    label: "GROWTH",
    stage: "GROWTH",
    quickPrompts: ["chat.quick.growth1", "chat.quick.growth2", "chat.quick.growth3"],
    tasks: [
      {
        title: "task.template.growth.reviews.title",
        description: "task.template.growth.reviews.description",
        type: "daily",
        priority: "high",
        xpReward: 25
      },
      {
        title: "task.template.growth.story.title",
        description: "task.template.growth.story.description",
        type: "daily",
        priority: "medium",
        xpReward: 20
      },
      {
        title: "task.template.growth.channel.title",
        description: "task.template.growth.channel.description",
        type: "daily",
        priority: "medium",
        xpReward: 15
      }
    ],
    recommendation: "recommendation.mode.GROWTH_MODE"
  },
  SCALE_MODE: {
    label: "SCALE",
    stage: "SCALE",
    quickPrompts: ["chat.quick.scale1", "chat.quick.scale2", "chat.quick.scale3"],
    tasks: [
      {
        title: "task.template.scale.margin.title",
        description: "task.template.scale.margin.description",
        type: "daily",
        priority: "high",
        xpReward: 30
      },
      {
        title: "task.template.scale.process.title",
        description: "task.template.scale.process.description",
        type: "milestone",
        priority: "high",
        xpReward: 30
      },
      {
        title: "task.template.scale.partners.title",
        description: "task.template.scale.partners.description",
        type: "daily",
        priority: "medium",
        xpReward: 20
      }
    ],
    recommendation: "recommendation.mode.SCALE_MODE"
  },
  CONTENT_MODE: {
    label: "CONTENT",
    stage: "GROWTH",
    quickPrompts: ["chat.quick.content1", "chat.quick.content2", "chat.quick.content3"],
    tasks: [
      {
        title: "task.template.content.hooks.title",
        description: "task.template.content.hooks.description",
        type: "daily",
        priority: "high",
        xpReward: 20
      },
      {
        title: "task.template.content.short.title",
        description: "task.template.content.short.description",
        type: "daily",
        priority: "medium",
        xpReward: 20
      },
      {
        title: "task.template.content.replies.title",
        description: "task.template.content.replies.description",
        type: "daily",
        priority: "medium",
        xpReward: 15
      }
    ],
    recommendation: "recommendation.mode.CONTENT_MODE"
  },
  FIRST_MONEY_MODE: {
    label: "FIRST MONEY",
    stage: "START",
    quickPrompts: ["chat.quick.money1", "chat.quick.money2", "chat.quick.money3"],
    tasks: [
      {
        title: "task.template.money.offer.title",
        description: "task.template.money.offer.description",
        type: "daily",
        priority: "high",
        xpReward: 25
      },
      {
        title: "task.template.money.contacts.title",
        description: "task.template.money.contacts.description",
        type: "challenge",
        priority: "high",
        xpReward: 35
      },
      {
        title: "task.template.money.close.title",
        description: "task.template.money.close.description",
        type: "daily",
        priority: "high",
        xpReward: 30
      }
    ],
    recommendation: "recommendation.mode.FIRST_MONEY_MODE"
  }
};

export const AI_MODE_VALUES = Object.keys(AI_MODES) as AIMode[];

export function getModeDefinition(mode?: string | null) {
  return AI_MODES[(mode as AIMode) || "START_MODE"] ?? AI_MODES.START_MODE;
}

export function determineModeFromOnboarding(input: {
  hasBusiness: boolean;
  mainGoal: string;
  monthlyRevenue?: number | null;
}) {
  if (input.mainGoal === "first_sale") return "FIRST_MONEY_MODE" as AIMode;
  if ((input.monthlyRevenue ?? 0) >= 150000) return "SCALE_MODE" as AIMode;
  if (input.hasBusiness) return "GROWTH_MODE" as AIMode;
  return "START_MODE" as AIMode;
}

export function tasksForMode(mode?: string | null) {
  return getModeDefinition(mode).tasks;
}

export function recommendationForMode(mode?: string | null) {
  return getModeDefinition(mode).recommendation;
}
