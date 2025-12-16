// src/app/api/student/quiz/submit/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export async function POST(req: NextRequest) {
  try {
    const { submissionId, ip_address, device_info } = await req.json();

    if (!submissionId) {
      return NextResponse.json({ message: "Missing submissionId" }, { status: 400 });
    }

    /* -------------------------------------------------------
       1. Get SYSTEM evaluation model
    ------------------------------------------------------- */
    const systemModel = await prisma.evaluation_Model.findUnique({
      where: { model_name: "System Grading" },
    });

    if (!systemModel) {
      return NextResponse.json(
        { message: "SYSTEM evaluation model not found" },
        { status: 500 }
      );
    }

    const modelId = systemModel.id;
    const now = new Date();

    /* -------------------------------------------------------
       2. Fetch submission + student answers + questions
    ------------------------------------------------------- */
    const submission = await prisma.submission.findUnique({
      where: { submission_id: submissionId },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
        assessment: {
          select: {
            assessment_id: true,
            max_marks: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 });
    }

    let totalScore = new Decimal(0);

    /* -------------------------------------------------------
       3. Grade each student answer
    ------------------------------------------------------- */
    for (const ans of submission.answers) {
      if (!ans.question) continue;

      const correctAnswer = ans.question.answer_text?.trim().toLowerCase();
      const studentAnswer = ans.answer_text.trim().toLowerCase();

      const isCorrect = correctAnswer === studentAnswer;
      const score = isCorrect
        ? ans.question.max_marks ?? new Decimal(0)
        : new Decimal(0);

      totalScore = totalScore.plus(score);

      /* ---- Update Student_Answer ---- */
      await prisma.student_Answer.update({
        where: { id: ans.id },
        data: {
          model_id: modelId,
          score,
          feedback: isCorrect ? "Correct answer" : "Incorrect answer",
          graded_at: now,
        },
      });

      /* ---- Create Grading_Results ---- */
      await prisma.grading_Results.create({
        data: {
          model_id: modelId,
          submission_id: submissionId,
          student_answer_id: ans.id,
          question_id: ans.question_id,
          question_number: ans.question_number,
          score,
          max_marks: ans.question.max_marks,
          feedback: isCorrect ? "Correct answer" : "Incorrect answer",
          grading_method: "SYSTEM_RULE_BASED",
        },
      });
    }

    /* -------------------------------------------------------
       4. Upsert Assessment_Grade (composite PK)
    ------------------------------------------------------- */
    await prisma.assessment_Grade.upsert({
      where: {
        model_id_submission_id_assessment_id: {
          model_id: modelId,
          submission_id: submissionId,
          assessment_id: submission.assessment.assessment_id,
        },
      },
      update: {
        score: totalScore,
        updated_on: now,
      },
      create: {
        model_id: modelId,
        submission_id: submissionId,
        assessment_id: submission.assessment.assessment_id,
        score: totalScore,
        max_marks: submission.assessment.max_marks,
        created_on: now,
      },
    });

    /* -------------------------------------------------------
       5. Update submission meta
    ------------------------------------------------------- */
    await prisma.submission.update({
      where: { submission_id: submissionId },
      data: {
        is_graded: true,
        submission_end_at: now,
        ip_address: ip_address ?? req.headers.get("x-forwarded-for") ?? "unknown",
        device_info: device_info ?? "unknown",
      },
    });

    return NextResponse.json({
      message: "Quiz submitted and graded successfully",
      totalScore: totalScore.toString(),
    });
  } catch (error) {
    console.error("❌ Auto-grading error:", error);
    return NextResponse.json(
      { message: "Failed to submit and grade quiz" },
      { status: 500 }
    );
  }
}
