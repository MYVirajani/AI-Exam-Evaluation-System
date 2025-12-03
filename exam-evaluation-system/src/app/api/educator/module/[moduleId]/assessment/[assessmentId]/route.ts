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

    // Fetch assessment + question paper + model answer paper + submissions
    const assessment = await prisma.assessment.findFirst({
      where: {
        assessment_id: assessmentId,
        module_id: moduleId,
        created_by: educatorId,
      },
      include: {
        module: true,
        educator: true,

        // Question Paper (file_url)
        question_paper: {
          select: {
            question_paper_id: true,
            file_url: true,
            created_on: true,
            updated_on: true,
          },
        },

        // Model Answer Paper (file_url + extracted media)
        model_answer_paper: {
          select: {
            id: true,
            file_url: true,
            media_extracted_file_url: true,
            created_on: true,
            updated_on: true,
          },
        },

        marking_scheme: true,
        questions: {
          orderBy: { question_number: 'asc' },
        },

        submissions: {
          include: {
            // Submission document/handwritten files
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

    // Collect submission IDs
    const submissionIds = assessment.submissions.map(
      (s) => s.submission_id
    );

    // Fetch AI grading results
    const gradeResults = await prisma.assessment_Grade.findMany({
      where: {
        submission_id: { in: submissionIds },
      },
      include: {
        evaluation_model: true,
        submission: true,
      },
    });

    // Enhance submissions with AI grades + full submission data
    const enhancedSubmissions = assessment.submissions.map((submission) => {
      const grades = gradeResults.filter(
        (gr) => gr.submission_id === submission.submission_id
      );

      let latestAIGrade = null;
      if (grades.length > 0) {
        const grade = grades[0];
        latestAIGrade = {
          model_id: grade.model_id,
          model_name: grade.evaluation_model?.model_name,
          score: grade.score,
          max_marks: grade.max_marks,
        };
      }

      return {
        ...submission,

        // document submission fields
        file_url: submission.file_url,
        media_extracted_file_url: submission.media_extracted_file_url,

        // handwritten submission fields
        handwritten_file_url: submission.handwritten_file_url,
        is_handwritten: submission.is_handwritten,

        latest_ai_grade: latestAIGrade,
      };
    });

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
