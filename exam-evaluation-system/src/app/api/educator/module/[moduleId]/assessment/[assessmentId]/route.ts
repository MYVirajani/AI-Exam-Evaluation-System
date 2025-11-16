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

    // Fetch full assessment data (all fields + relations) with enhanced submissions data
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
        },
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { success: false, message: "Assessment not found or access denied" },
        { status: 404 }
      );
    }

    // Get latest AI grades for all submissions
    const enhancedSubmissions = await Promise.all(
      assessment.submissions.map(async (submission) => {
        const studentRegNumber = submission.student.registration_number;
        
        // Get latest OpenAI result
        const openAIResult = await prisma.student_paper_results_openai.findFirst({
          where: {
            assessment_id: assessmentId,
            student_index: studentRegNumber,
          },
          orderBy: {
            graded_at: 'desc',
          },
        });

        // Get latest Gemini result
        const geminiResult = await prisma.student_paper_results_gemini.findFirst({
          where: {
            assessment_id: assessmentId,
            student_index: studentRegNumber,
          },
          orderBy: {
            graded_at: 'desc',
          },
        });

        // Determine the latest AI grade
        let latestAIGrade = null;
        
        if (openAIResult && geminiResult) {
          // Compare dates and pick the latest
          const openAIDate = new Date(openAIResult.graded_at);
          const geminiDate = new Date(geminiResult.graded_at);
          
          if (openAIDate > geminiDate) {
            latestAIGrade = {
              marks_awarded: openAIResult.total_marks,
              max_marks: openAIResult.total_possible,
              model_used: 'ChatGPT',
              graded_at: openAIResult.graded_at.toISOString(),
            };
          } else {
            latestAIGrade = {
              marks_awarded: geminiResult.total_marks,
              max_marks: geminiResult.total_possible,
              model_used: 'Gemini',
              graded_at: geminiResult.graded_at.toISOString(),
            };
          }
        } else if (openAIResult) {
          latestAIGrade = {
            marks_awarded: openAIResult.total_marks,
            max_marks: openAIResult.total_possible,
            model_used: 'ChatGPT',
            graded_at: openAIResult.graded_at.toISOString(),
          };
        } else if (geminiResult) {
          latestAIGrade = {
            marks_awarded: geminiResult.total_marks,
            max_marks: geminiResult.total_possible,
            model_used: 'Gemini',
            graded_at: geminiResult.graded_at.toISOString(),
          };
        }

        return {
          ...submission,
          latest_ai_grade: latestAIGrade,
        };
      })
    );

    // Replace submissions with enhanced ones
    const enhancedAssessment = {
      ...assessment,
      submissions: enhancedSubmissions,
    };

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

    // Debug logging for enhanced submissions
    console.log("Enhanced submissions with AI grades:");
    enhancedSubmissions.forEach((sub, index) => {
      console.log(`  Submission ${index + 1}:`);
      console.log(`    Student: ${sub.student.user?.first_name} ${sub.student.user?.last_name}`);
      console.log(`    Registration: ${sub.student.registration_number}`);
      console.log(`    Email: ${sub.student.user?.email}`);
    });

    // Build response with all assessment fields
    const responseData = {
      module: moduleData,
      enrollmentCount,
      assessment: enhancedAssessment,
    };

    return NextResponse.json(responseData);
  } catch (err) {
    console.error("[GET educator/module/[moduleId]/assessment/[assessmentId]]", err);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}