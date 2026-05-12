import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("AikaStart2026!", 12);

  const user = await prisma.user.upsert({
    where: { email: "founder@aika.local" },
    update: { passwordHash },
    create: {
      email: "founder@aika.local",
      name: "AIKA Founder",
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
          description: "Small online beauty-services business in Bishkek.",
          stage: "START",
          isOnline: true,
          budget: "low",
          targetAudience: "Women 18-35 in Bishkek and Osh",
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
        title: "task.template.start.offer.title",
        description: "task.template.start.offer.description",
        type: "daily",
        priority: "high",
        xpReward: 20,
        dueDate: new Date()
      },
      {
        userId: user.id,
        title: "task.template.start.contacts.title",
        description: "task.template.start.contacts.description",
        type: "daily",
        priority: "high",
        xpReward: 25,
        dueDate: new Date()
      },
      {
        userId: user.id,
        title: "task.template.start.questions.title",
        description: "task.template.start.questions.description",
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
