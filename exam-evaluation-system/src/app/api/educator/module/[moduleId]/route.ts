// /api/educator/module/${moduleId}
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  const moduleId = params.moduleId;

  try {
    const moduleData = await prisma.module.findUnique({
      where: { module_id: moduleId },
      include: {
        lessons: {
          include: {
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
          orderBy: { created_on: 'asc' },
        },
        assessments: {
          select: {
            assessment_id: true,
            title: true,
            description: true,
            deadline: true,
            type: true,
            created_by: true,
            _count: {
              select: { submissions: true },
            },
          },
          orderBy: { deadline: 'asc' },
        },
        enrollments: {
          select: {
            enrollment_id: true,
          },
        },
      },
    });

    if (!moduleData) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    const formattedAssessments = moduleData.assessments.map((assessment) => ({
      ...assessment,
      submissionsCount: assessment._count.submissions,
    }));

    const response = {
      moduleId: moduleData.module_id,
      moduleName: moduleData.module_name,
      moduleCode: moduleData.module_code,
      maxEnrollments: moduleData.max_enrollments,
      lessons: moduleData.lessons,
      assessments: formattedAssessments,
      enrollmentsCount: moduleData.enrollments.length,
    };

    // ✅ Log the full response object
    console.log('[MODULE_DATA_RESPONSE]', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('[MODULE_FETCH_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
