// src/app/api/educator/bubblesheet/results/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get("assessmentId");
    const educatorId = searchParams.get("educatorId");

    if (!assessmentId || !educatorId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Verify educator owns this assessment
    const assessment = await prisma.assessment.findUnique({
      where: {
        assessment_id: assessmentId,
        created_by: educatorId,
        type: "bubbleSheet",
      },
    });

    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found or unauthorized" },
        { status: 404 }
      );
    }

    // Get all results with student details
    const results = await prisma.bubbleSheet_Result.findMany({
      where: {
        assessment_id: assessmentId,
      },
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
      orderBy: {
        percentage: 'desc', // Sort by highest score first
      },
    });

    // Format results
    const formattedResults = results.map((result) => ({
      student_id: result.student_id,
      registration_number: result.student.registration_number,
      name: `${result.student.user.first_name} ${result.student.user.last_name}`,
      email: result.student.user.email,
      total_questions: result.total_questions,
      correct_answers: result.correct_answers,
      incorrect_answers: result.incorrect_answers,
      unanswered: result.unanswered,
      total_marks: result.total_marks.toNumber(),
      percentage: result.percentage.toNumber(),
    }));

    return NextResponse.json({
      success: true,
      results: formattedResults,
      total_count: formattedResults.length,
    });
  } catch (error) {
    console.error("Error fetching bubble sheet results:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch results",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}