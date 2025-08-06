import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { submissionId, questionId, studentAnswer } = await request.json();

    if (!submissionId || !questionId || studentAnswer === undefined) {
      return NextResponse.json(
        { message: "Missing submissionId, questionId, or studentAnswer" },
        { status: 400 }
      );
    }

    // Upsert (update if exists, otherwise create)
    const savedAnswer = await prisma.student_Answer.upsert({
      where: {
        submission_id_question_id: {
          submission_id: submissionId,
          question_id: questionId,
        },
      },
      update: {
        student_answer: studentAnswer,
      },
      create: {
        submission_id: submissionId,
        question_id: questionId,
        student_answer: studentAnswer,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Answer auto-saved successfully.",
      savedAnswer,
    });
  } catch (error) {
    console.error("Auto-save error:", error);
    return NextResponse.json(
      { message: "Failed to auto-save answer." },
      { status: 500 }
    );
  }
}
