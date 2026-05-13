import { prisma } from "@/lib/db/prisma";
import { requireUserId } from "@/lib/auth/middleware";
import { isSimpleMode } from "@/lib/config/runtime";
import { handleRouteError, jsonResponse } from "@/lib/utils/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (isSimpleMode()) {
      return jsonResponse({
        streak: { current: 1, longest: 1, lastActive: new Date(), updatedAt: new Date() },
        mode: "simple"
      });
    }

    const userId = await requireUserId();
    const streak = await prisma.streak.upsert({
      where: { userId },
      update: {},
      create: { userId }
    });

    return jsonResponse({ streak });
  } catch (error) {
    return handleRouteError(error);
  }
}
