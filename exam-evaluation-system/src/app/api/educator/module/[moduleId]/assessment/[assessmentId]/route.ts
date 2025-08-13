// src/app/api/educator/module/[moduleId]/assessment/[assessmentId]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    const moduleData = await prisma.module.findUnique({
      where: { module_id: moduleId },
      select: {
        module_code: true,
        module_name: true,
      },
    });

    if (!moduleData) {
      return NextResponse.json(
        { success: false, message: "Module not found" },
        { status: 404 }
      );
    }

    // Count enrollments
    const enrollmentCount = await prisma.enrollment.count({
      where: { module_id: moduleId },
    });

    // Fetch full assessment data (all fields + relations)
    const assessment = await prisma.assessment.findFirst({
      where: {
        assessment_id: assessmentId,
        module_id: moduleId,
        created_by: educatorId,
      },
      include: {
        module: true,
        educator: true,
        question_paper: true,
        model_answer_paper: true,
        marking_scheme: true,
        questions: {
          orderBy: { question_number: 'asc' },
        },
        submissions: {
          include: {
            student: {
              select: {
                registration_number: true,
                user_id: true,
              },
            },
            grade: true,
            q_grades: true,
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

    // Debug logging for questions
    console.log("Fetched Questions:");
    assessment.questions.forEach((q, index) => {
      console.log(`  Q${index + 1}:`);
      console.log(`    ID: ${q.question_id}`);
      console.log(`    Type: ${q.type}`);
      console.log(`    Question Number: ${q.question_number}`);
      console.log(`    Question Text: ${q.question}`);
      console.log(`    Marks Allowed: ${q.marks_allowed}`);
      console.log(`    Model Answer: ${q.model_answer}`);
      console.log(`    MCQ Options: ${JSON.stringify(q.mcq_answer_options)}`);
    });

    // Build response with all assessment fields
    const responseData = {
      module: moduleData,
      enrollmentCount,
      assessment, // includes all fields + relations
    };

    console.log("Assessment response data (full):", JSON.stringify(responseData, null, 2));

    return NextResponse.json(responseData);
  } catch (err) {
    console.error("[GET educator/module/[moduleId]/assessment/[assessmentId]]", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
