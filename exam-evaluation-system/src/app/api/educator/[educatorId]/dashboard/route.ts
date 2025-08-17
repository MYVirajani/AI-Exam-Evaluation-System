// src/app/api/educator/[educatorId]/dashboard/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const educator = await prisma.educator.findUnique({
      where: { user_id: educatorId },
    });

    if (!educator) {
      console.warn(`${logPrefix} - Educator not found`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // console.info(
    //   `${logPrefix} - Educator found: educator_id=${educator.educator_id}`
    // );

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
        _count: { select: { enrollments: true } },
      },
    });
    console.info(`${logPrefix} - Modules fetched: count=${modules.length}`);

    console.debug(`${logPrefix} - Fetching assessments for educator...`);
    // NOTE: no DB ordering here; we'll sort by COALESCE(close_at, deadline) in Node.
    const assessments = await prisma.assessment.findMany({
      where: { created_by: educatorId },
      select: {
        assessment_id: true,
        type: true,
        title: true,
        description: true,
        deadline: true,
        open_at: true,
        close_at: true,
        module_id: true,
      },
    });

    // Count distinct student submissions per assessment
    const assessmentIds = assessments.map((a) => a.assessment_id);
    const submissionCounts = await prisma.submission.groupBy({
      by: ["assessment_id", "student_id"],
      where: { assessment_id: { in: assessmentIds } },
      _count: { student_id: true },
    });
    const submissionCountMap = submissionCounts.reduce((acc, row) => {
      acc[row.assessment_id] = (acc[row.assessment_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.info(`${logPrefix} - Assessments fetched: count=${assessments.length}`);

    // Sort by COALESCE(close_at, deadline) ascending
    const effectiveTs = (a: { close_at: Date | null; deadline: Date | null }) => {
      const d = a.close_at ?? a.deadline;
      return d ? new Date(d).getTime() : Number.POSITIVE_INFINITY; // push truly undated to end
    };

    const sortedAssessments = [...assessments].sort((a, b) => {
      return effectiveTs(a) - effectiveTs(b);
    });

    const formattedModules = modules.map((mod) => ({
      ...mod,
      number_of_enrollments: mod._count.enrollments,
    }));

    const formattedAssessments = sortedAssessments.map((asm) => ({
      assessment_id: asm.assessment_id,
      type: asm.type,
      title: asm.title,
      description: asm.description,
      deadline: asm.deadline,
      open_at: asm.open_at,
      close_at: asm.close_at,
      module_id: asm.module_id,
      number_of_submissions: submissionCountMap[asm.assessment_id] || 0,
    }));

    console.info(
      `${logPrefix} - Successfully processed request in ${Date.now() - startTime}ms`
    );
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
