import { z } from "zod";
import { AI_MODE_VALUES } from "@/lib/ai/modes";

export const registerSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(80)
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128)
});

export const onboardingSchema = z.object({
  hasBusiness: z.boolean(),
  businessName: z.string().max(100).optional().nullable(),
  niche: z.string().min(2).max(80),
  description: z.string().max(500).optional().nullable(),
  isOnline: z.boolean(),
  budget: z.enum(["low", "medium", "high"]),
  mainGoal: z.enum(["first_sale", "grow_audience", "increase_revenue", "build_brand"]),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  targetAudience: z.string().max(220).optional().nullable(),
  channels: z.array(z.enum(["instagram", "tiktok", "whatsapp", "telegram"])).min(1).max(4),
  monthlyRevenue: z.number().min(0).optional().nullable()
});

export const chatSchema = z.object({
  message: z.string().min(1).max(3000),
  mode: z.enum(AI_MODE_VALUES).optional(),
  conversationId: z.string().cuid().optional()
});

export const taskGenerateSchema = z.object({
  mode: z.enum(AI_MODE_VALUES).optional(),
  force: z.boolean().optional()
});

export const taskCreateSchema = z.object({
  title: z.string().min(2).max(140),
  description: z.string().max(500).optional().nullable(),
  type: z.enum(["daily", "milestone", "challenge"]).default("daily"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  xpReward: z.number().int().min(5).max(100).default(15)
});

export const taskUpdateSchema = z.object({
  status: z.enum(["completed", "skipped"]),
  firstSaleDone: z.boolean().optional()
});

export const userPatchSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  timezone: z.string().min(2).max(80).optional(),
  language: z.enum(["ru", "ky", "en"]).optional(),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  businessName: z.string().max(100).nullable().optional(),
  niche: z.string().max(80).nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  stage: z.enum(["START", "GROWTH", "SCALE"]).optional(),
  budget: z.enum(["low", "medium", "high"]).nullable().optional(),
  targetAudience: z.string().max(220).nullable().optional(),
  channels: z.array(z.enum(["instagram", "tiktok", "whatsapp", "telegram"])).optional(),
  firstSaleDone: z.boolean().optional(),
  monthlyRevenue: z.number().min(0).nullable().optional(),
  goals: z.array(z.string().max(80)).optional(),
  aiMode: z.enum(AI_MODE_VALUES).optional()
});

export const progressUpdateSchema = z.object({
  firstSaleDone: z.boolean().optional(),
  monthlyRevenue: z.number().min(0).optional(),
  milestone: z.string().max(80).optional()
});

export const contentGenerateSchema = z.object({
  type: z.enum(["instagram", "story", "ad", "product", "plan"]),
  platform: z.enum(["Instagram", "TikTok", "Telegram", "WhatsApp"]),
  prompt: z.string().min(2).max(1200)
});
