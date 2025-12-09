// api/educator/module/[moduleId]/assessment/[assessmentId]/submission/[submissionId]/model/[modelId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { moduleId: string; assessmentId: string; submissionId: string; modelId: string } }
) {
  try {
    console.log("📥 Incoming Params:", params);

    const { assessmentId, submissionId, modelId } = params;

    // ---------------------------------------------------------
    // 1. Fetch assessment + module details
    // ---------------------------------------------------------
    console.log("🔍 Fetching assessment...");
    const assessment = await prisma.assessment.findUnique({
      where: { assessment_id: assessmentId },
      select: {
        assessment_id: true,
        title: true,
        type: true,
        deadline: true,
        model_id: true,
        module: {
          select: {
            module_id: true,
            module_name: true,
            module_code: true,
          },
        },
      },
    });

    console.log("📘 Assessment Result:", assessment);

    if (!assessment) {
      console.warn("❌ Assessment not found:", assessmentId);
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    // ---------------------------------------------------------
    // 2. Fetch submission + student profile
    // ---------------------------------------------------------
    console.log("🔍 Fetching submission...");
    const submission = await prisma.submission.findUnique({
      where: { submission_id: submissionId },
      select: {
        submission_id: true,
        file_url: true,
        media_extracted_file_url: true,
        is_handwritten: true,
        handwritten_file_url: true,
        is_graded: true,
        student: {
          select: {
            registration_number: true,
            education_institute: true,
            user: {
              select: {
                user_id: true,
                first_name: true,
                last_name: true,
                title: true,
                username: true,
                email: true,
                phone_number: true,
                country: true,
                city: true,
                profile_image_url: true,
              },
            },
          },
        },
      },
    });

    console.log("📝 Submission Result:", submission);

    if (!submission) {
      console.warn("❌ Submission not found:", submissionId);
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // ---------------------------------------------------------
    // 3. Fetch student answers for this submission + model
    // ---------------------------------------------------------
    console.log("🔍 Fetching raw student answers...");
    const rawStudentAnswers = await prisma.student_Answer.findMany({
      where: {
        submission_id: submissionId,
        model_id: modelId,
      },
      select: {
        id: true,
        question_number: true,
        answer_text: true,
        score: true,
        feedback: true,
        graded_at: true,

        evaluation_model: {
          select: {
            id: true,
            model_name: true,
            provider: true,
          },
        },

        media: {
          select: {
            id: true,
            media_url: true,
            media_summary: true,
          },
        },
      },
      orderBy: { question_number: "asc" },
    });

    console.log("📄 Raw Student Answers:", rawStudentAnswers);

    // ---------------------------------------------------------
    // 4. Fetch questions for each student answer
    // ---------------------------------------------------------
    console.log("🔍 Fetching questions for each student answer...");
    const studentAnswersWithQuestions = await Promise.all(
      rawStudentAnswers.map(async (ans) => {
        console.log(`🔎 Fetching question for Q${ans.question_number}`);

        const question = await prisma.question.findFirst({
          where: {
            question_number: ans.question_number,
            model_id: modelId,
            assessment_id: assessmentId,
          },
          select: {
            id: true,
            question_number: true,
            question_text: true,
            answer_text: true,
            guideline_text: true,
            mcq_answer_options: true,
            max_marks: true,
            type: true,
            media: {
              select: {
                id: true,
                media_url: true,
              },
            },
          },
        });

        console.log(`📘 Result for Q${ans.question_number}:`, question);

        return {
          ...ans,
          question: question || null,
        };
      })
    );

    // ---------------------------------------------------------
    // 5. Fetch evaluation model metadata
    // ---------------------------------------------------------
    console.log("🔍 Fetching evaluation model metadata...");
    const evaluationModel = await prisma.evaluation_Model.findUnique({
      where: { id: modelId },
      select: {
        id: true,
        model_name: true,
        provider: true,
        chat_model: true,
        temperature: true,
        embedding_model: true,
        description: true,
      },
    });

    console.log("🤖 Evaluation Model:", evaluationModel);

    // ---------------------------------------------------------
    // 6. Final response
    // ---------------------------------------------------------
    const responseData = {
      module: assessment.module,
      assessment: {
        assessment_id: assessment.assessment_id,
        assessment_name: assessment.title,
        assessment_type: assessment.type,
        deadline: assessment.deadline,
        model_id: assessment.model_id,
      },
      submission: submission,
      evaluation_model: evaluationModel,
      student_answers: studentAnswersWithQuestions,
    };

    console.log("✅ Final Response:", responseData);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("🔥 Error in endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
