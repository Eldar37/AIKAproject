import { prisma } from "@/lib/db/prisma";
import { requireUserId } from "@/lib/auth/middleware";
import { isSimpleMode } from "@/lib/config/runtime";
import { handleRouteError, jsonResponse } from "@/lib/utils/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (isSimpleMode()) {
      return jsonResponse({ history: [], mode: "simple" });
    }

    const userId = await requireUserId();
    const history = await prisma.contentHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30
    });

    return jsonResponse({ history });
  } catch (error) {
    return handleRouteError(error);
  }
}
