// // src/app/api/graded-answers/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from '@/lib/prisma';

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const studentIndex = searchParams.get('student_index');

//   try {
//     let query = `
//       SELECT 
//         id,
//         student_index,
//         module_code,
//         exam_year,
//         exam_month,
//         full_question_id,
//         mark,
//         max_marks,
//         reason,
//         graded_at,
//         is_null_answer
//       FROM graded_student_answers_gemini
//     `;

//     const params: any[] = [];

//     // Add filtering if student_index is provided
//     if (studentIndex) {
//       query += ` WHERE student_index ILIKE $1`;
//       params.push(`%${studentIndex}%`);
//     }

//     query += ` ORDER BY graded_at DESC`;

//     const gradedAnswers = await prisma.$queryRawUnsafe(query, ...params);

//     // Convert BigInt to number and format dates
//     const formattedAnswers = (gradedAnswers as any[]).map(answer => ({
//       ...answer,
//       id: answer.id.toString(),
//       mark: Number(answer.mark),
//       max_marks: Number(answer.max_marks),
//       graded_at: answer.graded_at.toISOString(),
//       is_null_answer: Boolean(answer.is_null_answer)
//     }));

//     return NextResponse.json(formattedAnswers);
//   } catch (error) {
//     console.error("Error fetching graded answers:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch graded answers" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { model: string } }
) {
  const { model } = params;
  const { searchParams } = new URL(request.url);
  const studentIndex = searchParams.get('student_index');

  // Validate model parameter
  if (!['chatgpt', 'gemini'].includes(model)) {
    return NextResponse.json(
      { error: "Invalid model. Must be 'chatgpt' or 'gemini'" },
      { status: 400 }
    );
  }

  // Map model names to table suffixes
  const tableMap = {
    chatgpt: 'openai',
    gemini: 'gemini'
  };

  const tableSuffix = tableMap[model as keyof typeof tableMap];

  try {
    let query = `
      SELECT 
        id,
        student_index,
        module_code,
        exam_year,
        exam_month,
        full_question_id,
        mark,
        max_marks,
        reason,
        graded_at,
        is_null_answer
      FROM graded_student_answers_${tableSuffix}
    `;

    const params: any[] = [];

    // Add filtering if student_index is provided
    if (studentIndex) {
      query += ` WHERE student_index ILIKE $1`;
      params.push(`%${studentIndex}%`);
    }

    query += ` ORDER BY graded_at DESC`;

    const gradedAnswers = await prisma.$queryRawUnsafe(query, ...params);

    // Convert BigInt to number and format dates
    const formattedAnswers = (gradedAnswers as any[]).map(answer => ({
      ...answer,
      id: answer.id.toString(),
      mark: Number(answer.mark),
      max_marks: Number(answer.max_marks),
      graded_at: answer.graded_at.toISOString(),
      is_null_answer: Boolean(answer.is_null_answer)
    }));

    return NextResponse.json(formattedAnswers);
  } catch (error) {
    console.error(`Error fetching ${model} graded answers:`, error);
    return NextResponse.json(
      { error: `Failed to fetch ${model} graded answers` },
      { status: 500 }
    );
  }
}
