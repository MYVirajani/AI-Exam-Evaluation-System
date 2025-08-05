// Updated API route: /api/educator/assessment/quiz/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    moduleId,
    assessmentId,
    title,
    duration,
    description,
    instructions,
    questions,
    deadline,
    totalMarks,
    password,
    questionCount,
    shuffleQuestions,
  } = body;

  if (!moduleId || !assessmentId || !Array.isArray(questions)) {
    return NextResponse.json(
      { success: false, message: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    const existingAssessment = await prisma.assessment.findUnique({
      where: { assessment_id: assessmentId },
    });

    if (!existingAssessment) {
      return NextResponse.json(
        { success: false, message: "Assessment not found" },
        { status: 404 }
      );
    }

    const updatedAssessment = await prisma.assessment.update({
      where: { assessment_id: assessmentId },
      data: {
        title: title ?? existingAssessment.title,
        duration: duration ?? existingAssessment.duration,
        description: description ?? existingAssessment.description,
        instructions: Array.isArray(instructions)
          ? instructions.map((line: string) => line.trim())
          : typeof instructions === "string"
          ? instructions.split("\n").map((line: string) => line.trim())
          : existingAssessment.instructions,
        type: "quiz",
        deadline: deadline ? new Date(deadline) : existingAssessment.deadline,
        total_marks: totalMarks,
        password: password ?? existingAssessment.password,
        question_count: questionCount ?? questions.length,
        shuffle_questions:
          shuffleQuestions ?? existingAssessment.shuffle_questions,
      },
    });

    // Delete existing questions
    await prisma.question.deleteMany({
      where: { assessment_id: assessmentId },
    });

    // Create new questions with correct model answer handling
    const createdQuestions = await Promise.all(
      questions.map((q: any, index: number) => {
        console.log('Processing question:', JSON.stringify(q, null, 2));
        
        // Validate required fields
        if (!q.questionText || q.questionText.trim() === '') {
          throw new Error(`Question ${index + 1} is missing question text`);
        }
        
        if (!q.questionType) {
          throw new Error(`Question ${index + 1} is missing question type`);
        }
        
        // Determine model answer based on question type
        let modelAnswer = "";
        
        if (q.questionType === "MCQ") {
          // For MCQ: Get the text of the selected correct answer option
          if (q.options && Array.isArray(q.options) && 
              q.correctAnswerIndex >= 0 && 
              q.correctAnswerIndex < q.options.length) {
            modelAnswer = q.options[q.correctAnswerIndex].trim();
          } else {
            throw new Error(`Question ${index + 1} (MCQ) must have a valid correct answer selected`);
          }
          
          // Validate that the correct answer option is not empty
          if (!modelAnswer) {
            throw new Error(`Question ${index + 1} (MCQ) correct answer option cannot be empty`);
          }
          
        } else if (q.questionType === "SHORT") {
          // For SHORT: Use the expected answer directly
          modelAnswer = (q.expectedAnswer || "").trim();
          
          // You can choose to make this required or optional
          if (!modelAnswer) {
            console.warn(`Question ${index + 1} (SHORT) has no model answer provided`);
          }
        }
        
        console.log(`Question ${index + 1} model answer:`, modelAnswer);
        
        return prisma.question.create({
          data: {
            assessment_id: assessmentId,
            type: q.questionType,
            question_number: (index + 1).toString(),
            question: q.questionText.trim(),
            model_answer: modelAnswer, // This now contains the actual answer text
            mcq_answer_options: q.options || [],
            marks_allowed: q.marks || 0,
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      message: "Assessment and questions saved successfully",
      assessment: updatedAssessment,
      questions: createdQuestions,
    });
  } catch (error) {
    console.error("Failed to save quiz:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Internal server error" 
      },
      { status: 500 }
    );
  }
}