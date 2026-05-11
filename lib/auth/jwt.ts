import { SignJWT } from "jose/jwt/sign";
import { jwtVerify } from "jose/jwt/verify";

export const AUTH_COOKIE = "aika_session";

export type AuthTokenPayload = {
  userId: string;
  email: string;
};

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
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
    return { userId: payload.userId, email: payload.email };
  } catch {
    return null;
  }
}
