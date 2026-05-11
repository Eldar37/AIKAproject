import { cookies } from "next/headers";
import { AuthError } from "@/lib/utils/http";
import { AUTH_COOKIE, verifyAuthToken } from "./jwt";

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  return verifyAuthToken(token);
}

export async function requireUserId() {
  const session = await getCurrentSession();
  if (!session) {
    throw new AuthError("Authentication required", 401);
  }
  return session.userId;
}
