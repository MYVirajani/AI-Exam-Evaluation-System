// src/app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const token = cookies().get("token")?.value;
  if (!token) {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }

  const decoded = verifyToken(token) as { id: string } | null;
  if (!decoded) {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { user_id: decoded.id },
    select: { first_name: true, last_name: true },
  });

  if (!user) {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }

  return NextResponse.json({
    loggedIn: true,
    user,
  });
}
