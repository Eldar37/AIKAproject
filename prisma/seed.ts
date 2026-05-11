import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("AikaDemo2026!", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@aika.local" },
    update: { passwordHash },
    create: {
      email: "demo@aika.local",
      name: "AIKA Demo",
      passwordHash,
      profile: {
        create: {
          timezone: "Asia/Bishkek",
          language: "ru",
          experienceLevel: "beginner",
          xp: 120,
          level: 2
        }
      },
      business: {
        create: {
          name: "Instagram studio",
          niche: "beauty",
          description: "Небольшой онлайн-бизнес для услуг красоты в Бишкеке.",
          stage: "START",
          isOnline: true,
          budget: "low",
          targetAudience: "Девушки 18-35 в Бишкеке и Оше",
          channels: ["instagram", "whatsapp", "telegram"],
          goals: ["first_sale", "grow_audience"],
          aiMode: "START_MODE"
        }
      },
      progress: {
        create: {
          currentStage: "START",
          stageProgress: 22,
          totalScore: 31,
          tasksCompleted: 4,
          daysActive: 3,
          milestones: ["idea_validation"]
        }
      },
      streaks: {
        create: {
          current: 3,
          longest: 3
        }
      }
    }
  });

  await prisma.task.createMany({
    data: [
      {
        userId: user.id,
        title: "Опиши один оффер для Instagram",
        description: "Сформулируй услугу, цену и результат для клиента в одном коротком сообщении.",
        type: "daily",
        priority: "high",
        xpReward: 20,
        dueDate: new Date()
      },
      {
        userId: user.id,
        title: "Напиши 10 потенциальным клиентам",
        description: "Используй WhatsApp или Instagram Direct, без массовой рассылки.",
        type: "daily",
        priority: "high",
        xpReward: 25,
        dueDate: new Date()
      },
      {
        userId: user.id,
        title: "Собери 3 вопроса от аудитории",
        description: "Опубликуй сторис с вопросом и сохрани ответы для контента.",
        type: "daily",
        priority: "medium",
        xpReward: 15,
        dueDate: new Date()
      }
    ],
    skipDuplicates: true
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
