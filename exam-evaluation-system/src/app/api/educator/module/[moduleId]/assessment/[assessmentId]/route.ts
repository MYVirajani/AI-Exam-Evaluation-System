import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

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

    console.log("➡️ Incoming GET request");
    console.log("Params:", { moduleId, assessmentId });
    console.log("Educator ID:", educatorId);

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

    console.log("Active Subscriptions:", activeSubscriptions);

    const evaluationModels =
      activeSubscriptions
        .map((sub) => sub.pricing_plan?.evaluation_model)
        .filter(Boolean) || [];

    console.log("Evaluation Models:", evaluationModels);

    // ----------------- 2. MODULE DATA -----------------
    const moduleData = await prisma.module.findUnique({
      where: { module_id: moduleId },
      select: {
        module_id: true,
        module_code: true,
        module_name: true,
      },
    });

    console.log("Module Data:", moduleData);

    if (!moduleData) {
      return NextResponse.json(
        { success: false, message: "Module not found" },
        { status: 404 }
      );
    }

    const enrollmentCount = await prisma.enrollment.count({
      where: { module_id: moduleId },
    });

    console.log("Enrollment Count:", enrollmentCount);

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
        question_paper: {
          select: {
            question_paper_id: true,
            file_url: true,
            created_on: true,
            updated_on: true,
          },
        },
        model_answer_paper: {
          select: {
            id: true,
            file_url: true,
            media_extracted_file_url: true,
            created_on: true,
            updated_on: true,
          },
        },
        marking_scheme: true,
        questions: {
          orderBy: { question_number: "asc" },
        },
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
            is_graded: true,
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

    console.log("Assessment Data:", assessment);

    if (!assessment) {
      return NextResponse.json(
        { success: false, message: "Assessment not found or access denied" },
        { status: 404 }
      );
    }

    // ----------------- 4. FETCH GRADES -----------------
    const submissionIds = assessment.submissions.map((s) => s.submission_id);
    console.log("Submission IDs:", submissionIds);

    const assessmentGrades = assessment.model_id
      ? await prisma.assessment_Grade.findMany({
          where: {
            assessment_id: assessmentId,
            submission_id: { in: submissionIds },
            model_id: assessment.model_id,
          },
          select: {
            submission_id: true,
            model_id: true,
            score: true,
            max_marks: true,
            updated_on: true,
          },
        })
      : [];

    console.log("Fetched Assessment Grades:", assessmentGrades);

    const gradeMap = new Map(assessmentGrades.map((g) => [g.submission_id, g]));

    const finalSubmissions = assessment.submissions.map((sub) => ({
      ...sub,
      grade: gradeMap.get(sub.submission_id) || null,
    }));

    console.log("Final Submissions With Grades:", finalSubmissions);

    // ----------------- 5. FINAL RESPONSE -----------------
    const responsePayload = {
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
      },
    };

    console.log("📤 Final Response:", responsePayload);

    return NextResponse.json(responsePayload, { status: 200 });
  } catch (err) {
    console.error("❌ Error in combined assessment endpoint:", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------
// PATCH
// ---------------------------------------------------------
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const { assessmentId } = await ctx.params;

    const body = await req.json();
    console.log("PATCH request body:", body);

    const { model_id, deadline, auto_grade } = body;

    if (!assessmentId) {
      return NextResponse.json(
        { success: false, message: "Missing assessmentId" },
        { status: 400 }
      );
    }

    const existing = await prisma.assessment.findUnique({
      where: { assessment_id: assessmentId },
      select: { assessment_id: true },
    });

    console.log("Existing Assessment:", existing);

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

    console.log("Update Data:", updateData);

    const updatedAssessment = await prisma.assessment.update({
      where: { assessment_id: assessmentId },
      data: updateData,
    });

    console.log("Updated Assessment:", updatedAssessment);

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
