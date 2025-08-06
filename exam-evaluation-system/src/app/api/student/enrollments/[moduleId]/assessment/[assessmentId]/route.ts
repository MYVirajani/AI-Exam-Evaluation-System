import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const studentId = request.nextUrl.searchParams.get("studentId");
    const { assessmentId } = params;

    console.log("Fetching assessment for ID:", assessmentId);
    console.log("Student ID from query:", studentId);

    const assessment = await prisma.assessment.findUnique({
      where: { assessment_id: assessmentId },
      include: {
        module: {
          select: {
            module_code: true,
            module_name: true,
          },
        },
        question_paper: true,
        submissions: {
          where: studentId ? { student_id: studentId } : undefined,
          include: {
            grade: true, // ✅ use `grade` instead of `assessment_grade`
          },
        },
      },
    });

    console.log("Fetched assessment from DB:", assessment);

    if (!assessment) {
      console.warn("Assessment not found for ID:", assessmentId);
      return NextResponse.json(
        { message: "Assessment not found" },
        { status: 404 }
      );
    }

    const submission = assessment.submissions.length > 0 ? assessment.submissions[0] : null;
    const grade = submission?.grade || null;

    console.log("Submission data:", submission);
    console.log("Grade data:", grade);

    const response = {
      module_code: assessment.module.module_code,
      module_name: assessment.module.module_name,
      assessment_data: {
        assessment_id: assessment.assessment_id,
        type: assessment.type,
        title: assessment.title,
        description: assessment.description,
        deadline: assessment.deadline,
        instructions: assessment.instructions,
      },
      question_paper: assessment.question_paper
        ? {
            file_url: assessment.question_paper.file_url,
            created_on: assessment.question_paper.created_on,
          }
        : null,
      submission: submission
        ? {
            submission_id: submission.submission_id,
            file_url: submission.file_url,
            submission_time: submission.submission_start_time,
          }
        : null,
      graded: grade
        ? {
            grade_id: grade.grade_id,
            total_marks: grade.total_marks,
            marks_awarded: grade.marks_awarded,
            feedback: grade.feedback,
            grading_time: grade.grading_time,
            auto_graded: grade.auto_graded,
          }
        : null,
    };

    console.log("Assessmet Response:", response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch assessment details:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
