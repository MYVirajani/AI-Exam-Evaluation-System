import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { assessmentId: string } }) {
  try {
    const { assessmentId } = params;
    const submissionId = req.nextUrl.searchParams.get("submissionId");

    if (!assessmentId || !submissionId) {
      return NextResponse.json(
        { message: "Missing assessmentId or submissionId" },
        { status: 400 }
      );
    }

    // Fetch assessment with module info
    const assessment = await prisma.assessment.findUnique({
      where: { assessment_id: assessmentId },
      include: {
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

    // Fetch quiz submission for this student attempt
    const submission = await prisma.submission.findUnique({
      where: { submission_id: submissionId },
      select: {
        submission_start_time: true,
      },
    });

    if (!submission) {
      return NextResponse.json(
        { message: "Submission not found" },
        { status: 404 }
      );
    }

    // Fetch questions
    const questions = await prisma.question.findMany({
      where: {
        assessment_id: assessmentId,
      },
      select: {
        question_id: true,
        type: true,
        question_number: true,
        question: true,
        mcq_answer_options: true,
        marks_allowed: true,
      },
    });

    // Shuffle questions if required
    const finalQuestions = assessment.shuffle_questions
      ? shuffleArray(questions)
      : questions;

    // Prepare response payload
    const responsePayload = {
      assessmentId: assessment.assessment_id,
      title: assessment.title,
      duration: assessment.duration,
      module_code: assessment.module.module_code,
      module_name: assessment.module.module_name,
      started_at: submission.submission_start_time,
      questions: finalQuestions,
    };

    // Log the payload
    console.log("📦 Quiz Questions API Response:", JSON.stringify(responsePayload, null, 2));

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("❌ Error fetching quiz questions:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Utility: Fisher–Yates shuffle
function shuffleArray(array: any[]) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
