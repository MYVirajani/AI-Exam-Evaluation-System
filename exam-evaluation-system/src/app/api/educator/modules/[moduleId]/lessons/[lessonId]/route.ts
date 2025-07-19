// src/app/api/modules/[moduleId]/lessons/[lessonId]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: { moduleId: string; lessonId: string } }
) {
  try {
    const { title } = await request.json();
    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "Lesson title is required" },
        { status: 400 }
      );
    }
    const updated = await prisma.lesson.update({
      where: { lesson_id: params.lessonId },
      data: { title: title.trim() },
    });
    return NextResponse.json({ lesson: updated });
  } catch (error) {
    console.error("Error updating lesson:", error);
    return NextResponse.json(
      { error: "Failed to update lesson" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { moduleId: string; lessonId: string } }
) {
  try {
    await prisma.lesson.delete({
      where: { lesson_id: params.lessonId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    return NextResponse.json(
      { error: "Failed to delete lesson" },
      { status: 500 }
    );
  }
}
