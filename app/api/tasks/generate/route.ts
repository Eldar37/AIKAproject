import { NextRequest } from "next/server";
import { createDailyTasksForUser } from "@/lib/business/tasks";
import { requireUserId } from "@/lib/auth/middleware";
import { handleRouteError, jsonResponse } from "@/lib/utils/http";
import { taskGenerateSchema } from "@/lib/utils/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const payload = taskGenerateSchema.parse(await request.json().catch(() => ({})));
    const tasks = await createDailyTasksForUser(userId, payload.mode, payload.force ?? true);
    return jsonResponse({ tasks });
  } catch (error) {
    return handleRouteError(error);
  }
}
