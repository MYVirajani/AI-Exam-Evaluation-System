//src\app\api\educator\[educatorId]\[moduleId]\[lessonId]\route.ts
import { NextRequest, NextResponse } from 'next/server';
import {prisma} from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  const { lessonId } = params;
  console.log('[DELETE] Incoming request to delete lesson:', lessonId);

  // Simulated user_id of currently logged-in educator (replace this with real logic)
  const currentUserId = req.headers.get('userId'); // e.g., from middleware or auth
  console.log('[DELETE] Extracted currentUserId from headers:', currentUserId);

  if (!currentUserId) {
    console.warn('[DELETE] Unauthorized: Missing userId in headers');
    return NextResponse.json(
      { success: false, error: 'Unauthorized access: educator not identified' },
      { status: 401 }
    );
  }

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { lesson_id: lessonId },
      include: {
        module: true,
      },
    });

    if (!lesson) {
      console.warn('[DELETE] Lesson not found for lessonId:', lessonId);
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 }
      );
    }

    console.log('[DELETE] Fetched lesson and module details:', {
      lessonId: lesson.lesson_id,
      moduleId: lesson.module.module_id,
      createdBy: lesson.module.created_by,
    });

    if (lesson.module.created_by !== currentUserId) {
      console.warn('[DELETE] Unauthorized delete attempt:', {
        currentUserId,
        createdBy: lesson.module.created_by,
      });
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized to delete this lesson',
          currentUserId,
          createdBy: lesson.module.created_by,
        },
        { status: 403 }
      );
    }

    console.log('[DELETE] Deleting associated lecture materials...');
    await prisma.lectureMaterial.deleteMany({
      where: { lesson_id: lessonId },
    });

    console.log('[DELETE] Deleting lesson...');
    await prisma.lesson.delete({
      where: { lesson_id: lessonId },
    });

    console.log('[DELETE] Lesson deleted successfully:', lessonId);
    return NextResponse.json({ success: true, message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('[DELETE] Error deleting lesson:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  const { lessonId } = params;
  const body = await req.json();
  const { title } = body;

  // Simulated current educator's user_id (replace with real authentication)
  const currentUserId = req.headers.get('x-user-id'); // e.g., from middleware or JWT

  if (!currentUserId) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized access: educator not identified' },
      { status: 401 }
    );
  }

  if (!title || title.trim() === '') {
    return NextResponse.json(
      { success: false, error: 'Lesson title is required' },
      { status: 400 }
    );
  }

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { lesson_id: lessonId },
      include: {
        module: true,
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 }
      );
    }

    if (lesson.module.created_by !== currentUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to update this lesson' },
        { status: 403 }
      );
    }

    const updatedLesson = await prisma.lesson.update({
      where: { lesson_id: lessonId },
      data: { title },
    });

    return NextResponse.json({
      success: true,
      message: 'Lesson updated successfully',
      lesson: updatedLesson,
    });
  } catch (error) {
    console.error('Error updating lesson:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
