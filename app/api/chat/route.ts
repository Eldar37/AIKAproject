import { NextRequest } from "next/server";
import { getSystemPrompt } from "@/lib/ai/prompts";
import { buildBusinessMemory, formatContextualUserMessage } from "@/lib/ai/memory";
import { callAI } from "@/lib/ai/provider";
import { publicAIErrorMessage } from "@/lib/ai/errors";
import { prisma } from "@/lib/db/prisma";
import { requireUserId } from "@/lib/auth/middleware";
import { errorResponse, handleRouteError, jsonResponse } from "@/lib/utils/http";
import { checkRateLimit, rateLimitKey } from "@/lib/utils/rate-limit";
import { chatSchema } from "@/lib/utils/validators";
import type { AIMode } from "@/types/aika";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const userId = await requireUserId();
    const limit = checkRateLimit(rateLimitKey("chat", userId, request.headers.get("x-forwarded-for")), 10, 60_000);
    if (!limit.allowed) {
      return errorResponse("Rate limit exceeded. Try again in a minute.", 429);
    }

    const payload = chatSchema.parse(await request.json());
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, business: true, progress: true, streaks: true }
    });

    if (!user) return errorResponse("User not found", 404);

    const mode = payload.mode ?? ((user.business?.aiMode as AIMode | undefined) || "START_MODE");
    const conversation = payload.conversationId
      ? await prisma.aIConversation.findFirst({ where: { id: payload.conversationId, userId } })
      : await prisma.aIConversation.create({ data: { userId, mode } });

    if (!conversation) return errorResponse("Conversation not found", 404);

    await prisma.aIMessage.create({
      data: { conversationId: conversation.id, role: "user", content: payload.message }
    });

    try {
      const memory = buildBusinessMemory(user);
      const aiResponse = await callAI({
        systemPrompt: getSystemPrompt(mode, user.profile?.language ?? "ru"),
        userMessage: formatContextualUserMessage(memory, payload.message),
        maxTokens: 700,
        temperature: 0.65
      });

      const assistantMessage = await prisma.aIMessage.create({
        data: { conversationId: conversation.id, role: "assistant", content: aiResponse.text }
      });

      await prisma.aIConversation.update({
        where: { id: conversation.id },
        data: { mode }
      });

      return jsonResponse({
        conversationId: conversation.id,
        message: assistantMessage,
        model: aiResponse.model
      });
    } catch (error) {
      console.error(error);
      return errorResponse(publicAIErrorMessage(error), 503);
    }
  } catch (error) {
    return handleRouteError(error);
  }
}
