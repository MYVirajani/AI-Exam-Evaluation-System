// src/lib/auth.ts
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "session";
const ONE_DAY = 60 * 60 * 24;

export type JwtPayload = {
  sub: string;          // user_id
  username: string;
  role: "admin" | "educator" | "student";
};

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET");
}

export function signSession(payload: JwtPayload, maxAgeSec = ONE_DAY) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: maxAgeSec });
}

export function verifySession(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function setSessionCookie(
  res: NextResponse,
  token: string,
  maxAgeSec: number
) {
  res.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,         // Prevent JS access (XSS protection)
    sameSite: "lax",        // Helps prevent CSRF on cross-site requests
    secure: process.env.NODE_ENV === "production" ? true : false, // HTTPS only in prod
    path: "/",              // Accessible everywhere
    maxAge: maxAgeSec,      // Expiry in seconds
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    maxAge: 0,
    path: "/",
  });
}

export function getSessionFromRequest(req: NextRequest): JwtPayload | null {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function getSessionFromHeaders(): JwtPayload | null {
  // Use in server components/routes (not in edge middleware)
  const c = cookies();
  const token = c.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}
