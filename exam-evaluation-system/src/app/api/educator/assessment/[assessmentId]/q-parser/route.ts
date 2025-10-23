import { NextResponse } from 'next/server';
import * as path from 'path';
import * as fs from 'fs/promises';
import { FILE_CONFIG, getMaxSizeInBytes } from '@/lib/fileConfig';

export async function POST(
  request: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const { assessmentId } = params;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate extension
    const allowedExtensions = FILE_CONFIG.Q_PARSER.types;
    const fileExtension = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${allowedExtensions.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate size
    if (file.size > getMaxSizeInBytes(FILE_CONFIG.Q_PARSER.maxSizeMB)) {
      return NextResponse.json(
        { error: `File size must be less than ${FILE_CONFIG.Q_PARSER.maxSizeMB}MB` },
        { status: 400 }
      );
    }

    // Create upload directory
    const projectRoot = process.cwd();
    const parentDir = path.dirname(projectRoot);
    const baseDir = path.join(parentDir, 'data');
    const uploadDir = path.join(baseDir, 'Q_Parser');

    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    // Rename file to assessmentId
    const fileName = `${assessmentId}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);
    const relativeFilePath = path.join('data', 'Q_Parser', fileName);

    // If file exists, replace it
    try {
      await fs.unlink(filePath);
    } catch {
      // ignore if doesn't exist
    }

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // Call Flask API for question extraction
    const flaskRes = await fetch('http://127.0.0.1:5000/extract-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_path: filePath }), // absolute path for Flask
    });

    let questions = [];
    if (flaskRes.ok) {
      questions = await flaskRes.json();
    } else {
      console.error('Flask extraction failed:', await flaskRes.text());
    }

    return NextResponse.json({
      success: true,
      file_url: relativeFilePath,
      questions,
    });
  } catch (error) {
    console.error('Error uploading Q_PARSER file:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
