import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

// =========================
// UPLOAD MODEL ANSWER (POST)
// =========================
export async function POST(
  request: Request,
  { params }: { params: { moduleId: string; assessmentId: string } }
) {
  try {
    const { assessmentId } = params;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF and DOCX files are allowed' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    const projectRoot = process.cwd();
    const parentDir = path.dirname(projectRoot);
    const baseDir = path.join(parentDir, 'data');
    const uploadDir = path.join(baseDir, 'Model_Answers');

    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);
    const relativeFilePath = path.join('data', 'Model_Answers', fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Check if existing record exists
    const existingModelAnswer = await prisma.model_Answer_Paper.findUnique({
      where: { assessment_id: assessmentId },
    });

    let modelAnswer;
    if (existingModelAnswer) {
      // Delete old file
      try {
        const oldFilePath = path.join(parentDir, existingModelAnswer.file_url);
        await fs.unlink(oldFilePath);
      } catch (error) {
        console.error('Error deleting old file:', error);
      }

      // Update record
      modelAnswer = await prisma.model_Answer_Paper.update({
        where: { id: existingModelAnswer.id },
        data: {
          file_url: relativeFilePath,
          created_on: new Date(),
        },
      });
    } else {
      // Create new record
      modelAnswer = await prisma.model_Answer_Paper.create({
        data: {
          assessment_id: assessmentId,
          file_url: relativeFilePath,
          created_on: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      file_url: relativeFilePath,
      model_answer_paper_id: modelAnswer.id,
    });
  } catch (error) {
    console.error('Error uploading model answer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =========================
// DELETE MODEL ANSWER (DELETE)
// =========================
export async function DELETE(
  request: Request,
  { params }: { params: { moduleId: string; assessmentId: string } }
) {
  try {
    const { assessmentId } = params;

    // Find existing record
    const existingModelAnswer = await prisma.model_Answer_Paper.findUnique({
      where: { assessment_id: assessmentId },
    });

    if (!existingModelAnswer) {
      return NextResponse.json(
        { error: 'No model answer found for this assessment' },
        { status: 404 }
      );
    }

    // Build absolute file path
    const projectRoot = process.cwd();
    const parentDir = path.dirname(projectRoot);
    const absolutePath = path.join(parentDir, existingModelAnswer.file_url);

    // Delete file
    try {
      await fs.unlink(absolutePath);
    } catch (error) {
      console.error('File deletion error:', error);
      // Continue even if file is missing
    }

    // Delete DB record
    await prisma.model_Answer_Paper.delete({
      where: { id: existingModelAnswer.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Model answer deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting model answer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
