import { NextRequest } from "next/server";
import { POST } from "@/app/api/auth/register/route";
import { prisma } from "@/lib/db/prisma";

jest.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn()
    }
  }
}));

jest.mock("@/lib/auth/password", () => ({
  hashPassword: jest.fn(async () => "hashed")
}));

jest.mock("@/lib/auth/jwt", () => ({
  AUTH_COOKIE: "aika_session",
  signAuthToken: jest.fn(async () => "token")
}));

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DATABASE_URL = "postgresql://postgres:password@localhost:5432/aika_test";
    process.env.JWT_SECRET = "test-secret-at-least-16-characters";
  });

  it("creates a user and sets a session cookie", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: "user_1",
      email: "test@aika.local",
      name: "Test User",
      profile: { xp: 0, level: 1 }
    });

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@aika.local",
        password: "password123",
        name: "Test User"
      })
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.user.email).toBe("test@aika.local");
    expect(response.headers.get("set-cookie")).toContain("aika_session");
    expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.any(Object) }));
  });

  it("rejects duplicate emails", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "existing" });

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@aika.local",
        password: "password123",
        name: "Test User"
      })
    });

    const response = await POST(request);

    expect(response.status).toBe(409);
  });

  it("returns a clear deployment error when DATABASE_URL is missing", async () => {
    delete process.env.DATABASE_URL;

    const request = new NextRequest("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@aika.local",
        password: "password123",
        name: "Test User"
      })
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.code).toBe("DATABASE_URL_MISSING");
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });
});
