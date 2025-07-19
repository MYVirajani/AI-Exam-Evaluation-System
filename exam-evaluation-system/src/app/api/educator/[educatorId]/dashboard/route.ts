import { NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { educatorId: string } }
) {
  // now pulling educatorId directly from the destructured params
  const educatorId = params.educatorId

  try {
    // 1) Fetch all modules created by this educator
    const modules = await prisma.module.findMany({
      where: { created_by: educatorId },
      select: {
        module_id: true,
        module_code: true,
        module_name: true,
        semester: true,
        education_institute: true,
        max_enrollments: true,
        learning_outcomes: true,
        enrollment_key: true,
        module_image_url: true,
      },
    })

    // 2) Fetch all assessments authored by this educator
    const assessments = await prisma.assessment.findMany({
      where: { created_by: educatorId },
      select: {
        assessment_id: true,
        type: true,
        title: true,
        description: true,
        deadline: true,
        module_id: true,
        question_paper_id: true,
        model_answer_paper_id: true,
        marking_scheme_id: true,
      },
    })

    return NextResponse.json({ modules, assessments })
  } catch (error) {
    console.error('Error fetching educator dashboard:', error)
    return NextResponse.json(
      { error: 'Failed to load modules and assessments' },
      { status: 500 }
    )
  }
}
