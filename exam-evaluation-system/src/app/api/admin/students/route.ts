// src/app/api/admin/students/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const students = await prisma.user.findMany({
      where: { role: "student" },
      include: {
        student: {
          select: {
            registration_number: true,
            education_institute: true,
            enrollments: {
              select: { enrollment_id: true }, 
            },
          },
        },
      },
      orderBy: {
        student: {
          registration_number: "asc", // order by reg. no.
        },
      },
    });

    // Map to include enrollment count
    const formattedStudents = students.map((student) => ({
      ...student,
      registration_number: student.student?.registration_number ?? null,
      education_institute: student.student?.education_institute ?? null,
      enrollment_count: student.student?.enrollments.length ?? 0,
    }));

    return NextResponse.json({ students: formattedStudents });
  } catch (err) {
    console.error("Error fetching students:", err);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
