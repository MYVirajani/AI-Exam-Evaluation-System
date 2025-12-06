import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ moduleId: string; assessmentId: string }> }
) {
  try {
    const { assessmentId } = await context.params;
    const studentId = request.nextUrl.searchParams.get("studentId");

    console.log("Fetching assessment for ID:", assessmentId);
    console.log("Student ID from query:", studentId);

    const assessment = await prisma.assessment.findUnique({
      where: { assessment_id: assessmentId },
      select: {
        assessment_id: true,
        module_id: true,
        created_by: true,
        created_on: true,
        type: true,
        title: true,
        description: true,
        instructions: true,
        duration: true,
        deadline: true,
        open_at: true,
        close_at: true,
        max_marks: true,
        shuffle_questions: true,
        max_attempts: true,
        auto_grade: true,
        back_navigation: true,
        case_sensitive_evaluation: true,
        password: true,
        model_id: true,   // ✅ include active grading model ID

        evaluation_model: {
          select: {
            id: true,
            model_name: true,
            provider: true,
            description: true,
          },
        },

        questions: {
          select: { id: true },
          take: 1,
        },

        module: {
          select: {
            module_code: true,
            module_name: true,
          },
        },

        question_paper: {
          select: { file_url: true, created_on: true },
        },

        submissions: {
          where: studentId ? { student_id: studentId } : undefined,
          include: {
            student: true,
            answers: true,
            grading_results: true,
            assessment_grade: true, 
          },
          orderBy: { submission_start_at: "asc" },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { message: "Assessment not found" },
        { status: 404 }
      );
    }

    const attemptsRemaining = assessment.max_attempts
      ? Math.max(assessment.max_attempts - assessment.submissions.length, 0)
      : null;

    const lastSubmission =
      assessment.submissions.length > 0
        ? assessment.submissions[assessment.submissions.length - 1]
        : null;

    const response = {
      module_code: assessment.module.module_code,
      module_name: assessment.module.module_name,

      assessment_model: assessment.evaluation_model ?? null, 

      assessment_data: {
        assessment_id: assessment.assessment_id,
        type: assessment.type,
        title: assessment.title,
        description: assessment.description,
        deadline: assessment.deadline,
        instructions: assessment.instructions,
        duration: assessment.duration,
        open_at: assessment.open_at,
        close_at: assessment.close_at,
        shuffle_questions: assessment.shuffle_questions,
        max_attempts: assessment.max_attempts,
        auto_grade: assessment.auto_grade,
        back_navigation: assessment.back_navigation,
        case_sensitive_evaluation: assessment.case_sensitive_evaluation,
        has_password: !!assessment.password,
        has_questions: assessment.questions.length > 0,
      },

      question_paper: assessment.question_paper ?? null,

      submissions: assessment.submissions.map((s) => ({
        submission_id: s.submission_id,
        type: s.type,
        submission_start_at: s.submission_start_at,
        submission_end_at: s.submission_end_at,
        file_url: s.file_url,
        ip_address: s.ip_address,
        device_info: s.device_info,
        is_graded: s.is_graded,
        student_score: s.student_score,
        is_handwritten: s.is_handwritten,
        handwritten_file_url: s.handwritten_file_url,

        answers: s.answers,
        grading_results: s.grading_results,

        assessment_grade: s.assessment_grade,
      })),

      attempts_remaining: attemptsRemaining,

      last_attempt_grade: lastSubmission
        ? {
            student_score: lastSubmission.student_score,
            is_graded: lastSubmission.is_graded,
            submitted_at: lastSubmission.submission_end_at,
            assessment_grade: lastSubmission.assessment_grade?.[0] ?? null,
          }
        : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch assessment details:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
