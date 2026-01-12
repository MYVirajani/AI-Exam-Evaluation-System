import { prisma } from "@/lib/prisma";

interface AssessmentScoreResult {
  score: number;
  max_marks: number;
  status: "Graded" | "Pending";
}

export async function getAssessmentScoreAndMaxMarks(
  submissionId: string,
  assessmentId: string,
  modelId: string
): Promise<AssessmentScoreResult> {
  // 1. Fetch all student answers for status check
  const studentAnswers = await prisma.student_Answer.findMany({
    where: {
      submission_id: submissionId,
      model_id: modelId,
    },
    select: {
      score: true,
    },
  });

  // If at least one score is null OR no answers → Pending
  const status: "Graded" | "Pending" =
    studentAnswers.length === 0 ||
    studentAnswers.some((ans) => ans.score === null)
      ? "Pending"
      : "Graded";

  // 2. Sum of scores
  const scoreAggregate = await prisma.student_Answer.aggregate({
    _sum: {
      score: true,
    },
    where: {
      submission_id: submissionId,
      model_id: modelId,
    },
  });

  // 3. Sum of max marks
  const maxMarksAggregate = await prisma.question.aggregate({
    _sum: {
      max_marks: true,
    },
    where: {
      assessment_id: assessmentId,
      model_id: modelId,
    },
  });

  return {
    score: scoreAggregate._sum.score
      ? Number(scoreAggregate._sum.score)
      : 0,
    max_marks: maxMarksAggregate._sum.max_marks
      ? Number(maxMarksAggregate._sum.max_marks)
      : 0,
    status,
  };
}
