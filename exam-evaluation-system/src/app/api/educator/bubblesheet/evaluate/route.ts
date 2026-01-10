// src/app/api/educator/bubblesheet/evaluate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export async function POST(request: NextRequest) {
  try {
    const { assessmentId, moduleId, studentIds } = await request.json();

    if (!assessmentId || !moduleId || !studentIds || studentIds.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log(`Evaluating ${studentIds.length} students for assessment ${assessmentId}`);

    // Get answer key
    const answerKeys = await prisma.bubbleSheet_Answer_Key.findMany({
      where: {
        assessment_id: assessmentId,
      },
      orderBy: {
        question_number: 'asc',
      },
    });

    if (answerKeys.length === 0) {
      return NextResponse.json(
        { error: "No answer key found for this assessment" },
        { status: 404 }
      );
    }

    console.log(`Found answer key with ${answerKeys.length} questions`);

    // Create answer key map for quick lookup
    const answerKeyMap = new Map(
      answerKeys.map((key) => [key.question_number, key.correct_option])
    );

    let evaluatedCount = 0;
    const results = [];

    // Evaluate each student
    for (const studentId of studentIds) {
      try {
        // Get student answers
        const studentAnswers = await prisma.bubbleSheet_Student_Answer.findMany({
          where: {
            student_id: studentId,
            assessment_id: assessmentId,
          },
          orderBy: {
            question_number: 'asc',
          },
        });

        if (studentAnswers.length === 0) {
          console.log(`No answers found for student ${studentId}`);
          continue;
        }

        // Calculate results
        let correctAnswers = 0;
        let incorrectAnswers = 0;
        let unanswered = 0;

        const totalQuestions = answerKeys.length;
        const answeredQuestions = new Set(
          studentAnswers.map((a) => a.question_number)
        );

        // Check each answer
        for (const studentAnswer of studentAnswers) {
          const correctOption = answerKeyMap.get(studentAnswer.question_number);
          if (correctOption === studentAnswer.selected_option) {
            correctAnswers++;
          } else {
            incorrectAnswers++;
          }
        }

        // Calculate unanswered questions
        unanswered = totalQuestions - answeredQuestions.size;

        // Calculate marks (1 mark per correct answer)
        const totalMarks = correctAnswers;
        const percentage = (correctAnswers / totalQuestions) * 100;

        // Delete existing result if any
        await prisma.bubbleSheet_Result.deleteMany({
          where: {
            student_id: studentId,
            assessment_id: assessmentId,
          },
        });

        // Create new result
        const result = await prisma.bubbleSheet_Result.create({
          data: {
            student_id: studentId,
            assessment_id: assessmentId,
            module_id: moduleId,
            total_questions: totalQuestions,
            correct_answers: correctAnswers,
            incorrect_answers: incorrectAnswers,
            unanswered: unanswered,
            total_marks: new Decimal(totalMarks),
            percentage: new Decimal(percentage),
          },
        });

        results.push(result);
        evaluatedCount++;

        console.log(
          `✅ Evaluated student ${studentId}: ${correctAnswers}/${totalQuestions} correct (${percentage.toFixed(1)}%)`
        );
      } catch (studentError) {
        console.error(`Error evaluating student ${studentId}:`, studentError);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully evaluated ${evaluatedCount} student(s)`,
      evaluated_count: evaluatedCount,
      results: results.map((r) => ({
        student_id: r.student_id,
        total_questions: r.total_questions,
        correct_answers: r.correct_answers,
        incorrect_answers: r.incorrect_answers,
        unanswered: r.unanswered,
        total_marks: r.total_marks.toNumber(),
        percentage: r.percentage.toNumber(),
      })),
    });
  } catch (error) {
    console.error("Error evaluating bubble sheets:", error);
    return NextResponse.json(
      {
        error: "Failed to evaluate bubble sheets",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}