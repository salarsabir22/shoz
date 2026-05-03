import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

function jwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) {
    throw new Error("JWT_SECRET must be set and at least 32 characters");
  }
  return s;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; role: string; email: string }): string {
  return jwt.sign(payload, jwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string; role: string; email: string } {
  return jwt.verify(token, jwtSecret()) as { userId: string; role: string; email: string };
}

export function setAuthCookie(token: string): void {
  cookies().set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export function clearAuthCookie(): void {
  cookies().delete("auth_token");
}

export function getAuthUser(): { userId: string; role: string; email: string } | null {
  try {
    const token = cookies().get("auth_token")?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}
