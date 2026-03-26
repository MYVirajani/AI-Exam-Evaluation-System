// src/app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';


export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        educator: true,
        student: true,
      },
      orderBy: { created_on: "desc" },
    });
    return NextResponse.json({ users });
  } catch (err) {
    console.error("Error fetching users:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
