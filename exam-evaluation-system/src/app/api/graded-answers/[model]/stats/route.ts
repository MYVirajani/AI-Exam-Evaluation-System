// // src/app/api/graded-answers/stats/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from '@/lib/prisma';

// export async function GET() {
//   try {
//     // Get statistics about graded answers
//     const stats = await prisma.$queryRaw`
//       SELECT 
//         COUNT(*) as total_answers,
//         COUNT(DISTINCT student_index) as unique_students,
//         COUNT(DISTINCT module_code) as unique_modules,
//         AVG(mark::numeric / max_marks::numeric * 100) as average_percentage,
//         MIN(mark::numeric / max_marks::numeric * 100) as min_percentage,
//         MAX(mark::numeric / max_marks::numeric * 100) as max_percentage
//       FROM graded_student_answers_gemini
//       WHERE max_marks > 0
//     `;

//     const formattedStats = (stats as any[])[0];
    
//     return NextResponse.json({
//       total_answers: Number(formattedStats.total_answers),
//       unique_students: Number(formattedStats.unique_students),
//       unique_modules: Number(formattedStats.unique_modules),
//       average_percentage: formattedStats.average_percentage ? Number(formattedStats.average_percentage) : 0,
//       min_percentage: formattedStats.min_percentage ? Number(formattedStats.min_percentage) : 0,
//       max_percentage: formattedStats.max_percentage ? Number(formattedStats.max_percentage) : 0
//     });
//   } catch (error) {
//     console.error("Error fetching stats:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch statistics" },
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
    // Get statistics about graded answers for the specific model
    const stats = await prisma.$queryRawUnsafe(`
      SELECT 
        COUNT(*) as total_answers,
        COUNT(DISTINCT student_index) as unique_students,
        COUNT(DISTINCT module_code) as unique_modules,
        AVG(mark::numeric / max_marks::numeric * 100) as average_percentage,
        MIN(mark::numeric / max_marks::numeric * 100) as min_percentage,
        MAX(mark::numeric / max_marks::numeric * 100) as max_percentage
      FROM graded_student_answers_${tableSuffix}
      WHERE max_marks > 0
    `);

    const formattedStats = (stats as any[])[0];
    
    return NextResponse.json({
      model,
      total_answers: Number(formattedStats.total_answers),
      unique_students: Number(formattedStats.unique_students),
      unique_modules: Number(formattedStats.unique_modules),
      average_percentage: formattedStats.average_percentage ? Number(formattedStats.average_percentage) : 0,
      min_percentage: formattedStats.min_percentage ? Number(formattedStats.min_percentage) : 0,
      max_percentage: formattedStats.max_percentage ? Number(formattedStats.max_percentage) : 0
    });
  } catch (error) {
    console.error(`Error fetching ${model} stats:`, error);
    return NextResponse.json(
      { error: `Failed to fetch ${model} statistics` },
      { status: 500 }
    );
  }
}