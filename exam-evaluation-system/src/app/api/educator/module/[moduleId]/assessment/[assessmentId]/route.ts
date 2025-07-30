import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: {
      moduleId: string;
      assessmentId: string;
    };
  }
) {
  const { moduleId, assessmentId } = params;
  const educatorId = req.nextUrl.searchParams.get("educatorId");

  if (!educatorId) {
    return NextResponse.json(
      { success: false, message: "Missing educatorId" },
      { status: 400 }
    );
  }

  try {
    // Fetch module details
    const module = await prisma.module.findUnique({
      where: {
        module_id: moduleId,
      },
      select: {
        module_code: true,
        module_name: true,
      },
    });

    if (!module) {
      return NextResponse.json(
        { success: false, message: "Module not found" },
        { status: 404 }
      );
    }

    // Count enrollments
    const enrollmentCount = await prisma.enrollment.count({
      where: {
        module_id: moduleId,
      },
    });

    // Fetch assessment by ID, module, and educator
    const assessment = await prisma.assessment.findFirst({
      where: {
        assessment_id: assessmentId,
        module_id: moduleId,
        created_by: educatorId,
      },
      include: {
        model_answer_paper: {
          select: {
            file_url: true,
          },
        },
        submissions: {
          include: {
            student: {
              select: {
                registration_number: true,
                user_id: true,
              },
            },
            assessment_grade: {
              select: {
                marks_awarded: true,
                total_marks: true,
              },
            },
            question_grades: true,
          },
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, message: "Assessment not found or access denied" },
        { status: 404 }
      );
    }

    // Build response
    const responseData = {
      module,
      enrollmentCount,
      assessments: [
        {
          assessment_id: assessment.assessment_id,
          type: assessment.type,
          title: assessment.title,
          description: assessment.description,
          deadline: assessment.deadline,
          model_answer_paper: assessment.model_answer_paper || null,
          submissions: assessment.submissions.map((sub) => ({
            submission_id: sub.submission_id,
            student: {
              student_id: sub.student.user_id,
              registration_number: sub.student.registration_number,
            },
            file_url: sub.file_url,
            submission_time: sub.submission_time,
            assessment_grade: sub.assessment_grade || null,
            question_grades: sub.question_grades,
          })),
        },
      ],
    };
    console.log("Assessment response data:", JSON.stringify(responseData, null, 2));

    return NextResponse.json(responseData);
  } catch (err) {
    console.error("[GET educator/module/[moduleId]/assessment/[assessmentId]]", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
