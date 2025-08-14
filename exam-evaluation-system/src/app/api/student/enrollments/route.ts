import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const requestId = Date.now();
  console.log(`[${requestId}] Incoming GET /modules request`);

  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    console.log(`[${requestId}] Query params:`, { user_id });

    if (!user_id) {
      console.warn(`[${requestId}] Missing user_id`);
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

    // Step 1: Find student by user_id
    console.log(`[${requestId}] Looking up student with user_id: ${user_id}`);
    const student = await prisma.student.findUnique({
      where: { user_id },
    });

    if (!student) {
      console.warn(`[${requestId}] Student not found for user_id: ${user_id}`);
      return NextResponse.json(
        { error: "Student not found for this user_id" },
        { status: 404 }
      );
    }

    const registration_number = student.registration_number;
    console.log(
      `[${requestId}] Found student with registration_number: ${registration_number}`
    );

    // Step 2: Get list of module_ids for this student
    console.log(`[${requestId}] Fetching enrollments for registration_number: ${registration_number}`);
    const enrollments = await prisma.enrollment.findMany({
      where: { registration_number },
      select: { module_id: true },
    });

    const moduleIds = enrollments.map((e) => e.module_id);
    console.log(`[${requestId}] Found ${moduleIds.length} enrolled module(s)`);

    if (moduleIds.length === 0) {
      console.info(`[${requestId}] No modules found for student`);
      return NextResponse.json({ modules: [] }, { status: 200 });
    }

    // Step 3: Get modules ordered by last_updated_at with their assessments
    console.log(`[${requestId}] Fetching modules ordered by last_updated_at`);
    const modules = await prisma.module.findMany({
      where: {
        module_id: { in: moduleIds },
      },
      orderBy: {
        last_updated_at: "desc",
      },
      include: {
        assessments: {
          orderBy: {
            deadline: "asc",
          },
        },
      },
    });

    console.log(`[${requestId}] Retrieved ${modules.length} module(s) from DB`);

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
        open_at: a.open_at,
        close_at: a.close_at,
      })),
    }));

    console.log(`[${requestId}] Successfully returning ${modulesWithAssessments.length} module(s)`);

    return NextResponse.json({ modules: modulesWithAssessments }, { status: 200 });

  } catch (error: any) {
    console.error(`[${requestId}] Failed to load student enrollments:`, error.stack || error);
    return NextResponse.json(
      { error: "Failed to load enrollments" },
      { status: 500 }
    );
  }
}
