import { NextRequest } from "next/server";
import { getSystemPrompt } from "@/lib/ai/prompts";
import { buildBusinessMemory, formatContextualUserMessage } from "@/lib/ai/memory";
import { callAI } from "@/lib/ai/provider";
import { publicAIErrorMessage } from "@/lib/ai/errors";
import { prisma } from "@/lib/db/prisma";
import { requireUserId } from "@/lib/auth/middleware";
import { checkRateLimit, rateLimitKey } from "@/lib/utils/rate-limit";
import { contentGenerateSchema } from "@/lib/utils/validators";
import { errorResponse, handleRouteError, jsonResponse } from "@/lib/utils/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const limit = checkRateLimit(rateLimitKey("content", userId, request.headers.get("x-forwarded-for")), 10, 60_000);
    if (!limit.allowed) {
      return errorResponse("Rate limit exceeded. Try again in a minute.", 429);
    }

    const payload = contentGenerateSchema.parse(await request.json());
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, business: true, progress: true, streaks: true }
    });

    if (!user) return errorResponse("User not found", 404);

    try {
      const memory = buildBusinessMemory(user);
      const requestText = [
        `Content type: ${payload.type}`,
        `Platform: ${payload.platform}`,
        `Topic or product: ${payload.prompt}`,
        "Return ready-to-use content in Russian. Include a clear CTA and adapt it to the selected platform."
      ].join("\n");

      const aiResponse = await callAI({
        systemPrompt: getSystemPrompt("CONTENT_MODE"),
        userMessage: formatContextualUserMessage(memory, requestText),
        maxTokens: payload.type === "plan" ? 900 : 550,
        temperature: 0.72
      });

      const item = await prisma.contentHistory.create({
        data: {
          userId,
          type: payload.type,
          platform: payload.platform,
          prompt: payload.prompt,
          result: aiResponse.text
        }
      });

      return jsonResponse({ content: item, model: aiResponse.model });
    } catch (error) {
      console.error(error);
      return errorResponse(publicAIErrorMessage(error), 503);
    }
  } catch (error) {
    return handleRouteError(error);
  }
}
