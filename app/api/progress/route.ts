import { prisma } from "@/lib/db/prisma";
import { requireUserId } from "@/lib/auth/middleware";
import { handleRouteError, jsonResponse } from "@/lib/utils/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await requireUserId();
    const progress = await prisma.progress.upsert({
      where: { userId },
      update: {},
      create: { userId, milestones: [] }
    });
    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: "desc" }
    });

    return jsonResponse({ progress, achievements });
  } catch (error) {
    return handleRouteError(error);
  }
}
