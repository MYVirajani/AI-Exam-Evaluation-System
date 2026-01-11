// // src/app/api/student/enrollments/[moduleId]/assessment/[assessmentId]/bubblesheet/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function GET(
//   request: NextRequest,
//   { params }: { params: { moduleId: string; assessmentId: string } }
// ) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const studentId = searchParams.get("studentId");

//     if (!studentId) {
//       return NextResponse.json(
//         { error: "Student ID is required" },
//         { status: 400 }
//       );
//     }

//     const { moduleId, assessmentId } = params;

//     // Get assessment details
//     const assessment = await prisma.assessment.findUnique({
//       where: {
//         assessment_id: assessmentId,
//         module_id: moduleId,
//         type: "bubbleSheet",
//       },
//       include: {
//         question_paper: {
//           select: {
//             file_url: true,
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

//     // Check if student has submitted answers
//     const studentAnswers = await prisma.bubbleSheet_Student_Answer.findMany({
//       where: {
//         student_id: studentId,
//         assessment_id: assessmentId,
//       },
//     });

//     const hasSubmitted = studentAnswers.length > 0;

//     // Get student result if evaluated
//     const result = await prisma.bubbleSheet_Result.findUnique({
//       where: {
//         student_id_assessment_id: {
//           student_id: studentId,
//           assessment_id: assessmentId,
//         },
//       },
//     });

//     // Get answer sheet file path if exists
//     const answerSheetPath = hasSubmitted
//       ? `data/Bubble_Sheets/${assessmentId}/${studentId}.png`
//       : null;

//     return NextResponse.json({
//       module_code: assessment.module.module_code,
//       module_name: assessment.module.module_name,
//       assessment_data: {
//         assessment_id: assessment.assessment_id,
//         type: assessment.type,
//         title: assessment.title,
//         description: assessment.description,
//         deadline: assessment.deadline.toISOString(),
//       },
//       question_paper: assessment.question_paper,
//       has_submitted: hasSubmitted,
//       answer_sheet_url: answerSheetPath,
//       bubblesheet_result: result
//         ? {
//             total_questions: result.total_questions,
//             correct_answers: result.correct_answers,
//             incorrect_answers: result.incorrect_answers,
//             unanswered: result.unanswered,
//             total_marks: result.total_marks.toNumber(),
//             percentage: result.percentage.toNumber(),
//             evaluated_on: result.evaluated_on.toISOString(),
//           }
//         : null,
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

// src/app/api/student/enrollments/[moduleId]/assessment/[assessmentId]/bubblesheet/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string; assessmentId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Await params in Next.js 15+
    const { moduleId, assessmentId } = await params;

    // Get assessment details
    const assessment = await prisma.assessment.findUnique({
      where: {
        assessment_id: assessmentId,
        module_id: moduleId,
        type: "bubbleSheet",
      },
      include: {
        question_paper: {
          select: {
            file_url: true,
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
      return NextResponse.json(
        { error: "Bubble sheet assessment not found" },
        { status: 404 }
      );
    }

    // Check if student has submitted answers
    const studentAnswers = await prisma.bubbleSheet_Student_Answer.findMany({
      where: {
        student_id: studentId,
        assessment_id: assessmentId,
      },
    });

    const hasSubmitted = studentAnswers.length > 0;

    // Get student result if evaluated
    const result = await prisma.bubbleSheet_Result.findUnique({
      where: {
        student_id_assessment_id: {
          student_id: studentId,
          assessment_id: assessmentId,
        },
      },
    });

    // Get answer sheet file path if exists
    const answerSheetPath = hasSubmitted
      ? `data/Bubble_Sheets/${assessmentId}/${studentId}.png`
      : null;

    return NextResponse.json({
      module_code: assessment.module.module_code,
      module_name: assessment.module.module_name,
      assessment_data: {
        assessment_id: assessment.assessment_id,
        type: assessment.type,
        title: assessment.title,
        description: assessment.description,
        deadline: assessment.deadline.toISOString(),
      },
      question_paper: assessment.question_paper,
      has_submitted: hasSubmitted,
      answer_sheet_url: answerSheetPath,
      bubblesheet_result: result
        ? {
            total_questions: result.total_questions,
            correct_answers: result.correct_answers,
            incorrect_answers: result.incorrect_answers,
            unanswered: result.unanswered,
            total_marks: result.total_marks.toNumber(),
            percentage: result.percentage.toNumber(),
            evaluated_on: result.evaluated_on.toISOString(),
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching bubble sheet assessment:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch assessment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}