import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  request: Request,
  { params }: { params: { studentId: string; moduleId: string; assessmentId: string } }
) {
  try {
    const { assessmentId, studentId } = params;

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
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

    // Create upload directory
    const projectRoot = process.cwd();
    const parentDir = path.dirname(projectRoot);
    const baseDir = path.join(parentDir, 'data');
    const uploadDir = path.join(baseDir, 'Answer_Scripts', assessmentId);

    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Sanitize file name and generate a unique file path
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);
    const relativeFilePath = path.join('data', 'Answer_Scripts', assessmentId, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Save submission record
    const submission = await prisma.submission.create({
      data: {
        submission_id: uuidv4(),
        assessment_id: assessmentId,
        student_id: studentId,
        file_url: relativeFilePath,
        submission_time: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Submission uploaded successfully',
      file_url: relativeFilePath,
      submission_id: submission.submission_id,
    });
  } catch (error) {
    console.error('Error uploading submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
