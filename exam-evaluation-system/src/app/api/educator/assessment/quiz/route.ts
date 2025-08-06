import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      moduleId,
      assessmentId,
      title,
      duration,
      description,
      instructions,
      questions,
      deadline,
      totalMarks,
      password,
      questionCount,
      shuffleQuestions,
    } = body;

    if (!moduleId || !assessmentId || !Array.isArray(questions)) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingAssessment = await prisma.assessment.findUnique({
      where: { assessment_id: assessmentId },
    });

    if (!existingAssessment) {
      return NextResponse.json(
        { success: false, message: "Assessment not found" },
        { status: 404 }
      );
    }

    // ✅ Build questions with proper decimal handling
    const parsedQuestions = questions.map((q: any, index: number) => {
      console.log(
        `Question ${index + 1} - type of q.marks:`,
        typeof q.marks,
        "| value:",
        q.marks
      );

      // Convert marks to proper Decimal format
      const cleanMarks = new Decimal(
        typeof q.marks === "number"
          ? q.marks.toFixed(1)
          : typeof q.marks === "string"
          ? parseFloat(q.marks).toFixed(1)
          : "0.0"
      );

      const modelAnswer =
        q.questionType === "MCQ"
          ? q.options?.[q.correctAnswerIndex]?.trim() || ""
          : q.expectedAnswer?.trim() || "";

      return {
        assessment_id: assessmentId,
        type: q.questionType,
        question_number: (index + 1).toString(),
        question: q.questionText.trim(),
        model_answer: modelAnswer,
        mcq_answer_options: Array.isArray(q.options) ? q.options : [],
        marks_allowed: cleanMarks, // Now passing as Decimal
      };
    });

    // ✅ Calculate total marks using Decimal arithmetic
    const calculatedTotalMarks = parsedQuestions.reduce(
      (sum: Decimal, q) => sum.plus(q.marks_allowed),
      new Decimal("0.0")
    );

    // ✅ Update the assessment with proper decimal handling

    // Inside the try block, in the prisma.assessment.update call:
    const updatedAssessment = await prisma.assessment.update({
      where: { assessment_id: assessmentId },
      data: {
        title: title ?? existingAssessment.title,
        duration: duration ?? existingAssessment.duration,
        description: description ?? existingAssessment.description,
        instructions: Array.isArray(instructions)
          ? instructions.map((line: string) => line.trim())
          : typeof instructions === "string"
          ? instructions.split("\n").map((line: string) => line.trim())
          : existingAssessment.instructions,
        type: "quiz",
        deadline: deadline ? new Date(deadline) : existingAssessment.deadline,
        total_marks: totalMarks
          ? new Decimal(totalMarks.toString())
          : calculatedTotalMarks,
        password: password
          ? await bcrypt.hash(password, 10)
          : existingAssessment.password,
        question_count: questionCount ?? parsedQuestions.length,
        shuffle_questions:
          shuffleQuestions ?? existingAssessment.shuffle_questions,
      },
    });

    // ❌ Delete existing questions for this assessment
    await prisma.question.deleteMany({
      where: { assessment_id: assessmentId },
    });

    // ✅ Save new questions in transaction
    const createdQuestions = await prisma.$transaction(
      parsedQuestions.map((q) => prisma.question.create({ data: q }))
    );

    return NextResponse.json({
      success: true,
      message: "Assessment and questions saved successfully",
      assessment: updatedAssessment,
      questions: createdQuestions,
    });
  } catch (error) {
    console.error("Failed to save quiz:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
