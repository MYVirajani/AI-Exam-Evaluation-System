import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const registration_number = searchParams.get("registration_number");

    if (!registration_number) {
      return NextResponse.json(
        { error: "Missing registration_number" },
        { status: 400 }
      );
    }

    // Find all enrolled modules for the student
    const enrollments = await prisma.enrollment.findMany({
      where: {
        student_id: registration_number,
      },
      include: {
        module: {
          include: {
            assessments: true, // include assessments under each module
          },
        },
      },
    });

    const modulesWithAssessments = enrollments.map((enrollment) => ({
      module_id: enrollment.module.module_id,
      module_code: enrollment.module.module_code,
      module_name: enrollment.module.module_name,
      semester: enrollment.module.semester,
      education_institute: enrollment.module.education_institute,
      module_image_url: enrollment.module.module_image_url,
      assessments: enrollment.module.assessments.map((a) => ({
        assessment_id: a.assessment_id,
        title: a.title,
        type: a.type,
        description: a.description,
        deadline: a.deadline,
      })),
    }));

    return NextResponse.json({ modules: modulesWithAssessments });
  } catch (error) {
    console.error("Failed to load student enrollments:", error);
    return NextResponse.json(
      { error: "Failed to load enrollments" },
      { status: 500 }
    );
  }
}
