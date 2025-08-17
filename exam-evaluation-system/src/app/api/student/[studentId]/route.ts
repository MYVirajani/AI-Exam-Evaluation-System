// app/api/student/[studentId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  const { studentId } = params;

  try {
    const student = await prisma.student.findUnique({
      where: {
        user_id: studentId,
      },
      select: {
        registration_number: true,
        user_id: true,
        education_institute: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500 }
    );
  }
}