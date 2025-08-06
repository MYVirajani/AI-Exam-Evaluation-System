import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    // Step 1: Find student by user_id
    const student = await prisma.student.findUnique({
      where: { user_id },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found for this user_id" },
        { status: 404 }
      );
    }

    const registration_number = student.registration_number;

    // Step 2: Get list of module_ids for this student
    const enrollments = await prisma.enrollment.findMany({
      where: { registration_number },
      select: { module_id: true },
    });

    const moduleIds = enrollments.map((e) => e.module_id);

    if (moduleIds.length === 0) {
      return NextResponse.json({ modules: [] }, { status: 200 });
    }

    // Step 3: Get modules and their assessments
    const modules = await prisma.module.findMany({
      where: {
        module_id: { in: moduleIds },
      },
      include: {
        assessments: {
          orderBy: {
            deadline: "asc",
          },
        },
      },
    });

    // Step 4: Format the response
    const modulesWithAssessments = modules.map((mod) => ({
      module_id: mod.module_id,
      module_code: mod.module_code,
      module_name: mod.module_name,
      semester: mod.semester,
      education_institute: mod.education_institute,
      module_image_url: mod.module_image_url,
      assessments: mod.assessments.map((a) => ({
        assessment_id: a.assessment_id,
        title: a.title,
        type: a.type,
        description: a.description,
        deadline: a.deadline,
      })),
    }));

    return NextResponse.json({ modules: modulesWithAssessments }, { status: 200 });

  } catch (error) {
    console.error("Failed to load student enrollments:", error);
    return NextResponse.json(
      { error: "Failed to load enrollments" },
      { status: 500 }
    );
  }
}
