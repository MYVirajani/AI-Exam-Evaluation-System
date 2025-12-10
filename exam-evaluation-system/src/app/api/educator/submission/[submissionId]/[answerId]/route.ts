import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { submissionId: string; answerId: string } }
) {
  try {
    const { submissionId, answerId } = params;
    const body = await req.json();
    const { score, feedback } = body;

    if (score === undefined && !feedback) {
      return NextResponse.json(
        { error: "Provide at least score or feedback" },
        { status: 400 }
      );
    }

    // ----------------------------------------------------------
    // 1️⃣ Get Student Answer
    // ----------------------------------------------------------
    const studentAnswer = await prisma.student_Answer.findUnique({
      where: { id: answerId },
    });

    if (!studentAnswer) {
      return NextResponse.json(
        { error: "Student answer not found" },
        { status: 404 }
      );
    }

    const modelId = studentAnswer.model_id;

    // ----------------------------------------------------------
    // 2️⃣ Get the Assessment ID linked to this submission
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

    const assessmentId = submissionRecord.assessment_id;

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
        //   graded_at: now,
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
      // 5️⃣ Recalculate total score and max marks for assessment grade
      // ----------------------------------------------------------

      // Sum of all student answer scores
      const totalScoreObj = await tx.student_Answer.aggregate({
        where: { submission_id: submissionId, model_id: modelId },
        _sum: { score: true },
      });

      const totalScore = totalScoreObj._sum.score || 0;

      // Total max marks for questions in this model
      const totalMaxObj = await tx.question.aggregate({
        where: { model_id: modelId },
        _sum: { max_marks: true },
      });

      const totalMaxMarks = totalMaxObj._sum.max_marks || 0;

      // ----------------------------------------------------------
      // 6️⃣ Update/create Assessment_Grade (composite key)
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

      return { updatedAnswer, updatedGrade };
    });

    // ----------------------------------------------------------

    return NextResponse.json({
      message: "Student answer updated and assessment grade recalculated!",
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
