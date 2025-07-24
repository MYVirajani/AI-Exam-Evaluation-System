// src/app/api/modules/[moduleId]/lessons/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

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

export async function POST(
  request: Request,
  { params }: { params: { moduleId: string } }
) {
  try {
    const { title } = await request.json();
    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Lesson title is required" },
        { status: 400 }
      );
    }
    const newLesson = await prisma.lesson.create({
      data: {
        lesson_id: uuidv4(),
        module_id: params.moduleId,
        title: title.trim(),
        // created_on defaults to now()
      },
    });
    return NextResponse.json({ lesson: newLesson }, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}
