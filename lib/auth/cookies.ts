export function shouldUseSecureCookies() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "";
  return appUrl.startsWith("https://");
}

export function authCookieOptions(maxAge = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    secure: shouldUseSecureCookies(),
    sameSite: "lax" as const,
    path: "/",
    maxAge
  };
}
