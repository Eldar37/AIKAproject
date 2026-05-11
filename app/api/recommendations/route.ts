import { recommendationForMode } from "@/lib/ai/modes";
import { getDashboardSnapshot } from "@/lib/business/tasks";
import { requireUserId } from "@/lib/auth/middleware";
import { errorResponse, handleRouteError, jsonResponse } from "@/lib/utils/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await requireUserId();
    const snapshot = await getDashboardSnapshot(userId);
    if (!snapshot) return errorResponse("User not found", 404);

    const business = snapshot.user.business;
    const mode = business?.aiMode ?? "START_MODE";
    const recommendations = [
      snapshot.insight,
      recommendationForMode(mode),
      business?.firstSaleDone
        ? "Закрепи первую продажу: попроси отзыв, повтори канал, предложи следующий продукт."
        : "Сегодня нужен один реальный контакт с клиентом: вопрос, оффер или follow-up.",
      snapshot.contentCount === 0
        ? "Создай первый пост: проблема клиента, обещанный результат, простой призыв написать."
        : "Переиспользуй лучший контент недели в сторис, Telegram и WhatsApp-статусе."
    ];

    return jsonResponse({ recommendations: Array.from(new Set(recommendations)) });
  } catch (error) {
    return handleRouteError(error);
  }
}
