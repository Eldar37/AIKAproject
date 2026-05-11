import { prisma } from "@/lib/db/prisma";
import { requireUserId } from "@/lib/auth/middleware";
import { handleRouteError, jsonResponse } from "@/lib/utils/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await requireUserId();
    const conversations = await prisma.aIConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 30
        }
      }
    });

    return jsonResponse({ conversations });
  } catch (error) {
    return handleRouteError(error);
  }
}
