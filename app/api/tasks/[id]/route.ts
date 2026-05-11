import { NextRequest } from "next/server";
import { requireUserId } from "@/lib/auth/middleware";
import { completeTaskForUser } from "@/lib/business/tasks";
import { errorResponse, handleRouteError, jsonResponse } from "@/lib/utils/http";
import { taskUpdateSchema } from "@/lib/utils/validators";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const payload = taskUpdateSchema.parse(await request.json());

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
