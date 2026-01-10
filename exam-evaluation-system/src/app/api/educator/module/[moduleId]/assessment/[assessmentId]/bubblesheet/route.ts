// // // src/app/api/educator/module/[moduleId]/assessment/[assessmentId]/bubblesheet/route.ts
// // import { NextRequest, NextResponse } from "next/server";
// // import { prisma } from "@/lib/prisma";

// // export async function GET(
// //   request: NextRequest,
// //   { params }: { params: { moduleId: string; assessmentId: string } }
// // ) {
// //   try {
// //     const { searchParams } = new URL(request.url);
// //     const educatorId = searchParams.get("educatorId");

// //     if (!educatorId) {
// //       return NextResponse.json(
// //         { error: "Educator ID is required" },
// //         { status: 400 }
// //       );
// //     }

// //     const { moduleId, assessmentId } = params;

// //     // Get assessment details
// //     const assessment = await prisma.assessment.findUnique({
// //       where: {
// //         assessment_id: assessmentId,
// //         module_id: moduleId,
// //         created_by: educatorId,
// //         type: "bubbleSheet",
// //       },
// //       include: {
// //         question_paper: {
// //           select: {
// //             file_url: true,
// //             created_on: true,
// //           },
// //         },
// //         module: {
// //           select: {
// //             module_code: true,
// //             module_name: true,
// //           },
// //         },
// //       },
// //     });

// //     if (!assessment) {
// //       return NextResponse.json(
// //         { error: "Bubble sheet assessment not found" },
// //         { status: 404 }
// //       );
// //     }

// //     // Get enrollment count
// //     const enrollmentCount = await prisma.enrollment.count({
// //       where: {
// //         module_id: moduleId,
// //       },
// //     });

// //     // Get answer key count
// //     const answerKeyCount = await prisma.bubbleSheet_Answer_Key.count({
// //       where: {
// //         assessment_id: assessmentId,
// //       },
// //     });

// //     // Get count of students who have submitted
// //     const studentSubmissionsCount = await prisma.$queryRaw<
// //       Array<{ count: bigint }>
// //     >`
// //       SELECT COUNT(DISTINCT student_id) as count
// //       FROM "BubbleSheet_Student_Answer"
// //       WHERE assessment_id = ${assessmentId}
// //     `;

// //     const submissionCount = Number(studentSubmissionsCount[0]?.count || 0);

// //     // Get all results with student details
// //     const results = await prisma.bubbleSheet_Result.findMany({
// //       where: {
// //         assessment_id: assessmentId,
// //       },
// //       include: {
// //         student: {
// //           include: {
// //             user: {
// //               select: {
// //                 first_name: true,
// //                 last_name: true,
// //                 email: true,
// //               },
// //             },
// //           },
// //         },
// //       },
// //       orderBy: {
// //         evaluated_on: 'desc',
// //       },
// //     });

// //     return NextResponse.json({
// //       assessment_id: assessment.assessment_id,
// //       type: assessment.type,
// //       title: assessment.title,
// //       description: assessment.description,
// //       deadline: assessment.deadline.toISOString(),
// //       created_on: assessment.created_on.toISOString(),
// //       question_paper: assessment.question_paper,
// //       module: assessment.module,
// //       enrollmentCount,
// //       answer_key_count: answerKeyCount,
// //       student_submissions_count: submissionCount,
// //       results: results.map((result) => ({
// //         student_id: result.student_id,
// //         total_questions: result.total_questions,
// //         correct_answers: result.correct_answers,
// //         incorrect_answers: result.incorrect_answers,
// //         unanswered: result.unanswered,
// //         total_marks: result.total_marks.toNumber(),
// //         percentage: result.percentage.toNumber(),
// //         student: {
// //           user_id: result.student.user_id,
// //           registration_number: result.student.registration_number,
// //           user: result.student.user,
// //         },
// //       })),
// //     });
// //   } catch (error) {
// //     console.error("Error fetching bubble sheet assessment:", error);
// //     return NextResponse.json(
// //       {
// //         error: "Failed to fetch assessment",
// //         details: error instanceof Error ? error.message : "Unknown error",
// //       },
// //       { status: 500 }
// //     );
// //   }
// // }

// // src/app/api/educator/module/[moduleId]/assessment/[assessmentId]/bubblesheet/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function GET(
//   request: NextRequest,
//   { params }: { params: Promise<{ moduleId: string; assessmentId: string }> }
// ) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const educatorId = searchParams.get("educatorId");

//     if (!educatorId) {
//       return NextResponse.json(
//         { error: "Educator ID is required" },
//         { status: 400 }
//       );
//     }

//     // Await params in Next.js 15+
//     const { moduleId, assessmentId } = await params;

//     // Get assessment details
//     const assessment = await prisma.assessment.findUnique({
//       where: {
//         assessment_id: assessmentId,
//         module_id: moduleId,
//         created_by: educatorId,
//         type: "bubbleSheet",
//       },
//       include: {
//         question_paper: {
//           select: {
//             file_url: true,
//             created_on: true,
//           },
//         },
//         module: {
//           select: {
//             module_code: true,
//             module_name: true,
//           },
//         },
//       },
//     });

//     if (!assessment) {
//       return NextResponse.json(
//         { error: "Bubble sheet assessment not found" },
//         { status: 404 }
//       );
//     }

//     // Get enrollment count
//     const enrollmentCount = await prisma.enrollment.count({
//       where: {
//         module_id: moduleId,
//       },
//     });

//     // Get answer key count
//     const answerKeyCount = await prisma.bubbleSheet_Answer_Key.count({
//       where: {
//         assessment_id: assessmentId,
//       },
//     });

//     // Get count of students who have submitted
//     const studentSubmissionsCount = await prisma.$queryRaw<
//       Array<{ count: bigint }>
//     >`
//       SELECT COUNT(DISTINCT student_id) as count
//       FROM "BubbleSheet_Student_Answer"
//       WHERE assessment_id = ${assessmentId}
//     `;

//     const submissionCount = Number(studentSubmissionsCount[0]?.count || 0);

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
//                 first_name: true,
//                 last_name: true,
//                 email: true,
//               },
//             },
//           },
//         },
//       },
//       orderBy: {
//         evaluated_on: 'desc',
//       },
//     });

//     return NextResponse.json({
//       assessment_id: assessment.assessment_id,
//       type: assessment.type,
//       title: assessment.title,
//       description: assessment.description,
//       deadline: assessment.deadline.toISOString(),
//       created_on: assessment.created_on.toISOString(),
//       question_paper: assessment.question_paper,
//       module: assessment.module,
//       enrollmentCount,
//       answer_key_count: answerKeyCount,
//       student_submissions_count: submissionCount,
//       results: results.map((result) => ({
//         student_id: result.student_id,
//         total_questions: result.total_questions,
//         correct_answers: result.correct_answers,
//         incorrect_answers: result.incorrect_answers,
//         unanswered: result.unanswered,
//         total_marks: result.total_marks.toNumber(),
//         percentage: result.percentage.toNumber(),
//         student: {
//           user_id: result.student.user_id,
//           registration_number: result.student.registration_number,
//           user: result.student.user,
//         },
//       })),
//     });
//   } catch (error) {
//     console.error("Error fetching bubble sheet assessment:", error);
//     return NextResponse.json(
//       {
//         error: "Failed to fetch assessment",
//         details: error instanceof Error ? error.message : "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }

// src/app/api/educator/module/[moduleId]/assessment/[assessmentId]/bubblesheet/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string; assessmentId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const educatorId = searchParams.get("educatorId");

    if (!educatorId) {
      return NextResponse.json(
        { error: "Educator ID is required" },
        { status: 400 }
      );
    }

    const { moduleId, assessmentId } = await params;

    console.log("\n" + "=".repeat(60));
    console.log("📋 FETCHING BUBBLESHEET ASSESSMENT DATA");
    console.log("=".repeat(60));
    console.log("Assessment ID:", assessmentId);
    console.log("Module ID:", moduleId);
    console.log("Educator ID:", educatorId);

    // Get assessment details
    const assessment = await prisma.assessment.findUnique({
      where: {
        assessment_id: assessmentId,
        module_id: moduleId,
        created_by: educatorId,
        type: "bubbleSheet",
      },
      include: {
        question_paper: {
          select: {
            file_url: true,
            created_on: true,
          },
        },
        module: {
          select: {
            module_code: true,
            module_name: true,
          },
        },
      },
    });

    if (!assessment) {
      console.error("❌ Assessment not found");
      return NextResponse.json(
        { error: "Bubble sheet assessment not found" },
        { status: 404 }
      );
    }

    console.log("✅ Assessment found:", assessment.title);

    // Get enrollment count
    const enrollmentCount = await prisma.enrollment.count({
      where: {
        module_id: moduleId,
      },
    });
    console.log("👥 Enrolled students:", enrollmentCount);

    // Get answer key count
    const answerKeyCount = await prisma.bubbleSheet_Answer_Key.count({
      where: {
        assessment_id: assessmentId,
      },
    });
    console.log("🔑 Answer keys:", answerKeyCount);

    // Get list of students who have submitted answers
    const studentSubmissions = await prisma.$queryRaw<
      Array<{ student_id: string }>
    >`
      SELECT DISTINCT student_id
      FROM "BubbleSheet_Student_Answer"
      WHERE assessment_id = ${assessmentId}
    `;

    const submittedStudentIds = studentSubmissions.map((s) => s.student_id);
    console.log("📝 Students who submitted:", submittedStudentIds.length);

    // Get student details for those who submitted
    const studentsWhoSubmitted = await prisma.student.findMany({
      where: {
        user_id: {
          in: submittedStudentIds,
        },
      },
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
    });

    console.log("✅ Fetched student details:", studentsWhoSubmitted.length);

    // Get all evaluation results
    const results = await prisma.bubbleSheet_Result.findMany({
      where: {
        assessment_id: assessmentId,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        evaluated_on: 'desc',
      },
    });

    console.log("📊 Evaluation results:", results.length);

    // Create a map of results by student_id for quick lookup
    const resultsMap = new Map(results.map((r) => [r.student_id, r]));

    // Combine submissions with results
    const studentList = studentsWhoSubmitted.map((student) => {
      const result = resultsMap.get(student.user_id);

      return {
        student_id: student.user_id,
        registration_number: student.registration_number,
        user: student.user,
        has_submitted: true,
        is_evaluated: !!result,
        result: result
          ? {
              total_questions: result.total_questions,
              correct_answers: result.correct_answers,
              incorrect_answers: result.incorrect_answers,
              unanswered: result.unanswered,
              total_marks: result.total_marks.toNumber(),
              percentage: result.percentage.toNumber(),
            }
          : null,
      };
    });

    console.log("✅ Combined student list created");
    console.log("=".repeat(60) + "\n");

    return NextResponse.json({
      assessment_id: assessment.assessment_id,
      type: assessment.type,
      title: assessment.title,
      description: assessment.description,
      deadline: assessment.deadline.toISOString(),
      created_on: assessment.created_on.toISOString(),
      question_paper: assessment.question_paper,
      module: assessment.module,
      enrollmentCount,
      answer_key_count: answerKeyCount,
      student_submissions_count: submittedStudentIds.length,
      students: studentList, // List of students who submitted
      results: results.map((result) => ({
        student_id: result.student_id,
        total_questions: result.total_questions,
        correct_answers: result.correct_answers,
        incorrect_answers: result.incorrect_answers,
        unanswered: result.unanswered,
        total_marks: result.total_marks.toNumber(),
        percentage: result.percentage.toNumber(),
        student: {
          user_id: result.student.user_id,
          registration_number: result.student.registration_number,
          user: result.student.user,
        },
      })),
    });
  } catch (error) {
    console.error("\n❌ ERROR FETCHING BUBBLESHEET ASSESSMENT");
    console.error("=".repeat(60));
    console.error("Error:", error);
    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
    console.error("=".repeat(60) + "\n");

    return NextResponse.json(
      {
        error: "Failed to fetch assessment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}