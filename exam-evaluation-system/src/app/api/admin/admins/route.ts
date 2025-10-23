// src/app/api/admin/admins/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      orderBy: {
        created_on: "desc",
      },
    });

    return NextResponse.json({ admins });
  } catch (err) {
    console.error("Error fetching admins:", err);
    return NextResponse.json(
      { error: "Failed to fetch admins" },
      { status: 500 }
    );
  }
}
