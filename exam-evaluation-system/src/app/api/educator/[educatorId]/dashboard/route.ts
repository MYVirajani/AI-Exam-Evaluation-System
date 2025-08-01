// src/app/api/educator/[educatorId]/dashboard/route.ts

import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { educatorId: string } }
) {
  const { educatorId } = params;

  try {
    console.log("Fetching dashboard for educatorId:", educatorId);

    // Validate educator
    const educator = await prisma.educator.findUnique({
      where: { user_id: educatorId },
    });

    if (!educator) {
      console.log("Educator not found for user_id:", educatorId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get modules with enrollment count
    const modules = await prisma.module.findMany({
      where: { created_by: educatorId },
      select: {
        module_id: true,
        module_code: true,
        module_name: true,
        semester: true,
        education_institute: true,
        max_enrollments: true,
        learning_outcomes: true,
        enrollment_key: true,
        module_image_url: true,
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    // Get assessments with submission count and module_id
    const assessments = await prisma.assessment.findMany({
      where: { created_by: educatorId },
      select: {
        assessment_id: true,
        type: true,
        title: true,
        description: true,
        deadline: true,
        module_id: true, // ✅ Ensure module_id is fetched
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: { deadline: 'asc' },
    });

    // Format modules
    const formattedModules = modules.map(mod => ({
      ...mod,
      number_of_enrollments: mod._count.enrollments,
    }));

    // Format assessments with module_id
    const formattedAssessments = assessments.map(asm => ({
      assessment_id: asm.assessment_id,
      type: asm.type,
      title: asm.title,
      description: asm.description,
      deadline: asm.deadline,
      module_id: asm.module_id, 
      number_of_submissions: asm._count.submissions,
    }));

    console.log(
      `Fetched ${formattedModules.length} modules and ${formattedAssessments.length} assessments for educatorId:`,
      educatorId
    );

    return NextResponse.json({
      modules: formattedModules,
      assessments: formattedAssessments,
    });
  } catch (err) {
    console.error("Error fetching educator dashboard:", err);
    return NextResponse.json(
      { error: "Failed to load modules and assessments" },
      { status: 500 }
    );
  }
}
