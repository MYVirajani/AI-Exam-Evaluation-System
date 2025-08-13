// src/app/api/assessment/grades/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/assessment/grades?assessmentId=xxxx
 *
 * Returns the list of submissions for the assessment with per-student overall grade.
 * - Includes student registration_number
 * - If Assessment_Grade is missing, falls back to sum of Question_Grade entries
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

    // Pull all submissions for this assessment with student + grade + q_grades
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

    // Helper to convert Prisma Decimal | number | string -> number
    const toNum = (v: unknown): number | null => {
      if (v === null || v === undefined) return null;
      if (typeof v === "number") return v;
      // Prisma Decimal has toString(); strings can be parsed too
      const n = Number(v.toString());
      return Number.isFinite(n) ? n : null;
    };

    const rows = submissions.map((s) => {
      const studentName = s.student?.user
        ? `${s.student.user.first_name} ${s.student.user.last_name}`.trim()
        : null;

      // Prefer overall Assessment_Grade if present
      let marksAwarded = toNum(s.grade?.marks_awarded);
      let maxMarks = toNum(s.grade?.max_marks);
      let gradedAt = s.grade?.graded_at ?? null;
      let autoGraded = s.grade?.auto_graded ?? null;

      // Fallback: sum Question_Grade when overall grade is not present
      if (marksAwarded == null && s.q_grades && s.q_grades.length > 0) {
        const sumAwarded = s.q_grades.reduce((acc, q) => acc + (toNum(q.marks_awarded) ?? 0), 0);
        const sumMax = s.q_grades.reduce((acc, q) => acc + (toNum(q.max_marks) ?? 0), 0);
        marksAwarded = sumAwarded;
        maxMarks = sumMax || null;
        // gradedAt/autoGraded remain null in fallback
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

        // Overall grade (or computed fallback)
        marks_awarded: marksAwarded,
        max_marks: maxMarks,
        percentage,
        graded_at: gradedAt,
        auto_graded: autoGraded,

        // Metadata about the grade origin
        grade_id: s.grade?.grade_id ?? null,
        educator_id: s.grade?.educator_id ?? null,
        model_id: s.grade?.model_id ?? null,

        // Whether this submission has an explicit Assessment_Grade
        has_overall_grade: Boolean(s.grade),
      };
    });

    // Sort by registration number when available; otherwise keep existing order
    rows.sort((a, b) => {
      const ra = a.registration_number || "";
      const rb = b.registration_number || "";
      return ra.localeCompare(rb, undefined, { numeric: true, sensitivity: "base" });
    });

    return NextResponse.json({ success: true, count: rows.length, data: rows }, { status: 200 });
  } catch (err) {
    console.error("[GET /api/assessment/grades] error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch grades" },
      { status: 500 }
    );
  }
}
