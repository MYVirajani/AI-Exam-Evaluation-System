// src/app/api/student/quiz/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    console.log("📥 Incoming quiz submission for auto-grading...");

    const { submissionId } = await req.json();
    console.log("🔍 Received submissionId:", submissionId);

    if (!submissionId) {
      console.warn("❌ Missing submissionId in request.");
      return NextResponse.json({ message: 'Missing submissionId' }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({
      where: { submission_id: submissionId },
      include: {
        answers: true,
        assessment: {
          select: {
            max_marks: true,
            questions: {
              select: {
                question_id: true,
                model_answer: true,
                marks_allowed: true,
              },
            },
          },
        },
      },
    });

    if (!submission) {
      console.warn("❌ Submission not found for ID:", submissionId);
      return NextResponse.json({ message: 'Submission not found' }, { status: 404 });
    }

    console.log("✅ Fetched submission:", submissionId);
    console.log("📋 Number of answers:", submission.answers.length);
    console.log("📚 Number of assessment questions:", submission.assessment.questions.length);

    const questionMap = new Map(
      submission.assessment.questions.map((q) => [q.question_id, q])
    );

    let totalMarksAwarded = new Decimal(0);
    const now = new Date();

    const questionGrades = await Promise.all(
      submission.answers.map(async (ans, index) => {
        const question = questionMap.get(ans.question_id);
        if (!question) {
          console.warn(`⚠️ No matching question found for answer ${index + 1} (ID: ${ans.question_id})`);
          return null;
        }

        const isCorrect =
          question.model_answer.trim().toLowerCase() ===
          ans.student_answer.trim().toLowerCase();

        const marks_awarded = isCorrect ? question.marks_allowed : new Decimal(0);
        totalMarksAwarded = totalMarksAwarded.plus(marks_awarded);

        console.log(`🧾 Q${index + 1}: ${isCorrect ? '✔️ Correct' : '❌ Incorrect'} → Marks: ${marks_awarded}`);

        await prisma.student_Answer.update({
          where: {
            submission_id_question_id: {
              submission_id: submissionId,
              question_id: ans.question_id,
            },
          },
          data: {
            is_correct: isCorrect,
            marks_awarded,
            graded_at: now,
          },
        });

        return {
          question_id: ans.question_id,
          submission_id: submissionId,
          marks_awarded,
          max_marks: question.marks_allowed,
          graded_at: now,
          grading_duration: new Decimal(0.1),
          auto_graded: true,
          feedback: isCorrect ? 'Correct' : 'Incorrect',
        };
      })
    );

    const validGrades = questionGrades.filter((g) => g !== null);
    console.log(`📊 Total valid question grades: ${validGrades.length}`);
    console.log(`🧮 Total marks awarded: ${totalMarksAwarded.toFixed(1)}`);

    await prisma.question_Grade.createMany({
      data: validGrades as any[],
    });
    console.log("✅ Question grades inserted into DB");

    await prisma.assessment_Grade.create({
      data: {
        grade_id: uuidv4(),
        submission_id: submissionId,
        max_marks: submission.assessment.max_marks ?? new Decimal(0),
        marks_awarded: totalMarksAwarded,
        feedback: "Auto-graded from saved responses against model answers and the marking scheme.",
        graded_at: now,
        auto_graded: true,
      },
    });
    console.log("✅ Assessment grade created");

    await prisma.submission.update({
      where: { submission_id: submissionId },
      data: {
        is_graded: true,
        submission_start_at: now,
      },
    });
    console.log("✅ Submission status updated as graded");

    return NextResponse.json({ message: 'Quiz submitted and auto-graded successfully.' });
  } catch (error) {
    console.error('❌ Auto-grading error:', error);
    return NextResponse.json(
      { message: 'Failed to submit and grade quiz.' },
      { status: 500 }
    );
  }
}
