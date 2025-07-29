import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { moduleId: string; assessmentId: string } }
) {
  try {
    const educatorId = request.nextUrl.searchParams.get("educatorId");
    const { moduleId, assessmentId } =  params;

    if (!educatorId) {
      return NextResponse.json(
        { error: "Missing educatorId in query parameters" },
        { status: 400 }
      );
    }

    const assessment = await prisma.assessment.findFirst({
      where: {
        assessment_id: assessmentId,
        module_id: moduleId,
        created_by: educatorId,
      },
      include: {
        module: true,
        question_paper: {
          include: {
            questions: true,
          },
        },
        model_answer_paper: true,
        marking_scheme: true,
        submissions: {
          include: {
            student: {
              include: {
                user: true,
              },
            },
            question_grades: true,
            assessment_grade: true,
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found or unauthorized" },
        { status: 404 }
      );
    }

    // Count the enrollments for the module
    const enrollmentCount = await prisma.enrollment.count({
      where: {
        module_id: moduleId,
      },
    });

    // Extract module_code
    const moduleCode = assessment.module?.module_code ?? null;

    const responsePayload = {
      ...assessment,
      enrollmentCount,
      moduleCode,
    };

    // Log the response to console
    console.log("[GET /assessment RESPONSE]:", responsePayload);

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (error) {
    console.error("[GET_ASSESSMENT_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
