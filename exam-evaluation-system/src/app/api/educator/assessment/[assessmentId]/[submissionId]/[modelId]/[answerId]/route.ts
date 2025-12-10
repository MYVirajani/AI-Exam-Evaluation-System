// api/educator/assessment/[assessmentId]/[submissionId]/[modelId]/[answerId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  {
    params,
  }: {
    params: {
      assessmentId: string;
      submissionId: string;
      modelId: string;
      answerId: string;
    };
  }
) {
  try {
    const { assessmentId, submissionId, answerId, modelId } = params;
    const body = await req.json();

    const { score, feedback, guideline_text } = body;

    if (
      score === undefined &&
      !feedback &&
      guideline_text === undefined
    ) {
      return NextResponse.json(
        { error: "Provide score, feedback, or guideline_text" },
        { status: 400 }
      );
    }

    // ----------------------------------------------------------
    // 1️⃣ Get Student Answer
    // ----------------------------------------------------------
    const studentAnswer = await prisma.student_Answer.findUnique({
      where: { id: answerId },
      select: {
        id: true,
        question_number: true,
      },
    });

    if (!studentAnswer) {
      return NextResponse.json(
        { error: "Student answer not found" },
        { status: 404 }
      );
    }

    // ----------------------------------------------------------
    // 2️⃣ Ensure submission exists
    // ----------------------------------------------------------
    const submissionRecord = await prisma.submission.findUnique({
      where: { submission_id: submissionId },
      select: { assessment_id: true },
    });

    if (!submissionRecord) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // ----------------------------------------------------------
    // 3️⃣ Transaction
    // ----------------------------------------------------------
    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();

      // ----------------------------------------------------------
      // 3️⃣ Update Student_Answer
      // ----------------------------------------------------------
      const updatedAnswer = await tx.student_Answer.update({
        where: { id: answerId },
        data: {
          score: score !== undefined ? Number(score) : undefined,
          feedback: feedback ?? undefined,
          updated_on: now,
        },
      });

      // ----------------------------------------------------------
      // 4️⃣ Update Grading_Results
      // ----------------------------------------------------------
      await tx.grading_Results.update({
        where: {
          model_id_submission_id_student_answer_id: {
            model_id: modelId,
            submission_id: submissionId,
            student_answer_id: answerId,
          },
        },
        data: {
          score: score !== undefined ? Number(score) : undefined,
          feedback: feedback ?? undefined,
          updated_on: now,
        },
      });

      // ----------------------------------------------------------
      // ✅ 5️⃣ Update Question.guideline_text
      // ----------------------------------------------------------
      if (guideline_text !== undefined) {
        await tx.question.updateMany({
          where: {
            model_id: modelId,
            assessment_id: assessmentId,
            question_number: studentAnswer.question_number,
          },
          data: {
            guideline_text,
            updated_on: now,
          },
        });
      }

      // ----------------------------------------------------------
      // 6️⃣ Recalculate total score
      // ----------------------------------------------------------
      const totalScoreObj = await tx.student_Answer.aggregate({
        where: {
          submission_id: submissionId,
          model_id: modelId,
        },
        _sum: { score: true },
      });

      const totalScore = totalScoreObj._sum.score || 0;

      // ----------------------------------------------------------
      // 7️⃣ Recalculate total max marks
      // ----------------------------------------------------------
      const totalMaxObj = await tx.question.aggregate({
        where: {
          model_id: modelId,
          assessment_id: assessmentId,
        },
        _sum: { max_marks: true },
      });

      const totalMaxMarks = totalMaxObj._sum.max_marks || 0;

      // ----------------------------------------------------------
      // 8️⃣ Upsert Assessment_Grade
      // ----------------------------------------------------------
      const updatedGrade = await tx.assessment_Grade.upsert({
        where: {
          model_id_submission_id_assessment_id: {
            model_id: modelId,
            submission_id: submissionId,
            assessment_id: assessmentId,
          },
        },
        update: {
          score: totalScore,
          max_marks: totalMaxMarks,
          updated_on: now,
        },
        create: {
          model_id: modelId,
          submission_id: submissionId,
          assessment_id: assessmentId,
          score: totalScore,
          max_marks: totalMaxMarks,
          created_on: now,
          updated_on: now,
        },
      });

      return {
        updatedAnswer,
        updatedGrade,
      };
    });

    return NextResponse.json({
      message:
        "Student answer, grading results, guideline text, and assessment grade updated successfully!",
      result,
    });
  } catch (error) {
    console.error("Error updating grading:", error);
    return NextResponse.json(
      { error: "Failed to update grading", details: String(error) },
      { status: 500 }
    );
  }
}
