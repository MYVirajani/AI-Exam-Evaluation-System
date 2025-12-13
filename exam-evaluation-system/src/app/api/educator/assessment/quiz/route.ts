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
      openAt,
      closeAt,
      totalMarks,
      maxMarks,
      password,
      questionCount,
      autoGrade,
      shuffleQuestions,
      backNavigation,
      caseSensitive,
      maxAttempts,
      modelId,
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

    // Fetch existing questions
    const existingQuestions = await prisma.question.findMany({
      where: { assessment_id: assessmentId },
      select: { id: true, max_marks: true },
    });

    const existingQuestionIds = existingQuestions.map((q) => q.id);

    // ----------------------------------------------------
    // 🔥 NEW: Check if questions are locked by dependencies
    // ----------------------------------------------------
    const [gradesCount, studentAnswersCount] = await Promise.all([
      existingQuestionIds.length
        ? prisma.grading_Results.count({
            where: { question_id: { in: existingQuestionIds } },
          })
        : Promise.resolve(0),

      existingQuestionIds.length
        ? prisma.student_Answer.count({
            where: { question_number: { in: existingQuestionIds } },
          })
        : Promise.resolve(0),
    ]);

    const questionsLocked = gradesCount > 0 || studentAnswersCount > 0;

    // ----------------------------------------------------
    // Parse new questions if not locked
    // ----------------------------------------------------
    const parsedQuestions = !questionsLocked
      ? questions.map((q: any, index: number) => {
          const cleanMarks = new Decimal(
            typeof q.marks === "number"
              ? q.marks.toFixed(2)
              : typeof q.marks === "string"
              ? Number.parseFloat(q.marks).toFixed(2)
              : "0.00"
          );

          const modelAnswer =
            q.questionType === "MCQ"
              ? (q.options?.[q.correctAnswerIndex]?.trim() ?? "")
              : (q.expectedAnswer?.trim() ?? "");

          return {
            assessment_id: assessmentId,
            type: q.questionType,
            question_number: (index + 1).toString(),
            question_text: String(q.questionText ?? "").trim(),
            answer_text: modelAnswer,
            mcq_answer_options: Array.isArray(q.options) ? q.options : [],
            max_marks: cleanMarks,
            model_id: existingAssessment.model_id!,
            guideline_text: q.guidelines ? String(q.guidelines).trim() : "",
          };
        })
      : [];

    // ----------------------------------------------------
    // Compute final total marks
    // ----------------------------------------------------
    const providedTotal = totalMarks
      ? new Decimal(totalMarks.toString())
      : null;

    const calculatedTotalFromParsed = !questionsLocked
      ? parsedQuestions.reduce(
          (sum: Decimal, q) => sum.plus(q.max_marks),
          new Decimal("0.00")
        )
      : null;

    const existingTotalFromDb = questionsLocked
      ? existingQuestions.reduce(
          (sum: Decimal, q) => sum.plus(q.max_marks),
          new Decimal("0.00")
        )
      : null;

    const finalTotalMarks =
      providedTotal ??
      calculatedTotalFromParsed ??
      existingTotalFromDb ??
      existingAssessment.total_marks ??
      new Decimal("0.00");

    // ----------------------------------------------------
    // Final question count
    // ----------------------------------------------------
    const finalQuestionCount = questionsLocked
      ? existingQuestions.length
      : (typeof questionCount === "number"
          ? questionCount
          : parsedQuestions.length);

    // ----------------------------------------------------
    // Normalize instructions
    // ----------------------------------------------------
    const normalizedInstructions = Array.isArray(instructions)
      ? instructions.map((line: string) => line.trim())
      : typeof instructions === "string"
      ? instructions.split("\n").map((line: string) => line.trim())
      : existingAssessment.instructions;

    // ----------------------------------------------------
    // Update assessment
    // ----------------------------------------------------
    const updatedAssessment = await prisma.assessment.update({
      where: { assessment_id: assessmentId },
      data: {
        title: title ?? existingAssessment.title,
        duration: duration ?? existingAssessment.duration,
        description: description ?? existingAssessment.description,
        instructions: normalizedInstructions,
        model_id: modelId ?? existingAssessment.model_id,
        type: "quiz",
        deadline: deadline ? new Date(deadline) : existingAssessment.deadline,
        total_marks: finalTotalMarks,
        max_marks:
          maxMarks != null
            ? new Decimal(maxMarks.toString())
            : existingAssessment.max_marks,
        password: password
          ? await bcrypt.hash(password, 10)
          : existingAssessment.password,
        auto_grade: autoGrade ?? existingAssessment.auto_grade,
        shuffle_questions:
          shuffleQuestions ?? existingAssessment.shuffle_questions,
        max_attempts: maxAttempts ?? existingAssessment.max_attempts,
        open_at: openAt ? new Date(openAt) : existingAssessment.open_at,
        close_at: closeAt ? new Date(closeAt) : existingAssessment.close_at,
        back_navigation:
          backNavigation ?? existingAssessment.back_navigation,
        case_sensitive_evaluation:
          caseSensitive ?? existingAssessment.case_sensitive_evaluation,
      },
    });

    // ----------------------------------------------------
    // If locked: Do NOT modify questions
    // ----------------------------------------------------
    if (questionsLocked) {
      return NextResponse.json({
        success: true,
        message:
          "Assessment updated. Questions were NOT modified because they are already linked to grading results or student answers.",
        assessment: updatedAssessment,
        questionsAffected: 0,
        questionsLocked: true,
      });
    }

    // ----------------------------------------------------
    // Replace questions inside transaction
    // ----------------------------------------------------
    const createdQuestions = await prisma.$transaction(async (tx) => {
      await tx.question.deleteMany({ where: { assessment_id: assessmentId } });

      const created = await Promise.all(
        parsedQuestions.map((q) => tx.question.create({ data: q }))
      );

      return created;
    });

    return NextResponse.json({
      success: true,
      message: "Assessment and questions saved successfully.",
      assessment: updatedAssessment,
      questions: createdQuestions,
      questionsLocked: false,
    });
  } catch (error) {
    console.error("Failed to save quiz:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
