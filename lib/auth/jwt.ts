import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

export const AUTH_COOKIE = "aika_session";

export type SessionBusinessContext = {
  name?: string | null;
  niche?: string | null;
  description?: string | null;
  stage?: string;
  isOnline?: boolean;
  budget?: string | null;
  targetAudience?: string | null;
  channels?: string[];
  firstSaleDone?: boolean;
  monthlyRevenue?: number | null;
  goals?: string[];
  aiMode?: string;
};

export type AuthTokenPayload = {
  userId: string;
  email: string;
  name?: string;
  language?: string;
  experienceLevel?: string;
  local?: boolean;
  business?: SessionBusinessContext;
};

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    if (!process.env.DATABASE_URL) {
      return new TextEncoder().encode("aika-simple-mode-local-session-secret");
    }
    throw new Error("JWT_SECRET must be set to a strong value");
  }
  return new TextEncoder().encode(secret);
}

export async function signAuthToken(payload: AuthTokenPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyAuthToken(token?: string | null): Promise<AuthTokenPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.userId !== "string" || typeof payload.email !== "string") {
      return null;
    }
    return {
      userId: payload.userId,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : undefined,
      language: typeof payload.language === "string" ? payload.language : undefined,
      experienceLevel: typeof payload.experienceLevel === "string" ? payload.experienceLevel : undefined,
      local: payload.local === true,
      business: readBusinessContext(payload.business)
    };
  } catch {
    return null;
  }
}

function readBusinessContext(value: unknown): SessionBusinessContext | undefined {
  if (!value || typeof value !== "object") return undefined;

  const source = value as Record<string, unknown>;
  return {
    name: readNullableString(source.name),
    niche: readNullableString(source.niche),
    description: readNullableString(source.description),
    stage: typeof source.stage === "string" ? source.stage : undefined,
    isOnline: typeof source.isOnline === "boolean" ? source.isOnline : undefined,
    budget: readNullableString(source.budget),
    targetAudience: readNullableString(source.targetAudience),
    channels: Array.isArray(source.channels) ? source.channels.filter((item): item is string => typeof item === "string") : undefined,
    firstSaleDone: typeof source.firstSaleDone === "boolean" ? source.firstSaleDone : undefined,
    monthlyRevenue: typeof source.monthlyRevenue === "number" ? source.monthlyRevenue : source.monthlyRevenue === null ? null : undefined,
    goals: Array.isArray(source.goals) ? source.goals.filter((item): item is string => typeof item === "string") : undefined,
    aiMode: typeof source.aiMode === "string" ? source.aiMode : undefined
  };
}

function readNullableString(value: unknown) {
  return typeof value === "string" ? value : value === null ? null : undefined;
}
