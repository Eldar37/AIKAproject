import { getDashboardSnapshot } from "@/lib/business/tasks";
import { getCurrentSession, requireUserId } from "@/lib/auth/middleware";
import { isSimpleMode } from "@/lib/config/runtime";
import { simpleRecommendations } from "@/lib/simple-mode/data";
import { errorResponse, handleRouteError, jsonResponse } from "@/lib/utils/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (isSimpleMode()) {
      const session = await getCurrentSession();
      return jsonResponse(simpleRecommendations(session ?? {
        userId: "simple_guest",
        email: "guest@aika.local",
        local: true
      }));
    }

    const userId = await requireUserId();
    const snapshot = await getDashboardSnapshot(userId);
    if (!snapshot) return errorResponse("User not found", 404);

    const business = snapshot.user.business;
    const mode = business?.aiMode ?? "START_MODE";
    const recommendations = [
      snapshot.insight,
      `recommendation.mode.${mode}`,
      business?.firstSaleDone ? "recommendation.firstSaleDone" : "recommendation.firstContact",
      snapshot.contentCount === 0 ? "recommendation.firstPost" : "recommendation.reuseContent"
    ];

    return jsonResponse({ recommendations: Array.from(new Set(recommendations)) });
  } catch (error) {
    return handleRouteError(error);
  }
}
