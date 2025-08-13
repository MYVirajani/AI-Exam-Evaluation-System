// src/app/api/educator/[educatorId]/dashboard/route.ts

import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { educatorId: string } }
) {
  const { educatorId } = params;
  const logPrefix = `[EducatorDashboardAPI][educatorId=${educatorId}]`;
  const startTime = Date.now();

  console.info(`${logPrefix} - Incoming GET request for educator dashboard`);

  try {
    console.debug(`${logPrefix} - Validating educator existence...`);

    // Validate educator
    const educator = await prisma.educator.findUnique({
      where: { user_id: educatorId },
    });

    if (!educator) {
      console.warn(`${logPrefix} - Educator not found`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.info(`${logPrefix} - Educator found: educator_id=${educator.educator_id}`);

    // Get modules with enrollment count
    console.debug(`${logPrefix} - Fetching modules for educator...`);
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
    console.info(`${logPrefix} - Modules fetched: count=${modules.length}`);

    // Get assessments with submission count and module_id
    console.debug(`${logPrefix} - Fetching assessments for educator...`);
    const assessments = await prisma.assessment.findMany({
      where: { created_by: educatorId },
      select: {
        assessment_id: true,
        type: true,
        title: true,
        description: true,
        deadline: true,
        module_id: true,
        _count: {
          select: {
            submissions: true,
          },
        },
      },
      orderBy: { deadline: 'asc' },
    });
    console.info(`${logPrefix} - Assessments fetched: count=${assessments.length}`);

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

    console.info(
      `${logPrefix} - Successfully processed request in ${Date.now() - startTime}ms`
    );
    console.log('formattedAssessments', formattedAssessments);

    return NextResponse.json({
      modules: formattedModules,
      assessments: formattedAssessments,
    });
  } catch (err: any) {
    console.error(
      `${logPrefix} - Error fetching educator dashboard: ${err.message}`,
      err.stack || err
    );
    return NextResponse.json(
      { error: "Failed to load modules and assessments" },
      { status: 500 }
    );
  }
}
