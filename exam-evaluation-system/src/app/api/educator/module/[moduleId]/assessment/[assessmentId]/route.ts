// api\educator\module\[moduleId]\assessment\[assessmentId]\route.ts
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAssessmentScoreAndMaxMarks } from "@/utils/calculateSubmissionScore";

// ---------------------------------------------------------
// GET
// ---------------------------------------------------------
export async function GET(
  req: NextRequest,
  ctx: {
    params: Promise<{
      moduleId: string;
      assessmentId: string;
    }>;
  }
) {
  try {
    const { moduleId, assessmentId } = await ctx.params;
    const educatorId = req.nextUrl.searchParams.get("educatorId");

    if (!educatorId) {
      return NextResponse.json(
        { success: false, message: "Missing educatorId" },
        { status: 400 }
      );
    }

    // ----------------- 1. SUBSCRIPTIONS -----------------
    const activeSubscriptions = await prisma.subscription.findMany({
      where: { educator_id: educatorId, status: "ACTIVE" },
      include: {
        pricing_plan: {
          include: { evaluation_model: true },
        },
      },
    });

    const evaluationModels =
      activeSubscriptions
        .map((sub) => sub.pricing_plan?.evaluation_model)
        .filter(Boolean) || [];

    // ----------------- 2. MODULE DATA -----------------
    const moduleData = await prisma.module.findUnique({
      where: { module_id: moduleId },
      select: {
        module_id: true,
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

    const enrollmentCount = await prisma.enrollment.count({
      where: { module_id: moduleId },
    });

    // ----------------- 3. ASSESSMENT -----------------
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
        submissions: {
          select: {
            submission_id: true,
            student_id: true,
            type: true,
            submission_start_at: true,
            submission_end_at: true,
            file_url: true,
            media_extracted_file_url: true,
            ip_address: true,
            student: {
              select: {
                user_id: true,
                registration_number: true,
                user: {
                  select: {
                    first_name: true,
                    last_name: true,
                    email: true,
                    profile_image_url: true,
                  },
                },
              },
            },
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

    // ----------------- 4. QUESTIONS + MEDIA -----------------
    const questions = await prisma.question.findMany({
      where: { assessment_id: assessmentId },
      include: { media: true },
      orderBy: { question_number: "asc" },
    });

    // ----------------- 5. CALCULATE GRADES + STATUS -----------------
    const finalSubmissions = await Promise.all(
      assessment.submissions.map(async (sub) => {
        const grades = await Promise.all(
          evaluationModels.map(async (model) => {
            const { score, max_marks, status } =
              await getAssessmentScoreAndMaxMarks(
                sub.submission_id,
                assessmentId,
                model.id
              );

            return {
              submission_id: sub.submission_id,
              model_id: model.id,
              score,
              max_marks,
              status, 
            };
          })
        );

        return {
          ...sub,
          grades,
        };
      })
    );

    // ----------------- 6. FINAL RESPONSE -----------------
    return NextResponse.json(
      {
        module: moduleData,
        enrollmentCount,
        evaluation_models: evaluationModels,
        subscriptions: activeSubscriptions.map((sub) => ({
          subscription_id: sub.subscription_id,
          status: sub.status,
          start_date: sub.start_date,
          pricing_plan_id: sub.pricing_plan_id,
        })),
        assessment: {
          ...assessment,
          submissions: finalSubmissions,
          questions,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error in combined assessment endpoint:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------
// PATCH (UNCHANGED)
// ---------------------------------------------------------
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const { assessmentId } = await ctx.params;
    const body = await req.json();
    const { model_id, deadline, auto_grade } = body;

    const existing = await prisma.assessment.findUnique({
      where: { assessment_id: assessmentId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Assessment not found" },
        { status: 404 }
      );
    }

    const updateData: any = { updated_on: new Date() };
    if (model_id !== undefined) updateData.model_id = model_id;
    if (deadline !== undefined) updateData.deadline = new Date(deadline);
    if (auto_grade !== undefined) updateData.auto_grade = auto_grade;

    const updatedAssessment = await prisma.assessment.update({
      where: { assessment_id: assessmentId },
      data: updateData,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Assessment updated successfully",
        assessment: updatedAssessment,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error updating assessment:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
