import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
export async function POST(
  request: Request,
  { params }: { params: { moduleId: string; assessmentId: string } }
) {
  try {
    // const session = await getServerSession(authOptions);
    // if (!session || !session.user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    const {  assessmentId } = params;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF and DOCX files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    const projectRoot = process.cwd();
    const parentDir = path.dirname(projectRoot);
    const baseDir = path.join(parentDir, 'data');
    const uploadDir = path.join(baseDir, 'Model_Answers');

    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);
    const relativeFilePath = path.join('data', 'Model_Answers', fileName);

    // Convert file to buffer and save to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Save to database
    const existingModelAnswer = await prisma.model_Answer_Paper.findUnique({
      where: { assessment_id: assessmentId },
    });

    let modelAnswer;
    if (existingModelAnswer) {
      // Delete old file if exists
      try {
        const oldFilePath = path.join(baseDir, existingModelAnswer.file_url.replace('data/', ''));
        await fs.unlink(oldFilePath);
      } catch (error) {
        console.error('Error deleting old file:', error);
      }

      // Update existing record
      modelAnswer = await prisma.model_Answer_Paper.update({
        where: { model_answer_paper_id: existingModelAnswer.model_answer_paper_id },
        data: {
          file_url: relativeFilePath,
          created_on: new Date(),
        },
      });
    } else {
      // Create new record
      modelAnswer = await prisma.model_Answer_Paper.create({
        data: {
          model_answer_paper_id: uuidv4(),
          assessment_id: assessmentId,
          file_url: relativeFilePath,
          created_on: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      file_url: relativeFilePath,
      model_answer_paper_id: modelAnswer.model_answer_paper_id,
    });
  } catch (error) {
    console.error('Error uploading model answer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
