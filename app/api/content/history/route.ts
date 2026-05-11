import { prisma } from "@/lib/db/prisma";
import { requireUserId } from "@/lib/auth/middleware";
import { handleRouteError, jsonResponse } from "@/lib/utils/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
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
