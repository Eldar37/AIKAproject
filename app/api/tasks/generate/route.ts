import { NextRequest } from "next/server";
import { createDailyTasksForUser } from "@/lib/business/tasks";
import { getCurrentSession, requireUserId } from "@/lib/auth/middleware";
import { isSimpleMode } from "@/lib/config/runtime";
import { simpleTasks } from "@/lib/simple-mode/data";
import { handleRouteError, jsonResponse } from "@/lib/utils/http";
import { taskGenerateSchema } from "@/lib/utils/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const payload = taskGenerateSchema.parse(await request.json().catch(() => ({})));

    if (isSimpleMode()) {
      const session = await getCurrentSession();
      return jsonResponse({ tasks: simpleTasks(payload.mode ?? session?.business?.aiMode), mode: "simple" });
    }

    const userId = await requireUserId();
    const tasks = await createDailyTasksForUser(userId, payload.mode, payload.force ?? true);
    return jsonResponse({ tasks });
  } catch (error) {
    return handleRouteError(error);
  }
}
