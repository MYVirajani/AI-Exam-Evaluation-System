// src/app/api/educator/[educatorId]/dashboard/route.ts

import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { educatorId: string } }
) {
  const { educatorId } = await params;

  try {
    console.log("Fetching dashboard for educatorId:", educatorId);

    // Check if educator exists
    const educator = await prisma.educator.findUnique({
      where: { user_id: educatorId },
    });

    if (!educator) {
      console.log("Educator not found for user_id:", educatorId);
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const modules = await prisma.module.findMany({
      where: { created_by: educatorId },
      select: {
        module_id: true,
        module_code: true,
        module_name: true,
        semester: true,
        education_institute: true,
        max_enrollments: true,
        learning_outcomes: true,
        enrollment_key: true,
        module_image_url: true,
      },
    });

    const assessments = await prisma.assessment.findMany({
      where: { created_by: educatorId },
      select: {
        assessment_id: true,
        type: true,
        title: true,
        description: true,
        deadline: true,
        module_id: true,
        question_paper_id: true,
        model_answer_paper_id: true,
        marking_scheme_id: true,
      },
    });

    console.log(
      `Fetched ${modules.length} modules and ${assessments.length} assessments for educatorId:`,
      educatorId
    );

    return NextResponse.json({ modules, assessments });
  } catch (err) {
    console.error("Error fetching educator dashboard:", err);
    return NextResponse.json(
      { error: "Failed to load modules and assessments" },
      { status: 500 }
    );
  }
}
