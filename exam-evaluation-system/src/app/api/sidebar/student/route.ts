// src/app/api/sidebar/student/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId"); // student user_id

    if (!userId) {
      return NextResponse.json({ error: "Invalid student id" }, { status: 400 });
    }

    // 1. Find student by user_id to get registration_number
    const student = await prisma.student.findUnique({
      where: { user_id: userId },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // 2. Query enrollments using registration_number
    const enrollments = await prisma.enrollment.findMany({
      where: { registration_number: student.registration_number },
      include: {
        module: {
          include: { assessments: true },
        },
      },
    });

    return NextResponse.json({ enrollments });
  } catch (err) {
    console.error("Error fetching student sidebar data:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
