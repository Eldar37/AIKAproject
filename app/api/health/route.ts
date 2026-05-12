import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HealthCheck = {
  ok: boolean;
  status: string;
};

function configured(value?: string) {
  return Boolean(value && value.trim().length > 0);
}

function envCheck() {
  const databaseUrl = configured(process.env.DATABASE_URL);
  const jwtSecret = Boolean(process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 16);
  const hfApiKey = configured(process.env.HF_API_KEY);

  return {
    databaseUrl: {
      ok: databaseUrl,
      status: databaseUrl ? "configured" : "missing"
    },
    jwtSecret: {
      ok: jwtSecret,
      status: jwtSecret ? "configured" : "missing_or_too_short"
    },
    hfApiKey: {
      ok: hfApiKey,
      status: hfApiKey ? "configured" : "missing"
    }
  };
}

async function databaseCheck(): Promise<HealthCheck> {
  if (!configured(process.env.DATABASE_URL)) {
    return { ok: false, status: "DATABASE_URL_MISSING" };
  }

  try {
    const { prisma } = await import("@/lib/db/prisma");
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, status: "connected" };
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error && typeof error.code === "string"
        ? error.code
        : "UNKNOWN";

    return { ok: false, status: code };
  }
}

export async function GET() {
  const env = envCheck();
  const database = await databaseCheck();
  const ok = env.databaseUrl.ok && env.jwtSecret.ok && database.ok;

  return NextResponse.json(
    {
      ok,
      app: "AIKA",
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
      environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
      checks: {
        env,
        database
      }
    },
    { status: ok ? 200 : 503 }
  );
}
