import { prisma } from "@/lib/db/prisma";
import { getCurrentSession, requireUserId } from "@/lib/auth/middleware";
import { isSimpleMode } from "@/lib/config/runtime";
import { simpleProgress } from "@/lib/simple-mode/data";
import { handleRouteError, jsonResponse } from "@/lib/utils/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (isSimpleMode()) {
      const session = await getCurrentSession();
      return jsonResponse(session ? { ...simpleProgress(session), mode: "simple" } : { progress: null, achievements: [] });
    }

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
