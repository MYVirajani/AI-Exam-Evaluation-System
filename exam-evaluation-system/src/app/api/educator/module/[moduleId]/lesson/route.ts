// src/app/api/module/[moduleId]/lessons/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';


export async function GET(
  request: Request,
  { params }: { params: { moduleId: string } }
) {
  try {
    const moduleWithLessons = await prisma.module.findUnique({
      where: { module_id: params.moduleId },
      include: {
        // pull in every module field...
        educator: {
          select: { user_id: true, official_email: true, education_institute: true }
        },
        assessments: true,
        enrollments: true,
        // ...and its lessons, ordered by creation time
        lessons: { orderBy: { created_on: "asc" } },
      },
    });

    if (!moduleWithLessons) {
      return NextResponse.json(
        { error: "Module not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ module: moduleWithLessons });
  } catch (error) {
    console.error("Error fetching module details:", error);
    return NextResponse.json(
      { error: "Failed to load module info" },
      { status: 500 }
    );
  }
}


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { moduleId, title, lecture_materials } = body;

    console.log('Received request body:', body);

    if (!moduleId || !title) {
      console.warn('Missing moduleId or title');
      return NextResponse.json(
        { error: 'moduleId and title are required' },
        { status: 400 }
      );
    }

    // 1. Create the Lesson
    console.log('Creating new lesson...');
    const newLesson = await prisma.lesson.create({
      data: {
        module_id: moduleId,
        title,
      },
    });
    console.log('Lesson created with ID:', newLesson.lesson_id);

    // 2. Optionally add lecture materials
    if (lecture_materials && Array.isArray(lecture_materials)) {
      for (const material of lecture_materials) {
        const { file_url, description, file_name } = material;

        if (file_url) {
          console.log('Adding lecture material:', file_url);
          try {
            await prisma.lectureMaterial.create({
              data: {
                lesson_id: newLesson.lesson_id,
                file_url,
                file_name,
                description,
              },
            });
            console.log('Lecture material saved successfully.');
          } catch (materialError) {
            console.error('Failed to save lecture material:', {
              file_url,
              description,
              error: materialError,
            });

            return NextResponse.json(
              {
                error: `Lesson was created, but failed to save lecture material: ${file_url}`,
              },
              { status: 500 }
            );
          }
        }
      }
    }

    return NextResponse.json(
      {
        message: 'Lesson created successfully',
        lesson: newLesson,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { error: 'Failed to create lesson' },
      { status: 500 }
    );
  }
}
