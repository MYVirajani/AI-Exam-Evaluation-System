import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ------------------------------------------------------
// GET /api/educator/assessment/[assessmentId]/assessment-grades
// Query param: ?assessmentId=xxxx
// ------------------------------------------------------
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const assessmentId = searchParams.get("assessmentId");

  if (!assessmentId) {
    return NextResponse.json(
      { message: "assessmentId query parameter is required" },
      { status: 400 }
    );
  }

  try {
    // ------------------------------------------------
    // 1. Fetch Assessment + Module Data
    // ------------------------------------------------
    const assessment = await prisma.assessment.findUnique({
      where: { assessment_id: assessmentId },
      select: {
        assessment_id: true,
        title: true,
        type: true,
        deadline: true,
        module: {
          select: {
            module_code: true,
            module_name: true,
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { message: "Assessment not found" },
        { status: 404 }
      );
    }

    // ------------------------------------------------
    // 2. Fetch Submissions WITH Student + User
    // ------------------------------------------------
    const submissions = await prisma.submission.findMany({
      where: { assessment_id: assessmentId },
      select: {
        submission_id: true,
        student_id: true,
        assessment_id: true,
        type: true,
        submission_start_at: true,
        submission_end_at: true,
        file_url: true,
        media_extracted_file_url: true,
        ip_address: true,
        device_info: true,
        student_score: true,
        is_graded: true,
        is_handwritten: true,
        handwritten_file_url: true,

        student: {
          select: {
            user_id: true,
            registration_number: true,
            education_institute: true,
            user: {
              select: {
                first_name: true,
                last_name: true,
                title: true,
                email: true,
                phone_number: true,
                profile_image_url: true,
              },
            },
          },
        },
      },
    });

    if (submissions.length === 0) {
      return NextResponse.json(
        { message: "No submissions found for this assessment" },
        { status: 404 }
      );
    }

    const submissionIds = submissions.map((s) => s.submission_id);

    // ------------------------------------------------
    // 3. Fetch Evaluation Models (Assessment_Grade)
    // ------------------------------------------------
    const assessmentGrades = await prisma.assessment_Grade.findMany({
      where: {
        submission_id: { in: submissionIds },
      },
      include: {
        evaluation_model: true,
      },
    });

    // Remove duplicates
    const evaluationModelsMap = new Map();
    assessmentGrades.forEach((g) => {
      if (g.evaluation_model) {
        evaluationModelsMap.set(g.evaluation_model.id, g.evaluation_model);
      }
    });

    const evaluationModels = Array.from(evaluationModelsMap.values());

    // ------------------------------------------------
    // Final Output
    // ------------------------------------------------
    return NextResponse.json({
      assessment,
      submissions,
      evaluation_models: evaluationModels,
    });
  } catch (error) {
    console.error("Error fetching assessment grade data:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
