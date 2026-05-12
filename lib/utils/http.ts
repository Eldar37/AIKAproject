import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonResponse<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function errorResponse(message: string, status = 400, details?: unknown, code?: string) {
  return NextResponse.json(
    {
      error: message,
      ...(code ? { code } : {}),
      ...(details === undefined ? {} : { details })
    },
    { status }
  );
}

export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return errorResponse("Invalid request payload", 422, error.flatten(), "INVALID_PAYLOAD");
  }

  if (error instanceof AuthError) {
    return errorResponse(error.message, error.status);
  }

  const message = error instanceof Error ? error.message : "";
  const code =
    error && typeof error === "object" && "code" in error && typeof error.code === "string"
      ? error.code
      : undefined;

  if (message.includes("DATABASE_URL must be set") || message.includes("Environment variable not found: DATABASE_URL")) {
    console.error(error);
    return errorResponse("Server database is not configured.", 503, undefined, "DATABASE_URL_MISSING");
  }

  if (message.includes("JWT_SECRET must be set")) {
    console.error(error);
    return errorResponse("Server authentication is not configured.", 503, undefined, "JWT_SECRET_MISSING");
  }

  if (code === "P1001" || message.includes("Can't reach database server")) {
    console.error(error);
    return errorResponse("Database is unavailable.", 503, undefined, "DATABASE_UNAVAILABLE");
  }

  if (code === "P2021" || code === "P2022") {
    console.error(error);
    return errorResponse("Database schema is not deployed.", 503, undefined, "DATABASE_SCHEMA_MISSING");
  }

  console.error(error);
  return errorResponse("Internal server error", 500, undefined, "INTERNAL_SERVER_ERROR");
}

export class AuthError extends Error {
  status: number;

  constructor(message = "Unauthorized", status = 401) {
    super(message);
    this.status = status;
  }
}
