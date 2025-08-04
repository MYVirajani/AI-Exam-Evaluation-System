import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      assessmentId,
      type = 'quiz',
      title,
      description,
      instructions,
      duration,
      deadline,
      moduleId,
      createdBy,
      questions,
    } = body;

    if (!assessmentId || !title || !Array.isArray(questions)) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const now = new Date();

    // Check if assessment exists
    const existingAssessment = await prisma.assessment.findUnique({
      where: { assessment_id: assessmentId },
    });

    let assessment;

    if (existingAssessment) {
      // Update only fields that are provided; preserve others
      assessment = await prisma.assessment.update({
        where: { assessment_id: assessmentId },
        data: {
          title,
          description,
          instructions,
          duration,
          ...(moduleId ? { module_id: moduleId } : {}),
          ...(createdBy ? { created_by: createdBy } : {}),
          ...(deadline ? { deadline } : {}),
        },
      });
    } else {
      // If not exists, create new assessment (all required)
      assessment = await prisma.assessment.create({
        data: {
          assessment_id: assessmentId,
          type,
          title,
          description,
          instructions,
          duration,
          deadline: deadline || now,
          module_id: moduleId,
          created_by: createdBy,
        },
      });
    }

    // Create new question paper
    const questionPaperId = uuidv4();
    const questionPaper = await prisma.question_Paper.create({
      data: {
        question_paper_id: questionPaperId,
        assessment_id: assessmentId,
        file_url: '',
        created_on: now,
      },
    });

    // Format and create questions
    const formattedQuestions = questions.map((q: any, index: number) => ({
      assessment_id: assessmentId,
      question_paper_id: questionPaperId,
      type: q.questionType === 'short_answer' ? 'SHORT' : 'MCQ',
      question_number: `${index + 1}`,
      question: q.questionText,
      model_answer: q.expectedAnswer || '',
      mcq_answer_options: q.options || [],
      marks_allowed: Math.round(q.marks || 0),
    }));

    await prisma.question.createMany({ data: formattedQuestions });

    return NextResponse.json({
      success: true,
      message: 'Assessment and questions saved',
      assessment,
      questionPaper,
    });
  } catch (err) {
    console.error('[POST /api/educator/assessment/quiz]', err);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
