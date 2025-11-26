import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  const { lessonId } = params;
  console.log('[DELETE] Incoming request to delete lesson:', lessonId);

  const currentUserId = req.headers.get('userId');
  console.log('[DELETE] Extracted currentUserId:', currentUserId);

  if (!currentUserId) {
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
        materials: {
          include: {
            lecture_material_media: true,
          }
        }
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
        { success: false, error: 'Unauthorized to delete this lesson' },
        { status: 403 }
      );
    }

    console.log('[DELETE] Starting cascading deletion...');

    // 1️⃣ DELETE ALL MEDIA FOR EACH LECTURE MATERIAL
    const materialIds = lesson.materials.map(mat => mat.id);

    console.log('[DELETE] Deleting media for materials:', materialIds);

    await prisma.lecture_material_media.deleteMany({
      where: {
        lecture_material_id: { in: materialIds }
      },
    });

    // 2️⃣ DELETE LECTURE MATERIALS
    console.log('[DELETE] Deleting lecture materials...');
    await prisma.lecture_Material.deleteMany({
      where: { lesson_id: lessonId },
    });

    // 3️⃣ DELETE THE LESSON
    console.log('[DELETE] Deleting lesson...');
    await prisma.lesson.delete({
      where: { lesson_id: lessonId },
    });

    console.log('[DELETE] Lesson and all associated data deleted successfully.');
    return NextResponse.json({
      success: true,
      message: 'Lesson, materials, and media deleted successfully',
    });

  } catch (error) {
    console.error('[DELETE] Error:', error);
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
