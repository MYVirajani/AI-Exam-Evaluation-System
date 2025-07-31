import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from "uuid";


export async function POST(request: Request) {
  try {
    const { user_id, module_code, enrollment_key } = await request.json();

    if (!user_id || !module_code) {
      return NextResponse.json(
        { error: "user_id and module_code are required" },
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

    // ✅ Find module by module_code
    const foundModule = await prisma.module.findFirst({
      where: { module_code },
    });
    if (!foundModule) {
      return NextResponse.json({ error: "Module not found" }, { status: 404 });
    }

    // If enrollment_key is not set on the module, disallow enrollment
    if (!foundModule.enrollment_key) {
      return NextResponse.json(
        {
          error:
            "Enrollment is not allowed yet for this module. Please check with your educator.",
        },
        { status: 403 }
      );
    }

    // Now check if provided enrollment_key matches module's enrollment_key
    if (!enrollment_key || enrollment_key !== foundModule.enrollment_key) {
      return NextResponse.json(
        { error: "Invalid enrollment key" },
        { status: 401 }
      );
    }

    // 🔄 Check for existing enrollment
    const existing = await prisma.enrollment.findFirst({
      where: {
        registration_number: registration_number,
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
        enrollment_id: uuidv4(),
        registration_number: registration_number,
        module_id: foundModule.module_id,
      },
    });

    return NextResponse.json({ success: true, enrollment });
  } catch (error) {
    console.error("Enrollment API error:", error);
    return NextResponse.json({ error: "Failed to enroll student" }, { status: 500 });
  }
}
