// src/app/api/educator/module/[moduleId]/route.ts

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
            materials: true,
          },
          orderBy: { created_on: 'desc' },
        },
        assessments: {
          select: {
            assessment_id: true,
            title: true,
            description: true,
            deadline: true,
            type: true,
            created_by: true,
          },
          orderBy: { deadline: 'asc' },
        },
      },
    });

    if (!moduleData) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    return NextResponse.json({
      moduleId: moduleData.module_id,
      moduleName: moduleData.module_name,
      moduleCode: moduleData.module_code,
      lessons: moduleData.lessons,
      assessments: moduleData.assessments,
    });
  } catch (error) {
    console.error('[MODULE_FETCH_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
