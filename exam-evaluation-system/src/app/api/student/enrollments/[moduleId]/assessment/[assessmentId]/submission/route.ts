import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  request: Request,
  { params }: { params: {  assessmentId: string } }
) {
  console.log('Starting submission upload process...');
  console.log(`Received request for module:  assessment: ${params.assessmentId}`);

  try {
    const { assessmentId } = params;

    console.log('Parsing form data...');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const studentId = formData.get('studentId') as string;
    //69d85990-c726-42ec-97aa-4bc50aa05df3

    console.log('Validating input...');
    if (!file) {
      console.error('No file provided in the request');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    if (!studentId) {
      console.error('No student ID provided in the request');
      return NextResponse.json({ error: 'No student ID provided' }, { status: 400 });
    }

    console.log(`Received file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
    console.log(`Student ID: ${studentId}`);

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      console.error(`Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}`);
      return NextResponse.json(
        { error: 'Only PDF and DOCX files are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      console.error(`File too large: ${file.size} bytes (max 5MB allowed)`);
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

    console.log(`Preparing upload directory: ${uploadDir}`);
    try {
      await fs.access(uploadDir);
      console.log('Upload directory already exists');
    } catch {
      console.log('Upload directory does not exist, creating...');
      await fs.mkdir(uploadDir, { recursive: true });
      console.log('Upload directory created successfully');
    }

    // Generate unique file path
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);
    const relativeFilePath = path.join('data', 'Answer_Scripts', assessmentId, fileName);

    console.log(`Generated file path: ${filePath}`);
    console.log('Converting file to buffer...');

    const buffer = Buffer.from(await file.arrayBuffer());
    
    console.log('Writing file to disk...');
    await fs.writeFile(filePath, buffer);
    console.log('File successfully written to disk');

    console.log('Creating submission record in database...');
    const submission = await prisma.submission.create({
      data: {
        submission_id: uuidv4(),
        assessment_id: assessmentId,
        student_id: studentId,
        file_url: relativeFilePath,
        submission_start_at: new Date(),
        type:'DOCUMENT'
      },
    });

    console.log('Submission record created successfully:', {
      submissionId: submission.submission_id,
      fileUrl: relativeFilePath
    });

    return NextResponse.json({
      success: true,
      message: 'Submission uploaded successfully',
      file_url: relativeFilePath,
      submission_id: submission.submission_id,
    });

  } catch (error) {
    console.error('Error in submission upload process:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    console.log('Submission upload process completed');
  }
}