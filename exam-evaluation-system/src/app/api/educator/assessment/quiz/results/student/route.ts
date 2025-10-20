// src/app/api/educator/assessment/quiz/results/student-summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/educator/assessment/quiz/results/student-summary?assessmentId=xxx&studentId=yyy
 * Returns summary of all submissions of a student for an assessment
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assessmentId = searchParams.get("assessmentId");
    const studentId = searchParams.get("studentId");

    if (!assessmentId || !studentId) {
      return NextResponse.json(
        { success: false, message: "Missing query params: assessmentId or studentId" },
        { status: 400 }
      );
    }

    const submissions = await prisma.submission.findMany({
      where: { assessment_id: assessmentId, student_id: studentId },
      include: {
        student: {
          select: {
            registration_number: true,
            user: {
              select: {
                first_name: true,
                last_name: true,
                email: true,
              },
            },
          },
        },
        assessment: {
          select: {
            title: true,
            type: true,
            module: {
              select: {
                module_code: true,
                module_name: true,
              },
            },
          },
        },
        grade: {
          select: {
            max_marks: true,
            marks_awarded: true,
            feedback: true,
            graded_at: true,
          },
        },
        answers: {
          include: {
            question: {
              select: {
                question_id: true,
                question: true,
                marks_allowed: true,
              },
            },
          },
        },
      },
      orderBy: { submission_start_at: "asc" },
    });

    if (!submissions.length) {
      return NextResponse.json({ success: true, count: 0, data: null });
    }

    const meta = submissions[0];

    const response = {
      assessment_title: meta.assessment.title,
      assessment_type: meta.assessment.type,
      module_code: meta.assessment.module.module_code,
      module_name: meta.assessment.module.module_name,
      student_name: `${meta.student.user.first_name} ${meta.student.user.last_name}`,
      student_registration_number: meta.student.registration_number,
      student_email: meta.student.user.email,

      submissions: submissions.map((sub) => ({
        submission_id: sub.submission_id,
        submission_start_at: sub.submission_start_at,
        submission_end_at: sub.submission_end_at,
        type: sub.type,
        device_info: sub.device_info,

        assessment_grade: {
          marks_awarded: sub.grade?.marks_awarded ?? null,
          max_marks: sub.grade?.max_marks ?? null,
          feedback: sub.grade?.feedback ?? null,
          graded_at: sub.grade?.graded_at ?? null,
        },

        questions: sub.answers.map((ans) => ({
          question_id: ans.question_id,
          question_text: ans.question.question,
          student_answer: ans.student_answer,
          marks_allowed: ans.question.marks_allowed,
          marks_awarded: ans.marks_awarded ?? null,
          feedback: ans.feedback ?? null,
        })),
      })),
    };

    return NextResponse.json({
      success: true,
      count: submissions.length,
      data: response,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch student results" },
      { status: 500 }
    );
  }
}
