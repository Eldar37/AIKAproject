import { NextRequest } from "next/server";
import { requireUserId } from "@/lib/auth/middleware";
import { completeTaskForUser } from "@/lib/business/tasks";
import { isSimpleMode } from "@/lib/config/runtime";
import { errorResponse, handleRouteError, jsonResponse } from "@/lib/utils/http";
import { taskUpdateSchema } from "@/lib/utils/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const payload = taskUpdateSchema.parse(await request.json());

    if (isSimpleMode()) {
      return jsonResponse({
        task: { id, status: payload.status, completedAt: payload.status === "completed" ? new Date() : null },
        xp: payload.status === "completed" ? 15 : 0,
        level: { level: 1, currentLevelXp: 0, nextLevelXp: 100, progress: 15 },
        streak: { current: payload.status === "completed" ? 1 : 0, longest: 1, lastActive: new Date(), daysActiveIncrement: 1 },
        stage: "START",
        suggestion: null,
        mode: "simple"
      });
    }

    const userId = await requireUserId();

    try {
      const result = await completeTaskForUser(userId, id, payload.status, payload.firstSaleDone);
      return jsonResponse(result);
    } catch (error) {
      if (error instanceof Error && error.message === "Task not found") {
        return errorResponse("Task not found", 404);
      }
      throw error;
    }
  } catch (error) {
    return handleRouteError(error);
  }
}
