// src/app/api/educator/quiz/results/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/educator/quiz/results?assessmentId=xxxx
 *
 * Returns per-student highest scoring submission for the assessment.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assessmentId = searchParams.get("assessmentId");

    if (!assessmentId) {
      return NextResponse.json(
        { success: false, message: "Missing query param: assessmentId" },
        { status: 400 }
      );
    }

    const submissions = await prisma.submission.findMany({
      where: { assessment_id: assessmentId },
      include: {
        student: {
          select: {
            user_id: true,
            registration_number: true,
            user: {
              select: {
                first_name: true,
                last_name: true,
                username: true,
                email: true,
              },
            },
          },
        },
        grade: {
          select: {
            grade_id: true,
            marks_awarded: true,
            max_marks: true,
            feedback: true,
            graded_at: true,
            auto_graded: true,
            educator_id: true,
            model_id: true,
          },
        },
        q_grades: {
          select: {
            marks_awarded: true,
            max_marks: true,
          },
        },
      },
      orderBy: { submission_start_at: "asc" },
    });

    const toNum = (v: unknown): number | null => {
      if (v === null || v === undefined) return null;
      if (typeof v === "number") return v;
      const n = Number(v.toString());
      return Number.isFinite(n) ? n : null;
    };

    const rows = submissions.map((s) => {
      const studentName = s.student?.user
        ? `${s.student.user.first_name} ${s.student.user.last_name}`.trim()
        : null;

      let marksAwarded = toNum(s.grade?.marks_awarded);
      let maxMarks = toNum(s.grade?.max_marks);
      let gradedAt = s.grade?.graded_at ?? null;
      let autoGraded = s.grade?.auto_graded ?? null;

      if (marksAwarded == null && s.q_grades && s.q_grades.length > 0) {
        const sumAwarded = s.q_grades.reduce((acc, q) => acc + (toNum(q.marks_awarded) ?? 0), 0);
        const sumMax = s.q_grades.reduce((acc, q) => acc + (toNum(q.max_marks) ?? 0), 0);
        marksAwarded = sumAwarded;
        maxMarks = sumMax || null;
      }

      const percentage =
        marksAwarded != null && maxMarks != null && maxMarks > 0
          ? Number(((marksAwarded / maxMarks) * 100).toFixed(2))
          : null;

      return {
        submission_id: s.submission_id,
        assessment_id: s.assessment_id,
        student_id: s.student_id,
        registration_number: s.student?.registration_number ?? null,
        student_name: studentName || null,
        username: s.student?.user?.username ?? null,
        email: s.student?.user?.email ?? null,
        marks_awarded: marksAwarded,
        max_marks: maxMarks,
        percentage,
        graded_at: gradedAt,
        auto_graded: autoGraded,
        grade_id: s.grade?.grade_id ?? null,
        educator_id: s.grade?.educator_id ?? null,
        model_id: s.grade?.model_id ?? null,
        has_overall_grade: Boolean(s.grade),
      };
    });

    // Group by student_id and pick the highest % score
    const highestPerStudent: Record<string, typeof rows[0]> = {};

    for (const r of rows) {
      const key = String(r.student_id);
      if (!highestPerStudent[key]) {
        highestPerStudent[key] = r;
      } else {
        const existing = highestPerStudent[key];
        const existingPct = existing.percentage ?? -1;
        const thisPct = r.percentage ?? -1;
        if (thisPct > existingPct) {
          highestPerStudent[key] = r;
        }
      }
    }

    const result = Object.values(highestPerStudent);

    result.sort((a, b) => {
      const ra = a.registration_number || "";
      const rb = b.registration_number || "";
      return ra.localeCompare(rb, undefined, { numeric: true, sensitivity: "base" });
    });

    return NextResponse.json({ success: true, count: result.length, data: result }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/assessment/grades] error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch grades" },
      { status: 500 }
    );
  }
}
