export function assertDatabaseConfig() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
  }
}

export function assertAuthConfig() {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 16) {
    throw new Error("JWT_SECRET must be set to a strong value");
  }
}
