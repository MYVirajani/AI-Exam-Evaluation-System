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

    // Convert Decimal -> number safely and attach cents for DP
    const normalized = questions.map(q => {
      const marksNum = Number(q.marks_allowed ?? 0);
      return {
        ...q,
        _marksCents: toCents(marksNum),
      };
    });

    // Optional shuffle
    const shuffledOrNot = assessment.shuffle_questions ? shuffleArray(normalized) : normalized;

    const hasCount = typeof assessment.question_count === "number" && assessment.question_count > 0;
    const hasMax = assessment.max_marks !== null && assessment.max_marks !== undefined;

    let finalQuestions = shuffledOrNot;

    if (hasCount || hasMax) {
      const count = hasCount ? assessment.question_count! : undefined;
      const sumCents = hasMax ? toCents(Number(assessment.max_marks)) : undefined;

      // Selection logic
      let selected: typeof normalized | null = null;

      if (hasCount && hasMax) {
        selected = findSubsetByCountAndSum(shuffledOrNot, count!, sumCents!);
        if (!selected) {
          return NextResponse.json(
            { message: `No combination of ${count} questions sums exactly to max_marks=${Number(assessment.max_marks).toFixed(2)}.` },
            { status: 422 }
          );
        }
      } else if (hasCount && !hasMax) {
        if (count! > shuffledOrNot.length) {
          return NextResponse.json(
            { message: `Requested question_count=${count} exceeds available questions=${shuffledOrNot.length}.` },
            { status: 422 }
          );
        }
        selected = shuffledOrNot.slice(0, count!);
      } else if (!hasCount && hasMax) {
        selected = findSubsetBySum(shuffledOrNot, sumCents!);
        if (!selected) {
          return NextResponse.json(
            { message: `No subset of questions sums exactly to max_marks=${Number(assessment.max_marks).toFixed(2)}.` },
            { status: 422 }
          );
        }
      }

      finalQuestions = selected!;
    }

    // Strip helper fields before sending
    const cleanedQuestions = finalQuestions.map(({ _marksCents, ...rest }) => rest);

    const responsePayload = {
      assessmentId: assessment.assessment_id,
      title: assessment.title,
      duration: assessment.duration,
      module_code: assessment.module.module_code,
      module_name: assessment.module.module_name,
      started_at: submission.submission_start_at,
      shuffle_questions: assessment.shuffle_questions,
      max_marks: assessment.max_marks,        // echoing from assessment
      question_count: assessment.question_count, // echoing from assessment
      questions: cleanedQuestions,
    };

    console.log("📦 Quiz Questions API Response:", JSON.stringify(responsePayload, null, 2));
    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("❌ Error fetching quiz questions:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

// ---------- Utilities ----------

// Exact subset with fixed count and sum (in cents)
function findSubsetByCountAndSum<T extends { _marksCents: number }>(
  items: T[],
  k: number,
  target: number
): T[] | null {
  // dp[c] is a Map<sum, indices[]>
  const dp: Array<Map<number, number[]>> = Array.from({ length: k + 1 }, () => new Map());
  dp[0].set(0, []);

  for (let i = 0; i < items.length; i++) {
    const w = items[i]._marksCents;
    // iterate counts backwards to avoid reuse
    for (let c = Math.min(i + 1, k); c >= 1; c--) {
      for (const [sum, idxs] of dp[c - 1]) {
        const newSum = sum + w;
        if (!dp[c].has(newSum)) {
          dp[c].set(newSum, [...idxs, i]);
        }
      }
    }
  }

  const picked = dp[k].get(target);
  if (!picked) return null;
  return picked.map(i => items[i]);
}

// Exact subset with any count but exact sum (in cents)
function findSubsetBySum<T extends { _marksCents: number }>(
  items: T[],
  target: number
): T[] | null {
  // map sum -> indices[]
  let dp = new Map<number, number[]>();
  dp.set(0, []);

  for (let i = 0; i < items.length; i++) {
    const w = items[i]._marksCents;
    const next = new Map(dp);
    for (const [sum, idxs] of dp) {
      const newSum = sum + w;
      if (!next.has(newSum)) next.set(newSum, [...idxs, i]);
    }
    dp = next;
  }

  const picked = dp.get(target);
  if (!picked) return null;
  return picked.map(i => items[i]);
}

// Convert marks to integer cents to avoid float issues
function toCents(n: number): number {
  // safeguards for 2dp decimals: 12.30 -> 1230
  return Math.round(n * 100);
}

// Fisher–Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
