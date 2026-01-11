// // src/app/api/educator/bubblesheet/results/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const assessmentId = searchParams.get("assessmentId");
//     const educatorId = searchParams.get("educatorId");

//     console.log("\n" + "=".repeat(60));
//     console.log("📊 FETCHING BUBBLESHEET RESULTS");
//     console.log("=".repeat(60));
//     console.log("Assessment ID:", assessmentId);
//     console.log("Educator ID:", educatorId);

//     if (!assessmentId || !educatorId) {
//       console.error("❌ Missing required parameters");
//       return NextResponse.json(
//         { error: "Assessment ID and Educator ID are required" },
//         { status: 400 }
//       );
//     }

//     // Verify the assessment belongs to this educator
//     const assessment = await prisma.assessment.findFirst({
//       where: {
//         assessment_id: assessmentId,
//         created_by: educatorId,
//         type: "bubbleSheet",
//       },
//       select: {
//         assessment_id: true,
//         title: true,
//         module: {
//           select: {
//             module_code: true,
//             module_name: true,
//           },
//         },
//       },
//     });

//     if (!assessment) {
//       console.error("❌ Assessment not found or unauthorized");
//       return NextResponse.json(
//         { error: "Assessment not found or you don't have permission to view it" },
//         { status: 404 }
//       );
//     }

//     console.log("✅ Assessment found:", assessment.title);

//     // Get all results with student details
//     const results = await prisma.bubbleSheet_Result.findMany({
//       where: {
//         assessment_id: assessmentId,
//       },
//       include: {
//         student: {
//           include: {
//             user: {
//               select: {
//                 user_id: true,
//                 first_name: true,
//                 last_name: true,
//                 email: true,
//               },
//             },
//           },
//         },
//       },
//       orderBy: {
//         percentage: 'desc', // Sort by highest score first
//       },
//     });

//     console.log("📊 Found results:", results.length);

//     // Format the results
//     const formattedResults = results.map((result) => ({
//       student_id: result.student_id,
//       registration_number: result.student.registration_number,
//       name: `${result.student.user.first_name} ${result.student.user.last_name}`,
//       email: result.student.user.email,
//       total_questions: result.total_questions,
//       correct_answers: result.correct_answers,
//       incorrect_answers: result.incorrect_answers,
//       unanswered: result.unanswered,
//       total_marks: result.total_marks.toNumber(),
//       percentage: result.percentage.toNumber(),
//       evaluated_on: result.evaluated_on.toISOString(),
//     }));

//     console.log("✅ Results formatted successfully");
//     console.log("=".repeat(60) + "\n");

//     return NextResponse.json({
//       success: true,
//       assessment: {
//         id: assessment.assessment_id,
//         title: assessment.title,
//         module_code: assessment.module.module_code,
//         module_name: assessment.module.module_name,
//       },
//       results: formattedResults,
//       total_students: results.length,
//     });
//   } catch (error) {
//     console.error("\n❌ ERROR FETCHING BUBBLESHEET RESULTS");
//     console.error("=".repeat(60));
//     console.error("Error:", error);
//     if (error instanceof Error) {
//       console.error("Message:", error.message);
//       console.error("Stack:", error.stack);
//     }
//     console.error("=".repeat(60) + "\n");

//     return NextResponse.json(
//       {
//         error: "Failed to fetch results",
//         details: error instanceof Error ? error.message : "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }

// src/app/api/educator/bubblesheet/results/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get("assessmentId");
    const educatorId = searchParams.get("educatorId");

    console.log("\n" + "=".repeat(60));
    console.log("📊 FETCHING BUBBLESHEET RESULTS");
    console.log("=".repeat(60));
    console.log("Assessment ID:", assessmentId);
    console.log("Educator ID:", educatorId);

    if (!assessmentId || !educatorId) {
      console.error("❌ Missing required parameters");
      return NextResponse.json(
        { error: "Assessment ID and Educator ID are required" },
        { status: 400 }
      );
    }

    // Verify the assessment belongs to this educator
    const assessment = await prisma.assessment.findFirst({
      where: {
        assessment_id: assessmentId,
        created_by: educatorId,
        type: "bubbleSheet",
      },
      select: {
        assessment_id: true,
        title: true,
        module: {
          select: {
            module_code: true,
            module_name: true,
          },
        },
      },
    });

    if (!assessment) {
      console.error("❌ Assessment not found or unauthorized");
      return NextResponse.json(
        { error: "Assessment not found or you don't have permission to view it" },
        { status: 404 }
      );
    }

    console.log("✅ Assessment found:", assessment.title);

    // Get all results with student details
    const results = await prisma.bubbleSheet_Result.findMany({
      where: {
        assessment_id: assessmentId,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                user_id: true,
                first_name: true,
                last_name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        percentage: 'desc', // Sort by highest score first
      },
    });

    console.log("📊 Found results:", results.length);

    // Format the results
    const formattedResults = results.map((result) => ({
      student_id: result.student_id,
      registration_number: result.student.registration_number,
      name: `${result.student.user.first_name} ${result.student.user.last_name}`,
      email: result.student.user.email,
      total_questions: result.total_questions,
      correct_answers: result.correct_answers,
      incorrect_answers: result.incorrect_answers,
      unanswered: result.unanswered,
      total_marks: result.total_marks.toNumber(),
      percentage: result.percentage.toNumber(),
      evaluated_on: result.evaluated_on.toISOString(),
    }));

    console.log("✅ Results formatted successfully");
    console.log("=".repeat(60) + "\n");

    // Calculate distribution data for charts
    const distribution = {
      grade_ranges: {
        'A (75-100%)': 0,
        'B (65-74%)': 0,
        'C (55-64%)': 0,
        'D (50-54%)': 0,
        'F (0-49%)': 0,
      },
      score_ranges: {} as Record<string, number>,
    };

    // Calculate grade distribution
    results.forEach((result) => {
      const percentage = result.percentage.toNumber();
      if (percentage >= 75) distribution.grade_ranges['A (75-100%)']++;
      else if (percentage >= 65) distribution.grade_ranges['B (65-74%)']++;
      else if (percentage >= 55) distribution.grade_ranges['C (55-64%)']++;
      else if (percentage >= 50) distribution.grade_ranges['D (50-54%)']++;
      else distribution.grade_ranges['F (0-49%)']++;

      // Score ranges (0-10, 11-20, etc.)
      const scoreRange = Math.floor(percentage / 10) * 10;
      const rangeKey = `${scoreRange}-${scoreRange + 9}%`;
      distribution.score_ranges[rangeKey] = (distribution.score_ranges[rangeKey] || 0) + 1;
    });

    console.log("✅ Distribution calculated");

    return NextResponse.json({
      success: true,
      assessment: {
        id: assessment.assessment_id,
        title: assessment.title,
        module_code: assessment.module.module_code,
        module_name: assessment.module.module_name,
      },
      results: formattedResults,
      total_students: results.length,
      distribution,
    });
  } catch (error) {
    console.error("\n❌ ERROR FETCHING BUBBLESHEET RESULTS");
    console.error("=".repeat(60));
    console.error("Error:", error);
    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
    console.error("=".repeat(60) + "\n");

    return NextResponse.json(
      {
        error: "Failed to fetch results",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}