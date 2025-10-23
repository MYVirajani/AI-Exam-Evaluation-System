// // // src/app/api/results/route.ts
// // import { NextResponse } from "next/server";
// // import { prisma } from '@/lib/prisma';

// // export async function GET(request: Request) {
// //   try {
// //     // Use raw SQL query since these tables are not in the Prisma schema
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
// //       ORDER BY graded_at DESC
// //     `;

// //     // Convert BigInt to number and format dates
// //     const formattedResults = (results as any[]).map(result => ({
// //       ...result,
// //       id: result.id.toString(),
// //       total_marks: Number(result.total_marks),
// //       total_possible: Number(result.total_possible),
// //       graded_at: result.graded_at.toISOString()
// //     }));

// //     return NextResponse.json(formattedResults);
// //   } catch (error) {
// //     console.error("Error fetching results:", error);
// //     return NextResponse.json(
// //       { error: "Failed to fetch results" },
// //       { status: 500 }
// //     );
// //   }
// // }

// import { NextResponse } from "next/server";
// import { prisma } from '@/lib/prisma';

// export async function GET(
//   request: Request,
//   { params }: { params: { model: string } }
// ) {
//   const { model } = params;

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
//     // Use raw SQL query with dynamic table name
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
//       ORDER BY graded_at DESC
//     `);

//     // Convert BigInt to number and format dates
//     const formattedResults = (results as any[]).map(result => ({
//       ...result,
//       id: result.id.toString(),
//       total_marks: Number(result.total_marks),
//       total_possible: Number(result.total_possible),
//       graded_at: result.graded_at.toISOString()
//     }));

//     return NextResponse.json(formattedResults);
//   } catch (error) {
//     console.error(`Error fetching ${model} results:`, error);
//     return NextResponse.json(
//       { error: `Failed to fetch ${model} results` },
//       { status: 500 }
//     );
//   }
// }

// /api/results/[model]/route.ts
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { model: string } }
) {
  const { model } = params;
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
    let query = `
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
    `;

    const params: any[] = [];

    // Add filtering if assessmentId is provided
    if (assessmentId) {
      query += ` WHERE assessment_id = $1`;
      params.push(assessmentId);
    }

    query += ` ORDER BY graded_at DESC`;

    const results = await prisma.$queryRawUnsafe(query, ...params);

    // Convert BigInt to number and format dates
    const formattedResults = (results as any[]).map(result => ({
      ...result,
      id: result.id.toString(),
      total_marks: Number(result.total_marks),
      total_possible: Number(result.total_possible),
      graded_at: result.graded_at.toISOString()
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