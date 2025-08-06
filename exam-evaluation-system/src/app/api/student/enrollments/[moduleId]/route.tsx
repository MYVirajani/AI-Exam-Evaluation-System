import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: { moduleId: string } }) {
  try {
    const moduleId = params.moduleId;
    const searchParams = req.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');

    console.log("[API] GET request received for module:", moduleId, "student:", studentId);

    if (!studentId || !moduleId) {
      return NextResponse.json({ error: 'Missing studentId or moduleId' }, { status: 400 });
    }

    // const enrollment = await prisma.enrollment.findUnique({
    //   where: {
    //     student_id_module_id: {
    //       student_id: studentId,
    //       module_id: moduleId,
    //     },
    //   },
    // });

    // if (!enrollment) {
    //   return NextResponse.json({ error: 'Student is not enrolled in this module' }, { status: 403 });
    // }

    const moduleData = await prisma.module.findUnique({
      where: { module_id: moduleId },
      select: {
        module_id: true,
        module_code: true,
        module_name: true,
        semester: true,
        education_institute: true,
        learning_outcomes: true,
        module_image_url: true,
        created_by: true,
        educator: {
          select: {
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
    });

    const assessments = await prisma.assessment.findMany({
      where: { module_id: moduleId },
      select: {
        assessment_id: true,
        title: true,
        type: true,
        description: true,
        deadline: true,
      },
      orderBy: { deadline: 'asc' },
    });

    const lessons = await prisma.lesson.findMany({
      where: { module_id: moduleId },
      select: {
        lesson_id: true,
        title: true,
        created_on: true,
        materials: {
          select: {
            material_id: true,
            file_name: true,
            file_url: true,
            uploaded_on: true,
            description: true,
          },
        },
      },
    });

    return NextResponse.json({
      module: moduleData,
      assessments,
      lessons,
    }, { status: 200 });

  } catch (error) {
    console.error('Error in GET /api/student/enrollments/[moduleId]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
