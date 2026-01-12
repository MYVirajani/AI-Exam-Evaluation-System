// app/api/ai-results/[model]/route.ts
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { model: string } }
) {
  const { model } = params;
  const { searchParams } = new URL(request.url);
  const studentIndex = searchParams.get('student_index');
  const assessmentId = searchParams.get('assessment_id');

  // Validate model parameter
  if (!['openai', 'gemini'].includes(model)) {
    return NextResponse.json(
      { error: "Invalid model. Must be 'openai' or 'gemini'" },
      { status: 400 }
    );
  }

  if (!studentIndex || !assessmentId) {
    return NextResponse.json(
      { error: "student_index and assessment_id are required" },
      { status: 400 }
    );
  }

  try {
    let results;

    if (model === 'openai') {
      results = await prisma.student_paper_results_openai.findMany({
        where: {
          student_index: studentIndex,
          assessment_id: assessmentId,
        },
        orderBy: {
          graded_at: 'desc'
        }
      });
    } else {
      results = await prisma.student_paper_results_gemini.findMany({
        where: {
          student_index: studentIndex,
          assessment_id: assessmentId,
        },
        orderBy: {
          graded_at: 'desc'
        }
      });
    }

    // Convert to plain objects and format
    const formattedResults = results.map(result => ({
      id: result.id,
      student_index: result.student_index,
      module_code: result.module_code,
      exam_year: result.exam_year,
      exam_month: result.exam_month,
      total_marks: Number(result.total_marks),
      total_possible: Number(result.total_possible),
      graded_at: result.graded_at.toISOString(),
      assessment_id: result.assessment_id
    }));

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error(`Error fetching ${model} results:`, error);
    return NextResponse.json(
      { error: `Failed to fetch ${model} results` },
      { status: 500 }
    );
  }
}