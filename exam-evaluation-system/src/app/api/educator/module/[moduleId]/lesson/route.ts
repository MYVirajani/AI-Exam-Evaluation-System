// src/app/api/module/[moduleId]/lessons/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/* -----------------------------------------------------------
   GET - Fetch module with lessons + lecture materials
------------------------------------------------------------ */
export async function GET(
  request: Request,
  { params }: { params: { moduleId: string } }
) {
  try {
    const moduleWithLessons = await prisma.module.findUnique({
      where: { module_id: params.moduleId },
      include: {
        educator: {
          select: {
            user_id: true,
            official_email: true,
            education_institute: true,
          },
        },
        assessments: true,
        enrollments: true,
        lessons: {
          orderBy: { created_on: "asc" },
          include: {
            materials: true, // <-- INCLUDE lecture materials
          },
        },
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

/* -----------------------------------------------------------
   POST - Create Lesson + Lecture Materials
------------------------------------------------------------ */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { moduleId, title, lecture_materials } = body;

    if (!moduleId || !title) {
      return NextResponse.json(
        { error: "moduleId and title are required" },
        { status: 400 }
      );
    }

    // 1. Create the lesson
    const newLesson = await prisma.lesson.create({
      data: {
        module_id: moduleId,
        title,
      },
    });

    // 2. Handle lecture materials creation
    if (Array.isArray(lecture_materials) && lecture_materials.length > 0) {
      for (const material of lecture_materials) {
        const { file_url, description, file_name } = material;

        if (!file_url) continue;

        try {
          await prisma.lecture_Material.create({
            data: {
              lesson_id: newLesson.lesson_id,
              file_url,
              file_name,
              description,
            },
          });
        } catch (materialError) {
          console.error("Failed to save lecture material:", materialError);

          return NextResponse.json(
            {
              error: `Lesson created but failed to save lecture material: ${file_url}`,
            },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json(
      {
        message: "Lesson created successfully",
        lesson: newLesson,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}
