import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUserId } from "@/lib/auth/middleware";
import { createDailyTasksForUser } from "@/lib/business/tasks";
import { todayRange } from "@/lib/business/gamification";
import { getCurrentSession } from "@/lib/auth/middleware";
import { isSimpleMode } from "@/lib/config/runtime";
import { simpleTasks } from "@/lib/simple-mode/data";
import { handleRouteError, jsonResponse } from "@/lib/utils/http";
import { taskCreateSchema } from "@/lib/utils/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (isSimpleMode()) {
      const session = await getCurrentSession();
      return jsonResponse({ tasks: simpleTasks(session?.business?.aiMode), mode: "simple" });
    }

    const userId = await requireUserId();
    const { start, end } = todayRange();
    let tasks = await prisma.task.findMany({
      where: { userId, dueDate: { gte: start, lt: end } },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }]
    });

    if (tasks.length === 0) {
      tasks = await createDailyTasksForUser(userId);
    }

    return jsonResponse({ tasks });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (isSimpleMode()) {
      const payload = taskCreateSchema.parse(await request.json());
      return jsonResponse({
        task: {
          id: `simple_custom_${Date.now()}`,
          title: payload.title,
          description: payload.description,
          type: payload.type,
          status: "pending",
          priority: payload.priority,
          xpReward: payload.xpReward,
          dueDate: new Date(),
          createdAt: new Date(),
          completedAt: null
        },
        mode: "simple"
      }, { status: 201 });
    }

    const userId = await requireUserId();
    const payload = taskCreateSchema.parse(await request.json());
    const task = await prisma.task.create({
      data: {
        userId,
        title: payload.title,
        description: payload.description,
        type: payload.type,
        priority: payload.priority,
        xpReward: payload.xpReward,
        dueDate: new Date()
      }
    });

    return jsonResponse({ task }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
