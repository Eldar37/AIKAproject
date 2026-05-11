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
    quickPrompts: [
      "Помоги проверить мою идею за 1 день",
      "Сформулируй оффер для Instagram",
      "Какие первые 10 клиентов мне написать?"
    ],
    tasks: [
      {
        title: "Сформулируй один понятный оффер",
        description: "Опиши продукт, цену, результат и кому он нужен в 3 предложениях.",
        type: "daily",
        priority: "high",
        xpReward: 20
      },
      {
        title: "Найди 15 людей из целевой аудитории",
        description: "Используй Instagram, знакомых, Telegram-чаты или WhatsApp-контакты.",
        type: "daily",
        priority: "high",
        xpReward: 20
      },
      {
        title: "Задай 3 вопроса рынку",
        description: "Узнай боль, текущую альтернативу и готовность заплатить.",
        type: "daily",
        priority: "medium",
        xpReward: 15
      }
    ],
    recommendation: "Проверь спрос через разговоры, не через долгую подготовку."
  },
  GROWTH_MODE: {
    label: "GROWTH",
    stage: "GROWTH",
    quickPrompts: [
      "Как увеличить повторные продажи?",
      "Составь контент-план на неделю",
      "Как собрать отзывы и доверие?"
    ],
    tasks: [
      {
        title: "Собери 3 отзыва или истории клиентов",
        description: "Попроси клиентов описать результат и разрешение использовать отзыв.",
        type: "daily",
        priority: "high",
        xpReward: 25
      },
      {
        title: "Опубликуй продающую сторис-серию",
        description: "Проблема, процесс, результат, призыв написать в WhatsApp или Direct.",
        type: "daily",
        priority: "medium",
        xpReward: 20
      },
      {
        title: "Проверь один канал продаж",
        description: "Сравни Instagram, Telegram и WhatsApp по заявкам за последние 7 дней.",
        type: "daily",
        priority: "medium",
        xpReward: 15
      }
    ],
    recommendation: "Сделай продажи повторяемыми: оффер, контент, заявки, follow-up."
  },
  SCALE_MODE: {
    label: "SCALE",
    stage: "SCALE",
    quickPrompts: [
      "Какие метрики роста отслеживать?",
      "Как делегировать продажи?",
      "Где искать партнерства в регионе?"
    ],
    tasks: [
      {
        title: "Посчитай прибыль по ключевому продукту",
        description: "Выручка, переменные затраты, время команды и маржа.",
        type: "daily",
        priority: "high",
        xpReward: 30
      },
      {
        title: "Опиши один процесс для делегирования",
        description: "Выбери продажи, контент или поддержку и запиши чеклист выполнения.",
        type: "milestone",
        priority: "high",
        xpReward: 30
      },
      {
        title: "Найди 2 партнерских канала",
        description: "Подумай о блогерах, локальных бизнесах, Telegram-каналах или маркетплейсах.",
        type: "daily",
        priority: "medium",
        xpReward: 20
      }
    ],
    recommendation: "Рост должен усиливать маржу и систему, а не только нагрузку."
  },
  CONTENT_MODE: {
    label: "CONTENT",
    stage: "GROWTH",
    quickPrompts: [
      "Сделай пост для Instagram",
      "Напиши 5 хуков для Reels",
      "Создай Telegram-пост с продажей"
    ],
    tasks: [
      {
        title: "Создай 3 контент-хука",
        description: "Один про боль, один про результат, один про возражение клиента.",
        type: "daily",
        priority: "high",
        xpReward: 20
      },
      {
        title: "Опубликуй один короткий формат",
        description: "Reels, TikTok, сторис или Telegram-пост с явным CTA.",
        type: "daily",
        priority: "medium",
        xpReward: 20
      },
      {
        title: "Ответь на входящие реакции",
        description: "Напиши всем, кто поставил реакцию, сохрани вопросы для новых постов.",
        type: "daily",
        priority: "medium",
        xpReward: 15
      }
    ],
    recommendation: "Контент должен вести к диалогу, а диалог к продаже."
  },
  FIRST_MONEY_MODE: {
    label: "FIRST MONEY",
    stage: "START",
    quickPrompts: [
      "Составь план первого дохода на 7 дней",
      "Напиши скрипт для первых сообщений",
      "Как быстро проверить цену?"
    ],
    tasks: [
      {
        title: "Выбери оффер на 7 дней",
        description: "Один продукт, один сегмент, одна цена и один понятный результат.",
        type: "daily",
        priority: "high",
        xpReward: 25
      },
      {
        title: "Напиши 20 теплым контактам",
        description: "Без спама: персонально, коротко, с вопросом о потребности.",
        type: "challenge",
        priority: "high",
        xpReward: 35
      },
      {
        title: "Закрой один следующий шаг",
        description: "Звонок, предоплата, бронь, пробный заказ или встреча сегодня.",
        type: "daily",
        priority: "high",
        xpReward: 30
      }
    ],
    recommendation: "Сейчас важнее первый платеж, чем идеальная упаковка."
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
