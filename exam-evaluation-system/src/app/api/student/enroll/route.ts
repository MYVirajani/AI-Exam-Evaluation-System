import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { user_id, module_code, enrollment_key } = await request.json();

    if (!user_id || !module_code || !enrollment_key) {
      return NextResponse.json(
        { error: "user_id, module_code, and enrollment_key are required" },
        { status: 400 }
      );
    }

    // 🔍 Get student by user_id to retrieve registration_number
    const student = await prisma.student.findUnique({
      where: { user_id },
    });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const registration_number = student.registration_number;

    // ✅ Validate module by code and enrollment key
    const foundModule = await prisma.module.findFirst({
      where: {
        module_code,
        enrollment_key,
      },
    });
    if (!foundModule) {
      return NextResponse.json(
        { error: "Invalid module code or enrollment key" },
        { status: 401 }
      );
    }

    // 🔄 Check for existing enrollment
    const existing = await prisma.enrollment.findFirst({
      where: {
        student_id: registration_number,
        module_id: foundModule.module_id,
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Already enrolled in this module" },
        { status: 409 }
      );
    }

    // 🎉 Enroll student
    const enrollment = await prisma.enrollment.create({
      data: {
        enrollement_id: uuidv4(),
        student_id: registration_number,
        module_id: foundModule.module_id,
      },
    });

    return NextResponse.json({ success: true, enrollment });
  } catch (error) {
    console.error("Enrollment API error:", error);
    return NextResponse.json({ error: "Failed to enroll student" }, { status: 500 });
  }
}
