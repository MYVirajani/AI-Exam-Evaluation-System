// // // src/app/api/results/[studentIndex]/route.ts
// // import { NextResponse } from "next/server";
// // import { prisma } from '@/lib/prisma';

// // export async function GET(
// //   request: Request,
// //   { params }: { params: { studentIndex: string } }
// // ) {
// //   const { studentIndex } = params;

// //   try {
// //     // Get paper results for specific student
// //     const results = await prisma.$queryRaw`
// //       SELECT 
// //         id,
// //         student_index,
// //         module_code,
// //         exam_year,
// //         exam_month,
// //         total_marks,
// //         total_possible,
// //         graded_at
// //       FROM student_paper_results_gemini
// //       WHERE student_index = ${studentIndex}
// //       ORDER BY graded_at DESC
// //     `;

// //     // Get detailed graded answers for the student
// //     const gradedAnswers = await prisma.$queryRaw`
// //       SELECT 
// //         id,
// //         student_index,
// //         module_code,
// //         exam_year,
// //         exam_month,
// //         full_question_id,
// //         mark,
// //         max_marks,
// //         reason,
// //         graded_at,
// //         is_null_answer
// //       FROM graded_student_answers_gemini
// //       WHERE student_index = ${studentIndex}
// //       ORDER BY graded_at DESC
// //     `;

// //     // Format the results
// //     const formattedResults = (results as any[]).map(result => ({
// //       ...result,
// //       id: result.id.toString(),
// //       total_marks: Number(result.total_marks),
// //       total_possible: Number(result.total_possible),
// //       graded_at: result.graded_at.toISOString()
// //     }));

// //     const formattedAnswers = (gradedAnswers as any[]).map(answer => ({
// //       ...answer,
// //       id: answer.id.toString(),
// //       mark: Number(answer.mark),
// //       max_marks: Number(answer.max_marks),
// //       graded_at: answer.graded_at.toISOString(),
// //       is_null_answer: Boolean(answer.is_null_answer)
// //     }));

// //     return NextResponse.json({
// //       results: formattedResults,
// //       gradedAnswers: formattedAnswers
// //     });
// //   } catch (error) {
// //     console.error("Error fetching student data:", error);
// //     return NextResponse.json(
// //       { error: "Failed to fetch student data" },
// //       { status: 500 }
// //     );
// //   }
// // }

// import { NextResponse } from "next/server";
// import { prisma } from '@/lib/prisma';

// export async function GET(
//   request: Request,
//   { params }: { params: { model: string; studentIndex: string } }
// ) {
//   const { model, studentIndex } = params;

//   // Validate model parameter
//   if (!['chatgpt', 'gemini'].includes(model)) {
//     return NextResponse.json(
//       { error: "Invalid model. Must be 'chatgpt' or 'gemini'" },
//       { status: 400 }
//     );
//   }

//   // Map model names to table suffixes
//   const tableMap = {
//     chatgpt: 'openai',
//     gemini: 'gemini'
//   };

//   const tableSuffix = tableMap[model as keyof typeof tableMap];

//   try {
//     // Get paper results for specific student from specific model
//     const results = await prisma.$queryRawUnsafe(`
//       SELECT 
//         id,
//         student_index,
//         module_code,
//         exam_year,
//         exam_month,
//         total_marks,
//         total_possible,
//         graded_at
//       FROM student_paper_results_${tableSuffix}
//       WHERE student_index = $1
//       ORDER BY graded_at DESC
//     `, studentIndex);

//     // Get detailed graded answers for the student from specific model
//     const gradedAnswers = await prisma.$queryRawUnsafe(`
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
//       FROM graded_student_answers_${tableSuffix}
//       WHERE student_index = $1
//       ORDER BY graded_at DESC
//     `, studentIndex);

//     // Format the results
//     const formattedResults = (results as any[]).map(result => ({
//       ...result,
//       id: result.id.toString(),
//       total_marks: Number(result.total_marks),
//       total_possible: Number(result.total_possible),
//       graded_at: result.graded_at.toISOString()
//     }));

//     const formattedAnswers = (gradedAnswers as any[]).map(answer => ({
//       ...answer,
//       id: answer.id.toString(),
//       mark: Number(answer.mark),
//       max_marks: Number(answer.max_marks),
//       graded_at: answer.graded_at.toISOString(),
//       is_null_answer: Boolean(answer.is_null_answer)
//     }));

//     return NextResponse.json({
//       model,
//       studentIndex,
//       results: formattedResults,
//       gradedAnswers: formattedAnswers
//     });
//   } catch (error) {
//     console.error(`Error fetching ${model} student data:`, error);
//     return NextResponse.json(
//       { error: `Failed to fetch ${model} student data` },
//       { status: 500 }
//     );
//   }
// }


// /api/results/[model]/[studentIndex]/route.ts
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { model: string; studentIndex: string } }
) {
  const { model, studentIndex } = params;
  const { searchParams } = new URL(request.url);
  const assessmentId = searchParams.get('assessmentId');

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
    // Build query for paper results
    let resultsQuery = `
      SELECT 
        id,
        student_index,
        module_code,
        exam_year,
        exam_month,
        total_marks,
        total_possible,
        graded_at,
        assessment_id
      FROM student_paper_results_${tableSuffix}
      WHERE student_index = $1
    `;

    const resultsParams = [studentIndex];

    if (assessmentId) {
      resultsQuery += ` AND assessment_id = $2`;
      resultsParams.push(assessmentId);
    }

    resultsQuery += ` ORDER BY graded_at DESC`;

    // Build query for graded answers
    let answersQuery = `
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
        is_null_answer,
        assessment_id,
        submission_id
      FROM graded_student_answers_${tableSuffix}
      WHERE student_index = $1
    `;

    const answersParams = [studentIndex];

    if (assessmentId) {
      answersQuery += ` AND assessment_id = $2`;
      answersParams.push(assessmentId);
    }

    answersQuery += ` ORDER BY graded_at DESC`;

    // Execute both queries
    const [results, gradedAnswers] = await Promise.all([
      prisma.$queryRawUnsafe(resultsQuery, ...resultsParams),
      prisma.$queryRawUnsafe(answersQuery, ...answersParams)
    ]);

    // Format the results
    const formattedResults = (results as any[]).map(result => ({
      ...result,
      id: result.id.toString(),
      total_marks: Number(result.total_marks),
      total_possible: Number(result.total_possible),
      graded_at: result.graded_at.toISOString()
    }));

    const formattedAnswers = (gradedAnswers as any[]).map(answer => ({
      ...answer,
      id: answer.id.toString(),
      mark: Number(answer.mark),
      max_marks: Number(answer.max_marks),
      graded_at: answer.graded_at.toISOString(),
      is_null_answer: Boolean(answer.is_null_answer)
    }));

    return NextResponse.json({
      model,
      studentIndex,
      assessmentId: assessmentId || 'all',
      results: formattedResults,
      gradedAnswers: formattedAnswers
    });
  } catch (error) {
    console.error(`Error fetching ${model} student data:`, error);
    return NextResponse.json(
      { error: `Failed to fetch ${model} student data` },
      { status: 500 }
    );
  }
}