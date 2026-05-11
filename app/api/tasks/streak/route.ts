import { prisma } from "@/lib/db/prisma";
import { requireUserId } from "@/lib/auth/middleware";
import { handleRouteError, jsonResponse } from "@/lib/utils/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
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
