import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch total counts for each role
    const [studentsCount, educatorsCount, adminsCount] = await Promise.all([
      prisma.user.count({ where: { role: "student" } }),
      prisma.user.count({ where: { role: "educator" } }),
      prisma.user.count({ where: { role: "admin" } }),
    ]);

    return NextResponse.json({
      counts: {
        students: studentsCount,
        educators: educatorsCount,
        admins: adminsCount,
      },
    });
  } catch (err) {
    console.error("Error fetching user counts:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

