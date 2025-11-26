// src/app/api/educator/module/[moduleId]/assessment/[assessmentId]/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  ctx: {
    params: Promise<{
      moduleId: string;
      assessmentId: string;
    }>;
  }
) {
  try {
    const { moduleId, assessmentId } = await ctx.params;

    const educatorId = req.nextUrl.searchParams.get("educatorId");

    if (!educatorId) {
      return NextResponse.json(
        { success: false, message: "Missing educatorId" },
        { status: 400 }
      );
    }

    // Fetch module details
    const moduleData = await prisma.module.findUnique({
      where: { module_id: moduleId },
      select: {
        module_code: true,
        module_name: true,
      },
    });

    if (!moduleData) {
      return NextResponse.json(
        { success: false, message: "Module not found" },
        { status: 404 }
      );
    }

    // Count enrollments
    const enrollmentCount = await prisma.enrollment.count({
      where: { module_id: moduleId },
    });

    // Fetch main assessment data
    const assessment = await prisma.assessment.findFirst({
      where: {
        assessment_id: assessmentId,
        module_id: moduleId,
        created_by: educatorId,
      },
      include: {
        module: true,
        educator: true,
        question_paper: true,
        model_answer_paper: true,
        marking_scheme: true,
        questions: {
          orderBy: { question_number: 'asc' },
        },
        submissions: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    first_name: true,
                    last_name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, message: "Assessment not found or access denied" },
        { status: 404 }
      );
    }

    // Get submission_ids for grading results
    const submissionIds = assessment.submissions.map((s) => s.submission_id);

    // Pre-fetch all grading results for these submissions
    const gradingResults = await prisma.grading_Results.findMany({
      where: {
        submission_id: { in: submissionIds },
      },
      include: {
        evaluation_model: true,
      },
      orderBy: {
        graded_at: "desc",
      },
    });

    // Enhance each submission with its latest grading result
    const enhancedSubmissions = assessment.submissions.map((submission) => {
      const results = gradingResults.filter(
        (gr) => gr.submission_id === submission.submission_id
      );

      let latestAIGrade = null;

      if (results.length > 0) {
        const latest = results[0]; // Because we ordered by graded_at desc

        latestAIGrade = {
          model_id: latest.model_id,
          model_name: latest.evaluation_model?.model_name,
          // total_score: latest.total_score,
          // max_score: latest.max_score,
          graded_at: latest.graded_at.toISOString(),
        };
      }

      return {
        ...submission,
        latest_ai_grade: latestAIGrade,
      };
    });

    // Build final assessment object with enhanced submissions
    const enhancedAssessment = {
      ...assessment,
      submissions: enhancedSubmissions,
    };

    return NextResponse.json({
      module: moduleData,
      enrollmentCount,
      assessment: enhancedAssessment,
    });

  } catch (err) {
    console.error("[GET educator/module/[moduleId]/assessment/[assessmentId]]", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
