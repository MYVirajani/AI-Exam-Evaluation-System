import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  toCents,
  shuffleArray,
  findSubsetByCountAndSum,
  findSubsetBySum,
  normalizeWithCents,
  stripHelperField,
} from "@/lib/quiz-utils";

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
        module: { select: { module_code: true, module_name: true } },
      },
    });

    if (!assessment) {
      return NextResponse.json({ message: "Assessment not found" }, { status: 404 });
    }

    // Fetch quiz submission for this student attempt
    const submission = await prisma.submission.findUnique({
      where: { submission_id: submissionId },
      select: { submission_start_at: true },
    });

    if (!submission) {
      return NextResponse.json({ message: "Submission not found" }, { status: 404 });
    }

    // Fetch questions
    const questions = await prisma.question.findMany({
      where: { assessment_id: assessmentId },
      select: {
        question_id: true,
        type: true,
        question_number: true,
        question: true,
        mcq_answer_options: true,
        marks_allowed: true, // Decimal(5,2)
      },
    });

    // Normalize with cents
    const normalized = normalizeWithCents(
      questions.map(q => ({ ...q, marks_allowed: Number(q.marks_allowed ?? 0) }))
    );

    // Optional shuffle
    const shuffledOrNot = assessment.shuffle_questions ? shuffleArray(normalized) : normalized;

    const hasCount =
      typeof assessment.question_count === "number" && assessment.question_count > 0;
    const hasMax = assessment.max_marks !== null && assessment.max_marks !== undefined;

    let finalQuestions = shuffledOrNot;

    if (hasCount || hasMax) {
      const count = hasCount ? assessment.question_count! : undefined;
      const sumCents = hasMax ? toCents(Number(assessment.max_marks)) : undefined;

      let selected: typeof normalized | null = null;

      if (hasCount && hasMax) {
        selected = findSubsetByCountAndSum(shuffledOrNot, count!, sumCents!);
        if (!selected) {
          return NextResponse.json(
            {
              message: `No combination of ${count} questions sums exactly to max_marks=${Number(
                assessment.max_marks
              ).toFixed(2)}.`,
            },
            { status: 422 }
          );
        }
      } else if (hasCount && !hasMax) {
        if (count! > shuffledOrNot.length) {
          return NextResponse.json(
            {
              message: `Requested question_count=${count} exceeds available questions=${shuffledOrNot.length}.`,
            },
            { status: 422 }
          );
        }
        selected = shuffledOrNot.slice(0, count!);
      } else if (!hasCount && hasMax) {
        selected = findSubsetBySum(shuffledOrNot, sumCents!);
        if (!selected) {
          return NextResponse.json(
            {
              message: `No subset of questions sums exactly to max_marks=${Number(
                assessment.max_marks
              ).toFixed(2)}.`,
            },
            { status: 422 }
          );
        }
      }

      finalQuestions = selected!;
    }

    const cleanedQuestions = stripHelperField(finalQuestions);

    const responsePayload = {
      assessmentId: assessment.assessment_id,
      title: assessment.title,
      duration: assessment.duration,
      module_code: assessment.module.module_code,
      module_name: assessment.module.module_name,
      started_at: submission.submission_start_at,
      shuffle_questions: assessment.shuffle_questions,
      max_marks: assessment.max_marks,
      question_count: assessment.question_count,
      questions: cleanedQuestions,
    };

    console.log("📦 Quiz Questions API Response:", JSON.stringify(responsePayload, null, 2));
    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("❌ Error fetching quiz questions:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
