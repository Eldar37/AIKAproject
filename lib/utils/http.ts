import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonResponse<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function errorResponse(message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof ZodError) {
    return errorResponse("Invalid request payload", 422, error.flatten());
  }

  if (error instanceof AuthError) {
    return errorResponse(error.message, error.status);
  }

  console.error(error);
  return errorResponse("Internal server error", 500);
}

export class AuthError extends Error {
  status: number;

  constructor(message = "Unauthorized", status = 401) {
    super(message);
    this.status = status;
  }
}
