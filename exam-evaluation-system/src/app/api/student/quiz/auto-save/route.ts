import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const {
      submissionId,
      questionId,
      questionNumber,
      studentAnswer,
    } = await request.json();

    if (!submissionId || !questionNumber || studentAnswer === undefined) {
      return NextResponse.json(
        {
          message:
            "Missing submissionId, questionNumber, or studentAnswer",
        },
        { status: 400 }
      );
    }

    // 1️⃣ Check if answer already exists
    const existingAnswer = await prisma.student_Answer.findFirst({
      where: {
        submission_id: submissionId,
        question_number: questionNumber,
      },
    });

    let savedAnswer;

    if (existingAnswer) {
      // 2️⃣ Update existing answer
      savedAnswer = await prisma.student_Answer.update({
        where: { id: existingAnswer.id },
        data: {
          answer_text: studentAnswer,
          updated_on: new Date(),
        },
      });
    } else {
      // 3️⃣ Create new answer
      savedAnswer = await prisma.student_Answer.create({
        data: {
          submission_id: submissionId,
          question_id: questionId ?? null,
          question_number: questionNumber,
          answer_text: studentAnswer,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Answer auto-saved successfully",
      savedAnswer,
    });
  } catch (error) {
    console.error("Auto-save error:", error);
    return NextResponse.json(
      { message: "Failed to auto-save answer" },
      { status: 500 }
    );
  }
}
