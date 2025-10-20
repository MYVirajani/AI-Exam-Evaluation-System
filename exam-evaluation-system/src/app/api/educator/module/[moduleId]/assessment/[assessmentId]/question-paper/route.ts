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
    const { assessmentId } = params;
    console.log(`Received POST request to upload Question Paper for Assessment ID: ${assessmentId}`);

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.warn('No file provided in the form data');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`Received file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedTypes.includes(file.type)) {
      console.warn(`Invalid file type: ${file.type}`);
      return NextResponse.json(
        { error: 'Only PDF and DOCX files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.warn(`File too large: ${file.size} bytes`);
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Prepare upload directory
    const projectRoot = process.cwd();
    const parentDir = path.dirname(projectRoot);
    const baseDir = path.join(parentDir, 'data');
    const uploadDir = path.join(baseDir, 'Question_Paper');

    try {
      await fs.access(uploadDir);
      console.log(`Upload directory exists: ${uploadDir}`);
    } catch {
      console.log(`Upload directory does not exist. Creating: ${uploadDir}`);
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Generate file path
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);
    const relativeFilePath = path.join('data', 'Question_Paper', fileName);

    console.log(`Saving file as: ${filePath}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);
    console.log(`File successfully saved to disk.`);

    // Check for existing Question Paper for the assessment
    const existingQP = await prisma.question_Paper.findUnique({
      where: { assessment_id: assessmentId },
    });

    let questionPaper;

    if (existingQP) {
      console.log(`Existing Question Paper found. Updating record...`);

      // Delete old file
      try {
        const oldFilePath = path.join(baseDir, existingQP.file_url.replace('data/', ''));
        await fs.unlink(oldFilePath);
        console.log(`Old file deleted: ${oldFilePath}`);
      } catch (err) {
        console.warn('Failed to delete old file (might not exist):', err);
      }

      // Update existing record
      questionPaper = await prisma.question_Paper.update({
        where: { question_paper_id: existingQP.question_paper_id },
        data: {
          file_url: relativeFilePath,
          created_on: new Date(),
        },
      });
      console.log(`Database record updated for question_paper_id: ${questionPaper.question_paper_id}`);
    } else {
      console.log(`No existing Question Paper found. Creating new record...`);

      // Create new record
      questionPaper = await prisma.question_Paper.create({
        data: {
          question_paper_id: uuidv4(),
          assessment_id: assessmentId,
          file_url: relativeFilePath,
          created_on: new Date(),
        },
      });
      console.log(`New record created with question_paper_id: ${questionPaper.question_paper_id}`);
    }

    return NextResponse.json({
      success: true,
      file_url: relativeFilePath,
      question_paper_id: questionPaper.question_paper_id,
    });
  } catch (error) {
    console.error('Error uploading question paper:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
