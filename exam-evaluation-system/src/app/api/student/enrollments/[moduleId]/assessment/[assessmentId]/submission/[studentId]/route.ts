import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  request: Request,
  { params }: { params: { studentId: string; assessmentId: string; moduleId: string } }
) {
  console.log('Starting submission upload process...');
  const { assessmentId, studentId } = params;

  try {
    console.log(`Parsing form data...`);
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`Received file: ${file.name} (${file.type}, ${file.size} bytes)`);

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
    }

    // Prepare file path
    const projectRoot = process.cwd();
    const parentDir = path.dirname(projectRoot);
    const uploadBase = path.join(parentDir, 'data', 'Answer_Scripts', assessmentId);
    await fs.mkdir(uploadBase, { recursive: true });

    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    const fullPath = path.join(uploadBase, fileName);
    const relativePath = path.join('data', 'Answer_Scripts', assessmentId, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(fullPath, buffer);

    // Insert into Submission table
    const newSubmission = await prisma.submission.create({
      data: {
        submission_id: uuidv4(),
        assessment_id: assessmentId,
        student_id: studentId, // <- This should match registration_number, not user_id
        file_url: relativePath,
        submission_time: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Submission uploaded successfully',
      file_url: relativePath,
      submission_id: newSubmission.submission_id,
    });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
