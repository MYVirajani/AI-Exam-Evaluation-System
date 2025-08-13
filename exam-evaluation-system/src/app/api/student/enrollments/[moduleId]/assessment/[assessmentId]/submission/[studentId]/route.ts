// // // // // // // // // import { NextResponse } from 'next/server';
// // // // // // // // // import { prisma } from '@/lib/prisma';
// // // // // // // // // import * as path from 'path';
// // // // // // // // // import * as fs from 'fs/promises';
// // // // // // // // // import { v4 as uuidv4 } from 'uuid';

// // // // // // // // // export async function POST(
// // // // // // // // //   request: Request,
// // // // // // // // //   { params }: { params: { studentId: string; assessmentId: string; moduleId: string } }
// // // // // // // // // ) {
// // // // // // // // //   console.log('Starting submission upload process...');
// // // // // // // // //   const { assessmentId, studentId } = params;

// // // // // // // // //   try {
// // // // // // // // //     console.log(`Parsing form data...`);
// // // // // // // // //     const formData = await request.formData();
// // // // // // // // //     const file = formData.get('file') as File;

// // // // // // // // //     if (!file) {
// // // // // // // // //       return NextResponse.json({ error: 'No file provided' }, { status: 400 });
// // // // // // // // //     }

// // // // // // // // //     console.log(`Received file: ${file.name} (${file.type}, ${file.size} bytes)`);

// // // // // // // // //     const allowedTypes = [
// // // // // // // // //       'application/pdf',
// // // // // // // // //       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
// // // // // // // // //     ];

// // // // // // // // //     if (!allowedTypes.includes(file.type)) {
// // // // // // // // //       return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
// // // // // // // // //     }

// // // // // // // // //     if (file.size > 5 * 1024 * 1024) {
// // // // // // // // //       return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
// // // // // // // // //     }

// // // // // // // // //     // Prepare file path
// // // // // // // // //     const projectRoot = process.cwd();
// // // // // // // // //     const parentDir = path.dirname(projectRoot);
// // // // // // // // //     const uploadBase = path.join(parentDir, 'data', 'Answer_Scripts', assessmentId);
// // // // // // // // //     await fs.mkdir(uploadBase, { recursive: true });

// // // // // // // // //     const fileExtension = path.extname(file.name);
// // // // // // // // //     const fileName = `${uuidv4()}${fileExtension}`;
// // // // // // // // //     const fullPath = path.join(uploadBase, fileName);
// // // // // // // // //     const relativePath = path.join('data', 'Answer_Scripts', assessmentId, fileName);

// // // // // // // // //     const buffer = Buffer.from(await file.arrayBuffer());
// // // // // // // // //     await fs.writeFile(fullPath, buffer);

// // // // // // // // //     // Insert into Submission table
// // // // // // // // //     const newSubmission = await prisma.submission.create({
// // // // // // // // //       data: {
// // // // // // // // //         submission_id: uuidv4(),
// // // // // // // // //         assessment_id: assessmentId,
// // // // // // // // //         student_id: studentId, // <- This should match registration_number, not user_id
// // // // // // // // //         file_url: relativePath,
// // // // // // // // //         submission_time: new Date(),
// // // // // // // // //       },
// // // // // // // // //     });

// // // // // // // // //     return NextResponse.json({
// // // // // // // // //       success: true,
// // // // // // // // //       message: 'Submission uploaded successfully',
// // // // // // // // //       file_url: relativePath,
// // // // // // // // //       submission_id: newSubmission.submission_id,
// // // // // // // // //     });
// // // // // // // // //   } catch (error) {
// // // // // // // // //     console.error('Submission error:', error);
// // // // // // // // //     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
// // // // // // // // //   }
// // // // // // // // // }

// // // // // // // // import { NextResponse } from 'next/server';
// // // // // // // // import { prisma } from '@/lib/prisma';
// // // // // // // // import * as path from 'path';
// // // // // // // // import * as fs from 'fs/promises';
// // // // // // // // import { v4 as uuidv4 } from 'uuid';

// // // // // // // // export async function POST(
// // // // // // // //   request: Request,
// // // // // // // //   { params }: { params: { studentId: string; assessmentId: string; moduleId: string } }
// // // // // // // // ) {
// // // // // // // //   console.log('Starting submission upload process...');
// // // // // // // //   const { assessmentId, studentId } = params;

// // // // // // // //   try {
// // // // // // // //     console.log(`Parsing form data...`);
// // // // // // // //     const formData = await request.formData();
// // // // // // // //     const file = formData.get('file') as File;
// // // // // // // //     const isHandwritten = formData.get('isHandwritten') === 'true';

// // // // // // // //     if (!file) {
// // // // // // // //       return NextResponse.json({ error: 'No file provided' }, { status: 400 });
// // // // // // // //     }

// // // // // // // //     console.log(`Received file: ${file.name} (${file.type}, ${file.size} bytes)`);
// // // // // // // //     console.log(`Is handwritten: ${isHandwritten}`);

// // // // // // // //     // For handwritten, only allow PDF
// // // // // // // //     if (isHandwritten) {
// // // // // // // //       if (file.type !== 'application/pdf') {
// // // // // // // //         return NextResponse.json({ error: 'Handwritten submissions must be in PDF format only' }, { status: 400 });
// // // // // // // //       }
// // // // // // // //     } else {
// // // // // // // //       // For digital submissions, allow PDF and DOCX
// // // // // // // //       const allowedTypes = [
// // // // // // // //         'application/pdf',
// // // // // // // //         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
// // // // // // // //       ];
      
// // // // // // // //       if (!allowedTypes.includes(file.type)) {
// // // // // // // //         return NextResponse.json({ error: 'Invalid file type. Allowed types: PDF, DOCX' }, { status: 400 });
// // // // // // // //       }
// // // // // // // //     }

// // // // // // // //     if (file.size > 5 * 1024 * 1024) {
// // // // // // // //       return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
// // // // // // // //     }

// // // // // // // //     // Prepare file path - use the same method for both types
// // // // // // // //     const projectRoot = process.cwd();
// // // // // // // //     const parentDir = path.dirname(projectRoot);
// // // // // // // //     const uploadBase = path.join(parentDir, 'data', 'Answer_Scripts', assessmentId);
// // // // // // // //     await fs.mkdir(uploadBase, { recursive: true });

// // // // // // // //     const fileExtension = path.extname(file.name);
// // // // // // // //     const fileName = `${uuidv4()}${fileExtension}`;
// // // // // // // //     const fullPath = path.join(uploadBase, fileName);
// // // // // // // //     const relativePath = path.join('data', 'Answer_Scripts', assessmentId, fileName);

// // // // // // // //     const buffer = Buffer.from(await file.arrayBuffer());
// // // // // // // //     await fs.writeFile(fullPath, buffer);

// // // // // // // //     // Check if there's already a submission for this student and assessment
// // // // // // // //     const existingSubmission = await prisma.submission.findFirst({
// // // // // // // //       where: {
// // // // // // // //         assessment_id: assessmentId,
// // // // // // // //         student_id: studentId,
// // // // // // // //       },
// // // // // // // //     });

// // // // // // // //     if (isHandwritten) {
// // // // // // // //       if (existingSubmission) {
// // // // // // // //         // Update existing submission with handwritten file
// // // // // // // //         const updatedSubmission = await prisma.submission.update({
// // // // // // // //           where: {
// // // // // // // //             submission_id: existingSubmission.submission_id,
// // // // // // // //           },
// // // // // // // //           data: {
// // // // // // // //             is_handwritten: true,
// // // // // // // //             handwritten_file_url: relativePath,
// // // // // // // //             submission_time: new Date(),
// // // // // // // //             // Keep file_url as null until conversion is complete
// // // // // // // //             file_url: null,
// // // // // // // //           },
// // // // // // // //         });

// // // // // // // //         console.log(`Handwritten file updated for submission ID: ${updatedSubmission.submission_id}`);

// // // // // // // //         // TODO: Trigger digital conversion process here
// // // // // // // //         // await triggerDigitalConversion(updatedSubmission.submission_id, relativePath);

// // // // // // // //         return NextResponse.json({
// // // // // // // //           success: true,
// // // // // // // //           message: 'Submission uploaded successfully',
// // // // // // // //           submission_id: updatedSubmission.submission_id,
// // // // // // // //           handwritten_file_url: relativePath,
// // // // // // // //         });
// // // // // // // //       } else {
// // // // // // // //         // Create new handwritten submission
// // // // // // // //         const newSubmission = await prisma.submission.create({
// // // // // // // //           data: {
// // // // // // // //             submission_id: uuidv4(),
// // // // // // // //             assessment_id: assessmentId,
// // // // // // // //             student_id: studentId,
// // // // // // // //             file_url: null, // Keep null until conversion is complete
// // // // // // // //             is_handwritten: true,
// // // // // // // //             handwritten_file_url: relativePath,
// // // // // // // //             submission_time: new Date(),
// // // // // // // //           },
// // // // // // // //         });

// // // // // // // //         console.log(`Handwritten submission created with ID: ${newSubmission.submission_id}`);

// // // // // // // //         // TODO: Trigger digital conversion process here
// // // // // // // //         // await triggerDigitalConversion(newSubmission.submission_id, relativePath);

// // // // // // // //         return NextResponse.json({
// // // // // // // //           success: true,
// // // // // // // //           message: 'Submission uploaded successfully',
// // // // // // // //           submission_id: newSubmission.submission_id,
// // // // // // // //           handwritten_file_url: relativePath,
// // // // // // // //         });
// // // // // // // //       }
// // // // // // // //     } else {
// // // // // // // //       // Handle regular digital submission
// // // // // // // //       if (existingSubmission) {
// // // // // // // //         // Update existing submission
// // // // // // // //         const updatedSubmission = await prisma.submission.update({
// // // // // // // //           where: {
// // // // // // // //             submission_id: existingSubmission.submission_id,
// // // // // // // //           },
// // // // // // // //           data: {
// // // // // // // //             file_url: relativePath,
// // // // // // // //             submission_time: new Date(),
// // // // // // // //             // Reset handwritten fields if this is now a digital submission
// // // // // // // //             is_handwritten: false,
// // // // // // // //             handwritten_file_url: null,
// // // // // // // //           },
// // // // // // // //         });

// // // // // // // //         return NextResponse.json({
// // // // // // // //           success: true,
// // // // // // // //           message: 'Submission updated successfully',
// // // // // // // //           submission_id: updatedSubmission.submission_id,
// // // // // // // //           file_url: relativePath,
// // // // // // // //         });
// // // // // // // //       } else {
// // // // // // // //         // Create new digital submission
// // // // // // // //         const newSubmission = await prisma.submission.create({
// // // // // // // //           data: {
// // // // // // // //             submission_id: uuidv4(),
// // // // // // // //             assessment_id: assessmentId,
// // // // // // // //             student_id: studentId,
// // // // // // // //             file_url: relativePath,
// // // // // // // //             submission_time: new Date(),
// // // // // // // //             is_handwritten: false,
// // // // // // // //           },
// // // // // // // //         });

// // // // // // // //         return NextResponse.json({
// // // // // // // //           success: true,
// // // // // // // //           message: 'Submission uploaded successfully',
// // // // // // // //           submission_id: newSubmission.submission_id,
// // // // // // // //           file_url: relativePath,
// // // // // // // //         });
// // // // // // // //       }
// // // // // // // //     }
// // // // // // // //   } catch (error) {
// // // // // // // //     console.error('Submission error:', error);
// // // // // // // //     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
// // // // // // // //   }
// // // // // // // // }

// // // // // // // import { NextResponse } from 'next/server';
// // // // // // // import { prisma } from '@/lib/prisma';
// // // // // // // import * as path from 'path';
// // // // // // // import * as fs from 'fs/promises';
// // // // // // // import { v4 as uuidv4 } from 'uuid';

// // // // // // // export async function POST(
// // // // // // //   request: Request,
// // // // // // //   { params }: { params: { studentId: string; assessmentId: string; moduleId: string } }
// // // // // // // ) {
// // // // // // //   console.log('Starting submission upload process...');
  
// // // // // // //   // Extract all parameters from the route
// // // // // // //   const { assessmentId, studentId, moduleId } = params;
  
// // // // // // //   console.log(`Parameters - Assessment ID: ${assessmentId}, Student ID: ${studentId}, Module ID: ${moduleId}`);

// // // // // // //   try {
// // // // // // //     console.log(`Parsing form data...`);
// // // // // // //     const formData = await request.formData();
// // // // // // //     const file = formData.get('file') as File;
// // // // // // //     const isHandwritten = formData.get('isHandwritten') === 'true';

// // // // // // //     if (!file) {
// // // // // // //       return NextResponse.json({ error: 'No file provided' }, { status: 400 });
// // // // // // //     }

// // // // // // //     console.log(`Received file: ${file.name} (${file.type}, ${file.size} bytes)`);
// // // // // // //     console.log(`Is handwritten: ${isHandwritten}`);

// // // // // // //     // For handwritten, only allow PDF
// // // // // // //     if (isHandwritten) {
// // // // // // //       if (file.type !== 'application/pdf') {
// // // // // // //         return NextResponse.json({ 
// // // // // // //           error: 'Handwritten submissions must be in PDF format only' 
// // // // // // //         }, { status: 400 });
// // // // // // //       }
// // // // // // //     } else {
// // // // // // //       // For digital submissions, allow PDF and DOCX
// // // // // // //       const allowedTypes = [
// // // // // // //         'application/pdf',
// // // // // // //         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
// // // // // // //       ];
      
// // // // // // //       if (!allowedTypes.includes(file.type)) {
// // // // // // //         return NextResponse.json({ 
// // // // // // //           error: 'Invalid file type. Allowed types: PDF, DOCX' 
// // // // // // //         }, { status: 400 });
// // // // // // //       }
// // // // // // //     }

// // // // // // //     if (file.size > 5 * 1024 * 1024) {
// // // // // // //       return NextResponse.json({ 
// // // // // // //         error: 'File too large (max 5MB)' 
// // // // // // //       }, { status: 400 });
// // // // // // //     }

// // // // // // //     // Prepare file path - use the same method for both types
// // // // // // //     const projectRoot = process.cwd();
// // // // // // //     const parentDir = path.dirname(projectRoot);
// // // // // // //     const uploadBase = path.join(parentDir, 'data', 'Answer_Scripts', assessmentId);
// // // // // // //     await fs.mkdir(uploadBase, { recursive: true });

// // // // // // //     const fileExtension = path.extname(file.name);
// // // // // // //     const fileName = `${uuidv4()}${fileExtension}`;
// // // // // // //     const fullPath = path.join(uploadBase, fileName);
// // // // // // //     const relativePath = path.join('data', 'Answer_Scripts', assessmentId, fileName);

// // // // // // //     const buffer = Buffer.from(await file.arrayBuffer());
// // // // // // //     await fs.writeFile(fullPath, buffer);

// // // // // // //     console.log(`File saved to: ${fullPath}`);

// // // // // // //     // Check if there's already a submission for this student and assessment
// // // // // // //     const existingSubmission = await prisma.submission.findFirst({
// // // // // // //       where: {
// // // // // // //         assessment_id: assessmentId,
// // // // // // //         student_id: studentId,
// // // // // // //       },
// // // // // // //     });

// // // // // // //     if (isHandwritten) {
// // // // // // //       if (existingSubmission) {
// // // // // // //         // Update existing submission with handwritten file
// // // // // // //         const updatedSubmission = await prisma.submission.update({
// // // // // // //           where: {
// // // // // // //             submission_id: existingSubmission.submission_id,
// // // // // // //           },
// // // // // // //           data: {
// // // // // // //             is_handwritten: true,
// // // // // // //             handwritten_file_url: relativePath,
// // // // // // //             submission_time: new Date(),
// // // // // // //             // Keep file_url as null until conversion is complete
// // // // // // //             file_url: null,
// // // // // // //           },
// // // // // // //         });

// // // // // // //         console.log(`Handwritten file updated for submission ID: ${updatedSubmission.submission_id}`);

// // // // // // //         // TODO: Trigger digital conversion process here
// // // // // // //         // await triggerDigitalConversion(updatedSubmission.submission_id, relativePath);

// // // // // // //         return NextResponse.json({
// // // // // // //           success: true,
// // // // // // //           message: 'Handwritten submission uploaded successfully',
// // // // // // //           submission_id: updatedSubmission.submission_id,
// // // // // // //           handwritten_file_url: relativePath,
// // // // // // //         });
// // // // // // //       } else {
// // // // // // //         // Create new handwritten submission
// // // // // // //         const newSubmission = await prisma.submission.create({
// // // // // // //           data: {
// // // // // // //             submission_id: uuidv4(),
// // // // // // //             assessment_id: assessmentId,
// // // // // // //             student_id: studentId,
// // // // // // //             file_url: null, // Keep null until conversion is complete
// // // // // // //             is_handwritten: true,
// // // // // // //             handwritten_file_url: relativePath,
// // // // // // //             submission_time: new Date(),
// // // // // // //           },
// // // // // // //         });

// // // // // // //         console.log(`Handwritten submission created with ID: ${newSubmission.submission_id}`);

// // // // // // //         // TODO: Trigger digital conversion process here
// // // // // // //         // await triggerDigitalConversion(newSubmission.submission_id, relativePath);

// // // // // // //         return NextResponse.json({
// // // // // // //           success: true,
// // // // // // //           message: 'Handwritten submission uploaded successfully',
// // // // // // //           submission_id: newSubmission.submission_id,
// // // // // // //           handwritten_file_url: relativePath,
// // // // // // //         });
// // // // // // //       }
// // // // // // //     } else {
// // // // // // //       // Handle regular digital submission
// // // // // // //       if (existingSubmission) {
// // // // // // //         // Update existing submission
// // // // // // //         const updatedSubmission = await prisma.submission.update({
// // // // // // //           where: {
// // // // // // //             submission_id: existingSubmission.submission_id,
// // // // // // //           },
// // // // // // //           data: {
// // // // // // //             file_url: relativePath,
// // // // // // //             submission_time: new Date(),
// // // // // // //             // Reset handwritten fields if this is now a digital submission
// // // // // // //             is_handwritten: false,
// // // // // // //             handwritten_file_url: null,
// // // // // // //           },
// // // // // // //         });

// // // // // // //         console.log(`Digital submission updated with ID: ${updatedSubmission.submission_id}`);

// // // // // // //         return NextResponse.json({
// // // // // // //           success: true,
// // // // // // //           message: 'Digital submission updated successfully',
// // // // // // //           submission_id: updatedSubmission.submission_id,
// // // // // // //           file_url: relativePath,
// // // // // // //         });
// // // // // // //       } else {
// // // // // // //         // Create new digital submission
// // // // // // //         const newSubmission = await prisma.submission.create({
// // // // // // //           data: {
// // // // // // //             submission_id: uuidv4(),
// // // // // // //             assessment_id: assessmentId,
// // // // // // //             student_id: studentId,
// // // // // // //             file_url: relativePath,
// // // // // // //             submission_time: new Date(),
// // // // // // //             is_handwritten: false,
// // // // // // //           },
// // // // // // //         });

// // // // // // //         console.log(`Digital submission created with ID: ${newSubmission.submission_id}`);

// // // // // // //         return NextResponse.json({
// // // // // // //           success: true,
// // // // // // //           message: 'Digital submission uploaded successfully',
// // // // // // //           submission_id: newSubmission.submission_id,
// // // // // // //           file_url: relativePath,
// // // // // // //         });
// // // // // // //       }
// // // // // // //     }
// // // // // // //   } catch (error) {
// // // // // // //     console.error('Submission upload error:', error);
// // // // // // //     return NextResponse.json({ 
// // // // // // //       error: 'Internal Server Error',
// // // // // // //       details: error instanceof Error ? error.message : 'Unknown error'
// // // // // // //     }, { status: 500 });
// // // // // // //   }
// // // // // // // }

// // // // // // import { NextResponse } from 'next/server';
// // // // // // import { prisma } from '@/lib/prisma';
// // // // // // import * as path from 'path';
// // // // // // import * as fs from 'fs/promises';
// // // // // // import { v4 as uuidv4 } from 'uuid';

// // // // // // export async function POST(
// // // // // //   request: Request,
// // // // // //   { params }: { params: { studentId: string; assessmentId: string; moduleId: string } }
// // // // // // ) {
// // // // // //   console.log('Starting submission upload process...');
  
// // // // // //   // Extract all parameters from the route
// // // // // //   const { assessmentId, studentId, moduleId } = params;
  
// // // // // //   console.log(`Parameters - Assessment ID: ${assessmentId}, Student ID: ${studentId}, Module ID: ${moduleId}`);

// // // // // //   try {
// // // // // //     console.log(`Parsing form data...`);
// // // // // //     const formData = await request.formData();
// // // // // //     const file = formData.get('file') as File;
// // // // // //     const isHandwritten = formData.get('isHandwritten') === 'true';

// // // // // //     if (!file) {
// // // // // //       return NextResponse.json({ error: 'No file provided' }, { status: 400 });
// // // // // //     }

// // // // // //     console.log(`Received file: ${file.name} (${file.type}, ${file.size} bytes)`);
// // // // // //     console.log(`Is handwritten: ${isHandwritten}`);

// // // // // //     // For handwritten, only allow PDF
// // // // // //     if (isHandwritten) {
// // // // // //       if (file.type !== 'application/pdf') {
// // // // // //         return NextResponse.json({ 
// // // // // //           error: 'Handwritten submissions must be in PDF format only' 
// // // // // //         }, { status: 400 });
// // // // // //       }
// // // // // //     } else {
// // // // // //       // For digital submissions, allow PDF and DOCX
// // // // // //       const allowedTypes = [
// // // // // //         'application/pdf',
// // // // // //         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
// // // // // //       ];
      
// // // // // //       if (!allowedTypes.includes(file.type)) {
// // // // // //         return NextResponse.json({ 
// // // // // //           error: 'Invalid file type. Allowed types: PDF, DOCX' 
// // // // // //         }, { status: 400 });
// // // // // //       }
// // // // // //     }

// // // // // //     if (file.size > 5 * 1024 * 1024) {
// // // // // //       return NextResponse.json({ 
// // // // // //         error: 'File too large (max 5MB)' 
// // // // // //       }, { status: 400 });
// // // // // //     }

// // // // // //     // Prepare file paths - different folders for handwritten and digital submissions
// // // // // //     const projectRoot = process.cwd();
// // // // // //     const parentDir = path.dirname(projectRoot);
    
// // // // // //     let uploadBase: string;
// // // // // //     let relativePath: string;
    
// // // // // //     if (isHandwritten) {
// // // // // //       // Save handwritten submissions to Handwritten_Answer_Scripts folder
// // // // // //       uploadBase = path.join(parentDir, 'data', 'Handwritten_Answer_Scripts', assessmentId);
// // // // // //       await fs.mkdir(uploadBase, { recursive: true });
      
// // // // // //       const fileExtension = path.extname(file.name);
// // // // // //       const fileName = `${uuidv4()}${fileExtension}`;
// // // // // //       const fullPath = path.join(uploadBase, fileName);
// // // // // //       relativePath = path.join('data', 'Handwritten_Answer_Scripts', assessmentId, fileName);
      
// // // // // //       const buffer = Buffer.from(await file.arrayBuffer());
// // // // // //       await fs.writeFile(fullPath, buffer);
      
// // // // // //       console.log(`Handwritten file saved to: ${fullPath}`);
// // // // // //     } else {
// // // // // //       // Save digital submissions to regular Answer_Scripts folder
// // // // // //       uploadBase = path.join(parentDir, 'data', 'Answer_Scripts', assessmentId);
// // // // // //       await fs.mkdir(uploadBase, { recursive: true });
      
// // // // // //       const fileExtension = path.extname(file.name);
// // // // // //       const fileName = `${uuidv4()}${fileExtension}`;
// // // // // //       const fullPath = path.join(uploadBase, fileName);
// // // // // //       relativePath = path.join('data', 'Answer_Scripts', assessmentId, fileName);
      
// // // // // //       const buffer = Buffer.from(await file.arrayBuffer());
// // // // // //       await fs.writeFile(fullPath, buffer);
      
// // // // // //       console.log(`Digital file saved to: ${fullPath}`);
// // // // // //     }

// // // // // //     // Check if there's already a submission for this student and assessment
// // // // // //     const existingSubmission = await prisma.submission.findFirst({
// // // // // //       where: {
// // // // // //         assessment_id: assessmentId,
// // // // // //         student_id: studentId,
// // // // // //       },
// // // // // //     });

// // // // // //     if (isHandwritten) {
// // // // // //       if (existingSubmission) {
// // // // // //         // Update existing submission with handwritten file
// // // // // //         const updatedSubmission = await prisma.submission.update({
// // // // // //           where: {
// // // // // //             submission_id: existingSubmission.submission_id,
// // // // // //           },
// // // // // //           data: {
// // // // // //             is_handwritten: true,
// // // // // //             handwritten_file_url: relativePath,
// // // // // //             submission_time: new Date(),
// // // // // //             // Keep file_url as null until conversion is complete
// // // // // //             file_url: null,
// // // // // //           },
// // // // // //         });

// // // // // //         console.log(`Handwritten file updated for submission ID: ${updatedSubmission.submission_id}`);

// // // // // //         // TODO: Trigger digital conversion process here
// // // // // //         // await triggerDigitalConversion(updatedSubmission.submission_id, relativePath);

// // // // // //         return NextResponse.json({
// // // // // //           success: true,
// // // // // //           message: 'Handwritten submission uploaded successfully',
// // // // // //           submission_id: updatedSubmission.submission_id,
// // // // // //           handwritten_file_url: relativePath,
// // // // // //         });
// // // // // //       } else {
// // // // // //         // Create new handwritten submission
// // // // // //         const newSubmission = await prisma.submission.create({
// // // // // //           data: {
// // // // // //             submission_id: uuidv4(),
// // // // // //             assessment_id: assessmentId,
// // // // // //             student_id: studentId,
// // // // // //             file_url: null, // Keep null until conversion is complete
// // // // // //             is_handwritten: true,
// // // // // //             handwritten_file_url: relativePath,
// // // // // //             submission_time: new Date(),
// // // // // //           },
// // // // // //         });

// // // // // //         console.log(`Handwritten submission created with ID: ${newSubmission.submission_id}`);

// // // // // //         // TODO: Trigger digital conversion process here
// // // // // //         // await triggerDigitalConversion(newSubmission.submission_id, relativePath);

// // // // // //         return NextResponse.json({
// // // // // //           success: true,
// // // // // //           message: 'Handwritten submission uploaded successfully',
// // // // // //           submission_id: newSubmission.submission_id,
// // // // // //           handwritten_file_url: relativePath,
// // // // // //         });
// // // // // //       }
// // // // // //     } else {
// // // // // //       // Handle regular digital submission
// // // // // //       if (existingSubmission) {
// // // // // //         // Update existing submission
// // // // // //         const updatedSubmission = await prisma.submission.update({
// // // // // //           where: {
// // // // // //             submission_id: existingSubmission.submission_id,
// // // // // //           },
// // // // // //           data: {
// // // // // //             file_url: relativePath,
// // // // // //             submission_time: new Date(),
// // // // // //             // Reset handwritten fields if this is now a digital submission
// // // // // //             is_handwritten: false,
// // // // // //             handwritten_file_url: null,
// // // // // //           },
// // // // // //         });

// // // // // //         console.log(`Digital submission updated with ID: ${updatedSubmission.submission_id}`);

// // // // // //         return NextResponse.json({
// // // // // //           success: true,
// // // // // //           message: 'Digital submission updated successfully',
// // // // // //           submission_id: updatedSubmission.submission_id,
// // // // // //           file_url: relativePath,
// // // // // //         });
// // // // // //       } else {
// // // // // //         // Create new digital submission
// // // // // //         const newSubmission = await prisma.submission.create({
// // // // // //           data: {
// // // // // //             submission_id: uuidv4(),
// // // // // //             assessment_id: assessmentId,
// // // // // //             student_id: studentId,
// // // // // //             file_url: relativePath,
// // // // // //             submission_time: new Date(),
// // // // // //             is_handwritten: false,
// // // // // //           },
// // // // // //         });

// // // // // //         console.log(`Digital submission created with ID: ${newSubmission.submission_id}`);

// // // // // //         return NextResponse.json({
// // // // // //           success: true,
// // // // // //           message: 'Digital submission uploaded successfully',
// // // // // //           submission_id: newSubmission.submission_id,
// // // // // //           file_url: relativePath,
// // // // // //         });
// // // // // //       }
// // // // // //     }
// // // // // //   } catch (error) {
// // // // // //     console.error('Submission upload error:', error);
// // // // // //     return NextResponse.json({ 
// // // // // //       error: 'Internal Server Error',
// // // // // //       details: error instanceof Error ? error.message : 'Unknown error'
// // // // // //     }, { status: 500 });
// // // // // //   }
// // // // // // }

// // // // // import { NextResponse } from 'next/server';
// // // // // import { prisma } from '@/lib/prisma';
// // // // // import * as path from 'path';
// // // // // import * as fs from 'fs/promises';
// // // // // import { v4 as uuidv4 } from 'uuid';
// // // // // import { ocrService } from '@/lib/ocrService';

// // // // // export async function POST(
// // // // //   request: Request,
// // // // //   { params }: { params: { studentId: string; assessmentId: string; moduleId: string } }
// // // // // ) {
// // // // //   console.log('Starting submission upload process...');
  
// // // // //   // Extract all parameters from the route
// // // // //   const { assessmentId, studentId, moduleId } = params;
  
// // // // //   console.log(`Parameters - Assessment ID: ${assessmentId}, Student ID: ${studentId}, Module ID: ${moduleId}`);

// // // // //   try {
// // // // //     console.log(`Parsing form data...`);
// // // // //     const formData = await request.formData();
// // // // //     const file = formData.get('file') as File;
// // // // //     const isHandwritten = formData.get('isHandwritten') === 'true';

// // // // //     if (!file) {
// // // // //       return NextResponse.json({ error: 'No file provided' }, { status: 400 });
// // // // //     }

// // // // //     console.log(`Received file: ${file.name} (${file.type}, ${file.size} bytes)`);
// // // // //     console.log(`Is handwritten: ${isHandwritten}`);

// // // // //     // For handwritten, only allow PDF
// // // // //     if (isHandwritten) {
// // // // //       if (file.type !== 'application/pdf') {
// // // // //         return NextResponse.json({ 
// // // // //           error: 'Handwritten submissions must be in PDF format only' 
// // // // //         }, { status: 400 });
// // // // //       }
// // // // //     } else {
// // // // //       // For digital submissions, allow PDF and DOCX
// // // // //       const allowedTypes = [
// // // // //         'application/pdf',
// // // // //         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
// // // // //       ];
      
// // // // //       if (!allowedTypes.includes(file.type)) {
// // // // //         return NextResponse.json({ 
// // // // //           error: 'Invalid file type. Allowed types: PDF, DOCX' 
// // // // //         }, { status: 400 });
// // // // //       }
// // // // //     }

// // // // //     if (file.size > 5 * 1024 * 1024) {
// // // // //       return NextResponse.json({ 
// // // // //         error: 'File too large (max 5MB)' 
// // // // //       }, { status: 400 });
// // // // //     }

// // // // //     // Prepare file paths - different folders for handwritten and digital submissions
// // // // //     const projectRoot = process.cwd();
// // // // //     const parentDir = path.dirname(projectRoot);
    
// // // // //     let uploadBase: string;
// // // // //     let relativePath: string;
    
// // // // //     if (isHandwritten) {
// // // // //       // Save handwritten submissions to Handwritten_Answer_Scripts folder
// // // // //       uploadBase = path.join(parentDir, 'data', 'Handwritten_Answer_Scripts', assessmentId);
// // // // //       await fs.mkdir(uploadBase, { recursive: true });
      
// // // // //       const fileExtension = path.extname(file.name);
// // // // //       const fileName = `${uuidv4()}${fileExtension}`;
// // // // //       const fullPath = path.join(uploadBase, fileName);
// // // // //       relativePath = path.join('data', 'Handwritten_Answer_Scripts', assessmentId, fileName);
      
// // // // //       const buffer = Buffer.from(await file.arrayBuffer());
// // // // //       await fs.writeFile(fullPath, buffer);
      
// // // // //       console.log(`Handwritten file saved to: ${fullPath}`);

// // // // //       // Check if there's already a submission for this student and assessment
// // // // //       const existingSubmission = await prisma.submission.findFirst({
// // // // //         where: {
// // // // //           assessment_id: assessmentId,
// // // // //           student_id: studentId,
// // // // //         },
// // // // //       });

// // // // //       let submissionId: string;
// // // // //       let submissionResult;

// // // // //       if (existingSubmission) {
// // // // //         // Update existing submission with handwritten file
// // // // //         submissionResult = await prisma.submission.update({
// // // // //           where: {
// // // // //             submission_id: existingSubmission.submission_id,
// // // // //           },
// // // // //           data: {
// // // // //             is_handwritten: true,
// // // // //             handwritten_file_url: relativePath,
// // // // //             submission_time: new Date(),
// // // // //             // Keep file_url as null until conversion is complete
// // // // //             file_url: null,
// // // // //           },
// // // // //         });
// // // // //         submissionId = submissionResult.submission_id;
// // // // //         console.log(`Handwritten file updated for submission ID: ${submissionId}`);
// // // // //       } else {
// // // // //         // Create new handwritten submission
// // // // //         submissionResult = await prisma.submission.create({
// // // // //           data: {
// // // // //             submission_id: uuidv4(),
// // // // //             assessment_id: assessmentId,
// // // // //             student_id: studentId,
// // // // //             file_url: null, // Keep null until conversion is complete
// // // // //             is_handwritten: true,
// // // // //             handwritten_file_url: relativePath,
// // // // //             submission_time: new Date(),
// // // // //           },
// // // // //         });
// // // // //         submissionId = submissionResult.submission_id;
// // // // //         console.log(`Handwritten submission created with ID: ${submissionId}`);
// // // // //       }

// // // // //       // Start OCR conversion process
// // // // //       console.log('Starting OCR conversion...');
      
// // // // //       try {
// // // // //         // Prepare output directory and filename for converted PDF
// // // // //         const answerScriptsBase = path.join(parentDir, 'data', 'Answer_Scripts', assessmentId);
// // // // //         await fs.mkdir(answerScriptsBase, { recursive: true });
        
// // // // //         const convertedFileName = `${uuidv4()}_converted.pdf`;
        
// // // // //         // Convert handwritten PDF to text-only PDF
// // // // //         const conversionResult = await ocrService.convertHandwrittenPdf(
// // // // //           fullPath, // Input handwritten PDF path
// // // // //           answerScriptsBase, // Output directory
// // // // //           convertedFileName // Output filename
// // // // //         );

// // // // //         if (conversionResult.success && conversionResult.convertedFilePath) {
// // // // //           // Update submission with converted file path
// // // // //           const convertedRelativePath = path.join('data', 'Answer_Scripts', assessmentId, convertedFileName);
          
// // // // //           await prisma.submission.update({
// // // // //             where: {
// // // // //               submission_id: submissionId,
// // // // //             },
// // // // //             data: {
// // // // //               file_url: convertedRelativePath,
// // // // //             },
// // // // //           });

// // // // //           console.log(`OCR conversion completed and submission updated with converted file: ${convertedRelativePath}`);

// // // // //           return NextResponse.json({
// // // // //             success: true,
// // // // //             message: 'Handwritten submission uploaded and converted successfully',
// // // // //             submission_id: submissionId,
// // // // //             handwritten_file_url: relativePath,
// // // // //             converted_file_url: convertedRelativePath,
// // // // //           });
// // // // //         } else {
// // // // //           console.error(`OCR conversion failed: ${conversionResult.error}`);
          
// // // // //           // Still return success for the upload, but note conversion failed
// // // // //           return NextResponse.json({
// // // // //             success: true,
// // // // //             message: 'Handwritten submission uploaded successfully, but OCR conversion failed',
// // // // //             submission_id: submissionId,
// // // // //             handwritten_file_url: relativePath,
// // // // //             conversion_error: conversionResult.error,
// // // // //           });
// // // // //         }
// // // // //       } catch (conversionError) {
// // // // //         console.error('Error during OCR conversion:', conversionError);
        
// // // // //         // Still return success for the upload
// // // // //         return NextResponse.json({
// // // // //           success: true,
// // // // //           message: 'Handwritten submission uploaded successfully, but OCR conversion encountered an error',
// // // // //           submission_id: submissionId,
// // // // //           handwritten_file_url: relativePath,
// // // // //           conversion_error: conversionError instanceof Error ? conversionError.message : 'Unknown conversion error',
// // // // //         });
// // // // //       }
// // // // //     } else {
// // // // //       // Handle regular digital submission (unchanged logic)
// // // // //       uploadBase = path.join(parentDir, 'data', 'Answer_Scripts', assessmentId);
// // // // //       await fs.mkdir(uploadBase, { recursive: true });
      
// // // // //       const fileExtension = path.extname(file.name);
// // // // //       const fileName = `${uuidv4()}${fileExtension}`;
// // // // //       const fullPath = path.join(uploadBase, fileName);
// // // // //       relativePath = path.join('data', 'Answer_Scripts', assessmentId, fileName);
      
// // // // //       const buffer = Buffer.from(await file.arrayBuffer());
// // // // //       await fs.writeFile(fullPath, buffer);
      
// // // // //       console.log(`Digital file saved to: ${fullPath}`);

// // // // //       // Check if there's already a submission for this student and assessment
// // // // //       const existingSubmission = await prisma.submission.findFirst({
// // // // //         where: {
// // // // //           assessment_id: assessmentId,
// // // // //           student_id: studentId,
// // // // //         },
// // // // //       });

// // // // //       if (existingSubmission) {
// // // // //         // Update existing submission
// // // // //         const updatedSubmission = await prisma.submission.update({
// // // // //           where: {
// // // // //             submission_id: existingSubmission.submission_id,
// // // // //           },
// // // // //           data: {
// // // // //             file_url: relativePath,
// // // // //             submission_time: new Date(),
// // // // //             // Reset handwritten fields if this is now a digital submission
// // // // //             is_handwritten: false,
// // // // //             handwritten_file_url: null,
// // // // //           },
// // // // //         });

// // // // //         console.log(`Digital submission updated with ID: ${updatedSubmission.submission_id}`);

// // // // //         return NextResponse.json({
// // // // //           success: true,
// // // // //           message: 'Digital submission updated successfully',
// // // // //           submission_id: updatedSubmission.submission_id,
// // // // //           file_url: relativePath,
// // // // //         });
// // // // //       } else {
// // // // //         // Create new digital submission
// // // // //         const newSubmission = await prisma.submission.create({
// // // // //           data: {
// // // // //             submission_id: uuidv4(),
// // // // //             assessment_id: assessmentId,
// // // // //             student_id: studentId,
// // // // //             file_url: relativePath,
// // // // //             submission_time: new Date(),
// // // // //             is_handwritten: false,
// // // // //           },
// // // // //         });

// // // // //         console.log(`Digital submission created with ID: ${newSubmission.submission_id}`);

// // // // //         return NextResponse.json({
// // // // //           success: true,
// // // // //           message: 'Digital submission uploaded successfully',
// // // // //           submission_id: newSubmission.submission_id,
// // // // //           file_url: relativePath,
// // // // //         });
// // // // //       }
// // // // //     }
// // // // //   } catch (error) {
// // // // //     console.error('Submission upload error:', error);
// // // // //     return NextResponse.json({ 
// // // // //       error: 'Internal Server Error',
// // // // //       details: error instanceof Error ? error.message : 'Unknown error'
// // // // //     }, { status: 500 });
// // // // //   }
// // // // // }

// // // // import { NextResponse } from 'next/server';
// // // // import { prisma } from '@/lib/prisma';
// // // // import * as path from 'path';
// // // // import * as fs from 'fs/promises';
// // // // import { v4 as uuidv4 } from 'uuid';
// // // // import { ocrService } from '@/lib/ocrService';

// // // // export async function POST(
// // // //   request: Request,
// // // //   { params }: { params: { studentId: string; assessmentId: string; moduleId: string } }
// // // // ) {
// // // //   console.log('Starting submission upload process...');
  
// // // //   // Extract all parameters from the route
// // // //   const { assessmentId, studentId, moduleId } = params;
  
// // // //   console.log(`Parameters - Assessment ID: ${assessmentId}, Student ID: ${studentId}, Module ID: ${moduleId}`);

// // // //   try {
// // // //     console.log(`Parsing form data...`);
// // // //     const formData = await request.formData();
// // // //     const file = formData.get('file') as File;
// // // //     const isHandwritten = formData.get('isHandwritten') === 'true';

// // // //     if (!file) {
// // // //       return NextResponse.json({ error: 'No file provided' }, { status: 400 });
// // // //     }

// // // //     console.log(`Received file: ${file.name} (${file.type}, ${file.size} bytes)`);
// // // //     console.log(`Is handwritten: ${isHandwritten}`);

// // // //     // For handwritten, allow PDF and image formats
// // // //     if (isHandwritten) {
// // // //       const allowedHandwrittenTypes = [
// // // //         'application/pdf',
// // // //         'image/png',
// // // //         'image/jpeg',
// // // //         'image/jpg'
// // // //       ];
      
// // // //       if (!allowedHandwrittenTypes.includes(file.type)) {
// // // //         return NextResponse.json({ 
// // // //           error: 'Handwritten submissions must be in PDF, PNG, JPG, or JPEG format' 
// // // //         }, { status: 400 });
// // // //       }
// // // //     } else {
// // // //       // For digital submissions, allow PDF and DOCX
// // // //       const allowedTypes = [
// // // //         'application/pdf',
// // // //         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
// // // //       ];
      
// // // //       if (!allowedTypes.includes(file.type)) {
// // // //         return NextResponse.json({ 
// // // //           error: 'Invalid file type. Allowed types: PDF, DOCX' 
// // // //         }, { status: 400 });
// // // //       }
// // // //     }

// // // //     if (file.size > 5 * 1024 * 1024) {
// // // //       return NextResponse.json({ 
// // // //         error: 'File too large (max 5MB)' 
// // // //       }, { status: 400 });
// // // //     }

// // // //     // Prepare file paths - different folders for handwritten and digital submissions
// // // //     const projectRoot = process.cwd();
// // // //     const parentDir = path.dirname(projectRoot);
    
// // // //     let uploadBase: string;
// // // //     let relativePath: string;
    
// // // //     if (isHandwritten) {
// // // //       // Save handwritten submissions to Handwritten_Answer_Scripts folder
// // // //       uploadBase = path.join(parentDir, 'data', 'Handwritten_Answer_Scripts', assessmentId);
// // // //       await fs.mkdir(uploadBase, { recursive: true });
      
// // // //       const fileExtension = path.extname(file.name);
// // // //       const fileName = `${uuidv4()}${fileExtension}`;
// // // //       const fullPath = path.join(uploadBase, fileName);
// // // //       relativePath = path.join('data', 'Handwritten_Answer_Scripts', assessmentId, fileName);
      
// // // //       const buffer = Buffer.from(await file.arrayBuffer());
// // // //       await fs.writeFile(fullPath, buffer);
      
// // // //       console.log(`Handwritten file saved to: ${fullPath}`);

// // // //       // Check if there's already a submission for this student and assessment
// // // //       const existingSubmission = await prisma.submission.findFirst({
// // // //         where: {
// // // //           assessment_id: assessmentId,
// // // //           student_id: studentId,
// // // //         },
// // // //       });

// // // //       let submissionId: string;
// // // //       let submissionResult;

// // // //       if (existingSubmission) {
// // // //         // Update existing submission with handwritten file
// // // //         submissionResult = await prisma.submission.update({
// // // //           where: {
// // // //             submission_id: existingSubmission.submission_id,
// // // //           },
// // // //           data: {
// // // //             is_handwritten: true,
// // // //             handwritten_file_url: relativePath,
// // // //             submission_time: new Date(),
// // // //             // Keep file_url as null until conversion is complete
// // // //             file_url: null,
// // // //           },
// // // //         });
// // // //         submissionId = submissionResult.submission_id;
// // // //         console.log(`Handwritten file updated for submission ID: ${submissionId}`);
// // // //       } else {
// // // //         // Create new handwritten submission
// // // //         submissionResult = await prisma.submission.create({
// // // //           data: {
// // // //             submission_id: uuidv4(),
// // // //             assessment_id: assessmentId,
// // // //             student_id: studentId,
// // // //             file_url: null, // Keep null until conversion is complete
// // // //             is_handwritten: true,
// // // //             handwritten_file_url: relativePath,
// // // //             submission_time: new Date(),
// // // //           },
// // // //         });
// // // //         submissionId = submissionResult.submission_id;
// // // //         console.log(`Handwritten submission created with ID: ${submissionId}`);
// // // //       }

// // // //       // Start OCR conversion process
// // // //       console.log('Starting OCR conversion...');
      
// // // //       try {
// // // //         // Prepare output directory and filename for converted PDF
// // // //         const answerScriptsBase = path.join(parentDir, 'data', 'Answer_Scripts', assessmentId);
// // // //         await fs.mkdir(answerScriptsBase, { recursive: true });
        
// // // //         const convertedFileName = `${uuidv4()}_converted.pdf`;
        
// // // //         // Convert handwritten file (PDF or image) to text-only PDF
// // // //         const conversionResult = await ocrService.convertHandwrittenFile(
// // // //           fullPath, // Input handwritten file path
// // // //           answerScriptsBase, // Output directory
// // // //           convertedFileName // Output filename
// // // //         );

// // // //         if (conversionResult.success && conversionResult.convertedFilePath) {
// // // //           // Update submission with converted file path
// // // //           const convertedRelativePath = path.join('data', 'Answer_Scripts', assessmentId, convertedFileName);
          
// // // //           await prisma.submission.update({
// // // //             where: {
// // // //               submission_id: submissionId,
// // // //             },
// // // //             data: {
// // // //               file_url: convertedRelativePath,
// // // //             },
// // // //           });

// // // //           console.log(`OCR conversion completed and submission updated with converted file: ${convertedRelativePath}`);

// // // //           return NextResponse.json({
// // // //             success: true,
// // // //             message: 'Handwritten submission uploaded and converted successfully',
// // // //             submission_id: submissionId,
// // // //             handwritten_file_url: relativePath,
// // // //             converted_file_url: convertedRelativePath,
// // // //           });
// // // //         } else {
// // // //           console.error(`OCR conversion failed: ${conversionResult.error}`);
          
// // // //           // Still return success for the upload, but note conversion failed
// // // //           return NextResponse.json({
// // // //             success: true,
// // // //             message: 'Handwritten submission uploaded successfully, but OCR conversion failed',
// // // //             submission_id: submissionId,
// // // //             handwritten_file_url: relativePath,
// // // //             conversion_error: conversionResult.error,
// // // //           });
// // // //         }
// // // //       } catch (conversionError) {
// // // //         console.error('Error during OCR conversion:', conversionError);
        
// // // //         // Still return success for the upload
// // // //         return NextResponse.json({
// // // //           success: true,
// // // //           message: 'Handwritten submission uploaded successfully, but OCR conversion encountered an error',
// // // //           submission_id: submissionId,
// // // //           handwritten_file_url: relativePath,
// // // //           conversion_error: conversionError instanceof Error ? conversionError.message : 'Unknown conversion error',
// // // //         });
// // // //       }
// // // //     } else {
// // // //       // Handle regular digital submission (unchanged logic)
// // // //       uploadBase = path.join(parentDir, 'data', 'Answer_Scripts', assessmentId);
// // // //       await fs.mkdir(uploadBase, { recursive: true });
      
// // // //       const fileExtension = path.extname(file.name);
// // // //       const fileName = `${uuidv4()}${fileExtension}`;
// // // //       const fullPath = path.join(uploadBase, fileName);
// // // //       relativePath = path.join('data', 'Answer_Scripts', assessmentId, fileName);
      
// // // //       const buffer = Buffer.from(await file.arrayBuffer());
// // // //       await fs.writeFile(fullPath, buffer);
      
// // // //       console.log(`Digital file saved to: ${fullPath}`);

// // // //       // Check if there's already a submission for this student and assessment
// // // //       const existingSubmission = await prisma.submission.findFirst({
// // // //         where: {
// // // //           assessment_id: assessmentId,
// // // //           student_id: studentId,
// // // //         },
// // // //       });

// // // //       if (existingSubmission) {
// // // //         // Update existing submission
// // // //         const updatedSubmission = await prisma.submission.update({
// // // //           where: {
// // // //             submission_id: existingSubmission.submission_id,
// // // //           },
// // // //           data: {
// // // //             file_url: relativePath,
// // // //             submission_time: new Date(),
// // // //             // Reset handwritten fields if this is now a digital submission
// // // //             is_handwritten: false,
// // // //             handwritten_file_url: null,
// // // //           },
// // // //         });

// // // //         console.log(`Digital submission updated with ID: ${updatedSubmission.submission_id}`);

// // // //         return NextResponse.json({
// // // //           success: true,
// // // //           message: 'Digital submission updated successfully',
// // // //           submission_id: updatedSubmission.submission_id,
// // // //           file_url: relativePath,
// // // //         });
// // // //       } else {
// // // //         // Create new digital submission
// // // //         const newSubmission = await prisma.submission.create({
// // // //           data: {
// // // //             submission_id: uuidv4(),
// // // //             assessment_id: assessmentId,
// // // //             student_id: studentId,
// // // //             file_url: relativePath,
// // // //             submission_time: new Date(),
// // // //             is_handwritten: false,
// // // //           },
// // // //         });

// // // //         console.log(`Digital submission created with ID: ${newSubmission.submission_id}`);

// // // //         return NextResponse.json({
// // // //           success: true,
// // // //           message: 'Digital submission uploaded successfully',
// // // //           submission_id: newSubmission.submission_id,
// // // //           file_url: relativePath,
// // // //         });
// // // //       }
// // // //     }
// // // //   } catch (error) {
// // // //     console.error('Submission upload error:', error);
// // // //     return NextResponse.json({ 
// // // //       error: 'Internal Server Error',
// // // //       details: error instanceof Error ? error.message : 'Unknown error'
// // // //     }, { status: 500 });
// // // //   }
// // // // }

// // // // import { NextResponse } from 'next/server';
// // // // import { prisma } from '@/lib/prisma';
// // // // import * as path from 'path';
// // // // import * as fs from 'fs/promises';
// // // // import { v4 as uuidv4 } from 'uuid';
// // // // import { ocrService } from '@/lib/ocrService';

// // // // // Helper function to check file type by extension (more reliable than MIME type)
// // // // function isValidHandwrittenFile(fileName: string, mimeType: string): boolean {
// // // //   const ext = path.extname(fileName).toLowerCase();
// // // //   const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
// // // //   const validMimeTypes = [
// // // //     'application/pdf',
// // // //     'image/png', 
// // // //     'image/jpeg',
// // // //     'image/jpg', // Some browsers might use this
// // // //     'image/pjpeg', // IE might use this for JPEG
// // // //     '' // Handle cases where MIME type is empty/undefined
// // // //   ];
  
// // // //   // Check both extension and MIME type for better compatibility
// // // //   const hasValidExtension = validExtensions.includes(ext);
// // // //   const hasValidMimeType = validMimeTypes.includes(mimeType) || mimeType === undefined || mimeType === null;
  
// // // //   return hasValidExtension && hasValidMimeType;
// // // // }

// // // // function isValidDigitalFile(fileName: string, mimeType: string): boolean {
// // // //   const ext = path.extname(fileName).toLowerCase();
// // // //   const validExtensions = ['.pdf', '.docx'];
// // // //   const validMimeTypes = [
// // // //     'application/pdf',
// // // //     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
// // // //   ];
  
// // // //   return validExtensions.includes(ext) && validMimeTypes.includes(mimeType);
// // // // }

// // // // export async function POST(
// // // //   request: Request,
// // // //   { params }: { params: { studentId: string; assessmentId: string; moduleId: string } }
// // // // ) {
// // // //   console.log('Starting submission upload process...');
  
// // // //   // Extract all parameters from the route
// // // //   const { assessmentId, studentId, moduleId } = params;
  
// // // //   console.log(`Parameters - Assessment ID: ${assessmentId}, Student ID: ${studentId}, Module ID: ${moduleId}`);

// // // //   try {
// // // //     console.log(`Parsing form data...`);
// // // //     const formData = await request.formData();
// // // //     const file = formData.get('file') as File;
// // // //     const isHandwritten = formData.get('isHandwritten') === 'true';

// // // //     if (!file) {
// // // //       return NextResponse.json({ error: 'No file provided' }, { status: 400 });
// // // //     }

// // // //     console.log(`Received file: ${file.name} (${file.type}, ${file.size} bytes)`);
// // // //     console.log(`Is handwritten: ${isHandwritten}`);

// // // //     // Validate file type based on whether it's handwritten or digital
// // // //     if (isHandwritten) {
// // // //       if (!isValidHandwrittenFile(file.name, file.type)) {
// // // //         const ext = path.extname(file.name).toLowerCase();
// // // //         console.log(`File validation failed - Extension: ${ext}, MIME type: ${file.type}`);
// // // //         return NextResponse.json({ 
// // // //           error: 'Handwritten submissions must be in PDF, PNG, JPG, or JPEG format',
// // // //           details: `Received file: ${file.name} with MIME type: ${file.type}`
// // // //         }, { status: 400 });
// // // //       }
// // // //       console.log(`Handwritten file validation passed`);
// // // //     } else {
// // // //       if (!isValidDigitalFile(file.name, file.type)) {
// // // //         return NextResponse.json({ 
// // // //           error: 'Invalid file type. Allowed types: PDF, DOCX' 
// // // //         }, { status: 400 });
// // // //       }
// // // //     }

// // // //     if (file.size > 50 * 1024 * 1024) { // Increased to 50MB for images
// // // //       return NextResponse.json({ 
// // // //         error: 'File too large (max 50MB)' 
// // // //       }, { status: 400 });
// // // //     }

// // // //     // Prepare file paths - different folders for handwritten and digital submissions
// // // //     const projectRoot = process.cwd();
// // // //     const parentDir = path.dirname(projectRoot);
    
// // // //     let uploadBase: string;
// // // //     let relativePath: string;
    
// // // //     if (isHandwritten) {
// // // //       // Save handwritten submissions to Handwritten_Answer_Scripts folder
// // // //       uploadBase = path.join(parentDir, 'data', 'Handwritten_Answer_Scripts', assessmentId);
// // // //       await fs.mkdir(uploadBase, { recursive: true });
      
// // // //       const fileExtension = path.extname(file.name);
// // // //       const fileName = `${uuidv4()}${fileExtension}`;
// // // //       const fullPath = path.join(uploadBase, fileName);
// // // //       relativePath = path.join('data', 'Handwritten_Answer_Scripts', assessmentId, fileName);
      
// // // //       const buffer = Buffer.from(await file.arrayBuffer());
// // // //       await fs.writeFile(fullPath, buffer);
      
// // // //       console.log(`Handwritten file saved to: ${fullPath}`);
// // // //       console.log(`File size on disk: ${(await fs.stat(fullPath)).size} bytes`);

// // // //       // Check if there's already a submission for this student and assessment
// // // //       const existingSubmission = await prisma.submission.findFirst({
// // // //         where: {
// // // //           assessment_id: assessmentId,
// // // //           student_id: studentId,
// // // //         },
// // // //       });

// // // //       let submissionId: string;
// // // //       let submissionResult;

// // // //       if (existingSubmission) {
// // // //         // Update existing submission with handwritten file
// // // //         submissionResult = await prisma.submission.update({
// // // //           where: {
// // // //             submission_id: existingSubmission.submission_id,
// // // //           },
// // // //           data: {
// // // //             is_handwritten: true,
// // // //             handwritten_file_url: relativePath,
// // // //             submission_time: new Date(),
// // // //             // Keep file_url as null until conversion is complete
// // // //             file_url: null,
// // // //           },
// // // //         });
// // // //         submissionId = submissionResult.submission_id;
// // // //         console.log(`Handwritten file updated for submission ID: ${submissionId}`);
// // // //       } else {
// // // //         // Create new handwritten submission
// // // //         submissionResult = await prisma.submission.create({
// // // //           data: {
// // // //             submission_id: uuidv4(),
// // // //             assessment_id: assessmentId,
// // // //             student_id: studentId,
// // // //             file_url: null, // Keep null until conversion is complete
// // // //             is_handwritten: true,
// // // //             handwritten_file_url: relativePath,
// // // //             submission_time: new Date(),
// // // //           },
// // // //         });
// // // //         submissionId = submissionResult.submission_id;
// // // //         console.log(`Handwritten submission created with ID: ${submissionId}`);
// // // //       }

// // // //       // Start OCR conversion process
// // // //       console.log('Starting OCR conversion...');
// // // //       console.log(`Input file path: ${fullPath}`);
// // // //       console.log(`File exists: ${await fs.access(fullPath).then(() => true).catch(() => false)}`);
      
// // // //       try {
// // // //         // Verify OCR service is ready
// // // //         const isOcrReady = await ocrService.isReady();
// // // //         console.log(`OCR service ready: ${isOcrReady}`);
        
// // // //         if (!isOcrReady) {
// // // //           throw new Error('OCR service is not available');
// // // //         }
        
// // // //         // Prepare output directory and filename for converted PDF
// // // //         const answerScriptsBase = path.join(parentDir, 'data', 'Answer_Scripts', assessmentId);
// // // //         await fs.mkdir(answerScriptsBase, { recursive: true });
        
// // // //         const convertedFileName = `${uuidv4()}_converted.pdf`;
        
// // // //         console.log(`Converting file: ${fullPath}`);
// // // //         console.log(`Output directory: ${answerScriptsBase}`);
// // // //         console.log(`Output filename: ${convertedFileName}`);
        
// // // //         // Convert handwritten file (PDF or image) to text-only PDF
// // // //         const conversionResult = await ocrService.convertHandwrittenFile(
// // // //           fullPath, // Input handwritten file path
// // // //           answerScriptsBase, // Output directory
// // // //           convertedFileName // Output filename
// // // //         );

// // // //         console.log(`Conversion result:`, conversionResult);

// // // //         if (conversionResult.success && conversionResult.convertedFilePath) {
// // // //           // Update submission with converted file path
// // // //           const convertedRelativePath = path.join('data', 'Answer_Scripts', assessmentId, convertedFileName);
          
// // // //           await prisma.submission.update({
// // // //             where: {
// // // //               submission_id: submissionId,
// // // //             },
// // // //             data: {
// // // //               file_url: convertedRelativePath,
// // // //             },
// // // //           });

// // // //           console.log(`OCR conversion completed and submission updated with converted file: ${convertedRelativePath}`);

// // // //           return NextResponse.json({
// // // //             success: true,
// // // //             message: 'Handwritten submission uploaded and converted successfully',
// // // //             submission_id: submissionId,
// // // //             handwritten_file_url: relativePath,
// // // //             converted_file_url: convertedRelativePath,
// // // //           });
// // // //         } else {
// // // //           console.error(`OCR conversion failed: ${conversionResult.error}`);
          
// // // //           // Still return success for the upload, but note conversion failed
// // // //           return NextResponse.json({
// // // //             success: true,
// // // //             message: 'Handwritten submission uploaded successfully, but OCR conversion failed',
// // // //             submission_id: submissionId,
// // // //             handwritten_file_url: relativePath,
// // // //             conversion_error: conversionResult.error,
// // // //           });
// // // //         }
// // // //       } catch (conversionError) {
// // // //         console.error('Error during OCR conversion:', conversionError);
        
// // // //         // Still return success for the upload
// // // //         return NextResponse.json({
// // // //           success: true,
// // // //           message: 'Handwritten submission uploaded successfully, but OCR conversion encountered an error',
// // // //           submission_id: submissionId,
// // // //           handwritten_file_url: relativePath,
// // // //           conversion_error: conversionError instanceof Error ? conversionError.message : 'Unknown conversion error',
// // // //         });
// // // //       }
// // // //     } else {
// // // //       // Handle regular digital submission (unchanged logic)
// // // //       uploadBase = path.join(parentDir, 'data', 'Answer_Scripts', assessmentId);
// // // //       await fs.mkdir(uploadBase, { recursive: true });
      
// // // //       const fileExtension = path.extname(file.name);
// // // //       const fileName = `${uuidv4()}${fileExtension}`;
// // // //       const fullPath = path.join(uploadBase, fileName);
// // // //       relativePath = path.join('data', 'Answer_Scripts', assessmentId, fileName);
      
// // // //       const buffer = Buffer.from(await file.arrayBuffer());
// // // //       await fs.writeFile(fullPath, buffer);
      
// // // //       console.log(`Digital file saved to: ${fullPath}`);

// // // //       // Check if there's already a submission for this student and assessment
// // // //       const existingSubmission = await prisma.submission.findFirst({
// // // //         where: {
// // // //           assessment_id: assessmentId,
// // // //           student_id: studentId,
// // // //         },
// // // //       });

// // // //       if (existingSubmission) {
// // // //         // Update existing submission
// // // //         const updatedSubmission = await prisma.submission.update({
// // // //           where: {
// // // //             submission_id: existingSubmission.submission_id,
// // // //           },
// // // //           data: {
// // // //             file_url: relativePath,
// // // //             submission_time: new Date(),
// // // //             // Reset handwritten fields if this is now a digital submission
// // // //             is_handwritten: false,
// // // //             handwritten_file_url: null,
// // // //           },
// // // //         });

// // // //         console.log(`Digital submission updated with ID: ${updatedSubmission.submission_id}`);

// // // //         return NextResponse.json({
// // // //           success: true,
// // // //           message: 'Digital submission updated successfully',
// // // //           submission_id: updatedSubmission.submission_id,
// // // //           file_url: relativePath,
// // // //         });
// // // //       } else {
// // // //         // Create new digital submission
// // // //         const newSubmission = await prisma.submission.create({
// // // //           data: {
// // // //             submission_id: uuidv4(),
// // // //             assessment_id: assessmentId,
// // // //             student_id: studentId,
// // // //             file_url: relativePath,
// // // //             submission_time: new Date(),
// // // //             is_handwritten: false,
// // // //           },
// // // //         });

// // // //         console.log(`Digital submission created with ID: ${newSubmission.submission_id}`);

// // // //         return NextResponse.json({
// // // //           success: true,
// // // //           message: 'Digital submission uploaded successfully',
// // // //           submission_id: newSubmission.submission_id,
// // // //           file_url: relativePath,
// // // //         });
// // // //       }
// // // //     }
// // // //   } catch (error) {
// // // //     console.error('Submission upload error:', error);
// // // //     return NextResponse.json({ 
// // // //       error: 'Internal Server Error',
// // // //       details: error instanceof Error ? error.message : 'Unknown error'
// // // //     }, { status: 500 });
// // // //   }
// // // // }

// // // import { NextResponse } from 'next/server';
// // // import { prisma } from '@/lib/prisma';
// // // import * as path from 'path';
// // // import * as fs from 'fs/promises';
// // // import { v4 as uuidv4 } from 'uuid';
// // // import { ocrService } from '@/lib/ocrService';

// // // // Helper function to check file type by extension (more reliable than MIME type)
// // // function isValidHandwrittenFile(fileName: string, mimeType: string): boolean {
// // //   const ext = path.extname(fileName).toLowerCase();
// // //   const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
// // //   const validMimeTypes = [
// // //     'application/pdf',
// // //     'image/png', 
// // //     'image/jpeg',
// // //     'image/jpg',
// // //     'image/pjpeg',
// // //     ''
// // //   ];
  
// // //   const hasValidExtension = validExtensions.includes(ext);
// // //   const hasValidMimeType = validMimeTypes.includes(mimeType) || mimeType === undefined || mimeType === null;
  
// // //   return hasValidExtension && hasValidMimeType;
// // // }

// // // function isValidDigitalFile(fileName: string, mimeType: string): boolean {
// // //   const ext = path.extname(fileName).toLowerCase();
// // //   const validExtensions = ['.pdf', '.docx'];
// // //   const validMimeTypes = [
// // //     'application/pdf',
// // //     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
// // //   ];
  
// // //   return validExtensions.includes(ext) && validMimeTypes.includes(mimeType);
// // // }

// // // export async function POST(
// // //   request: Request,
// // //   { params }: { params: { studentId: string; assessmentId: string; moduleId: string } }
// // // ) {
// // //   console.log('Starting submission upload process...');
  
// // //   const { assessmentId, studentId, moduleId } = params;
// // //   console.log(`Parameters - Assessment ID: ${assessmentId}, Student ID: ${studentId}, Module ID: ${moduleId}`);

// // //   try {
// // //     console.log(`Parsing form data...`);
// // //     const formData = await request.formData();
// // //     const file = formData.get('file') as File;
// // //     const isHandwritten = formData.get('isHandwritten') === 'true';

// // //     if (!file) {
// // //       return NextResponse.json({ error: 'No file provided' }, { status: 400 });
// // //     }

// // //     console.log(`Received file: ${file.name} (${file.type}, ${file.size} bytes)`);
// // //     console.log(`Is handwritten: ${isHandwritten}`);

// // //     // Validate file type based on whether it's handwritten or digital
// // //     if (isHandwritten) {
// // //       if (!isValidHandwrittenFile(file.name, file.type)) {
// // //         const ext = path.extname(file.name).toLowerCase();
// // //         console.log(`File validation failed - Extension: ${ext}, MIME type: ${file.type}`);
// // //         return NextResponse.json({ 
// // //           error: 'Handwritten submissions must be in PDF, PNG, JPG, or JPEG format',
// // //           details: `Received file: ${file.name} with MIME type: ${file.type}`
// // //         }, { status: 400 });
// // //       }
// // //       console.log(`Handwritten file validation passed`);
// // //     } else {
// // //       if (!isValidDigitalFile(file.name, file.type)) {
// // //         return NextResponse.json({ 
// // //           error: 'Invalid file type. Allowed types: PDF, DOCX' 
// // //         }, { status: 400 });
// // //       }
// // //     }

// // //     if (file.size > 50 * 1024 * 1024) {
// // //       return NextResponse.json({ 
// // //         error: 'File too large (max 50MB)' 
// // //       }, { status: 400 });
// // //     }

// // //     const projectRoot = process.cwd();
// // //     const parentDir = path.dirname(projectRoot);
    
// // //     let uploadBase: string;
// // //     let relativePath: string;
    
// // //     if (isHandwritten) {
// // //       // Save handwritten submissions to Handwritten_Answer_Scripts folder
// // //       uploadBase = path.join(parentDir, 'data', 'Handwritten_Answer_Scripts', assessmentId);
// // //       await fs.mkdir(uploadBase, { recursive: true });
      
// // //       const fileExtension = path.extname(file.name);
// // //       const fileName = `${uuidv4()}${fileExtension}`;
// // //       const fullPath = path.join(uploadBase, fileName);
// // //       relativePath = path.join('data', 'Handwritten_Answer_Scripts', assessmentId, fileName);
      
// // //       const buffer = Buffer.from(await file.arrayBuffer());
// // //       await fs.writeFile(fullPath, buffer);
      
// // //       console.log(`Handwritten file saved to: ${fullPath}`);
      
// // //       // Verify file was actually written
// // //       try {
// // //         const stats = await fs.stat(fullPath);
// // //         console.log(`File verified on disk - size: ${stats.size} bytes`);
// // //       } catch (statError) {
// // //         console.error(`Error verifying file on disk: ${statError}`);
// // //         throw new Error('File was not saved properly');
// // //       }

// // //       // Check if there's already a submission for this student and assessment
// // //       const existingSubmission = await prisma.submission.findFirst({
// // //         where: {
// // //           assessment_id: assessmentId,
// // //           student_id: studentId,
// // //         },
// // //       });

// // //       let submissionId: string;
// // //       let submissionResult;

// // //       if (existingSubmission) {
// // //         submissionResult = await prisma.submission.update({
// // //           where: {
// // //             submission_id: existingSubmission.submission_id,
// // //           },
// // //           data: {
// // //             is_handwritten: true,
// // //             handwritten_file_url: relativePath,
// // //             submission_time: new Date(),
// // //             file_url: null, // Will be updated after conversion
// // //           },
// // //         });
// // //         submissionId = submissionResult.submission_id;
// // //         console.log(`Handwritten file updated for submission ID: ${submissionId}`);
// // //       } else {
// // //         submissionResult = await prisma.submission.create({
// // //           data: {
// // //             submission_id: uuidv4(),
// // //             assessment_id: assessmentId,
// // //             student_id: studentId,
// // //             file_url: null, // Will be updated after conversion
// // //             is_handwritten: true,
// // //             handwritten_file_url: relativePath,
// // //             submission_time: new Date(),
// // //           },
// // //         });
// // //         submissionId = submissionResult.submission_id;
// // //         console.log(`Handwritten submission created with ID: ${submissionId}`);
// // //       }

// // //       // Start OCR conversion process with detailed logging
// // //       console.log('=== STARTING OCR CONVERSION ===');
// // //       console.log(`Input file path: ${fullPath}`);
      
// // //       try {
// // //         // Double-check file exists before conversion
// // //         await fs.access(fullPath);
// // //         console.log(`✓ Input file exists and is accessible`);
        
// // //         // Verify OCR service is ready
// // //         console.log('Checking OCR service readiness...');
// // //         const isOcrReady = await ocrService.isReady();
// // //         console.log(`OCR service ready: ${isOcrReady}`);
        
// // //         if (!isOcrReady) {
// // //           throw new Error('OCR service is not available');
// // //         }
        
// // //         // Prepare output directory and filename for converted PDF
// // //         const answerScriptsBase = path.join(parentDir, 'data', 'Answer_Scripts', assessmentId);
// // //         await fs.mkdir(answerScriptsBase, { recursive: true });
// // //         console.log(`✓ Output directory created/verified: ${answerScriptsBase}`);
        
// // //         const convertedFileName = `${uuidv4()}_converted.pdf`;
// // //         const expectedOutputPath = path.join(answerScriptsBase, convertedFileName);
        
// // //         console.log(`Expected output file: ${expectedOutputPath}`);
        
// // //         // Convert handwritten file
// // //         console.log('Starting OCR conversion...');
// // //         const conversionResult = await ocrService.convertHandwrittenFile(
// // //           fullPath,
// // //           answerScriptsBase,
// // //           convertedFileName
// // //         );

// // //         console.log(`=== CONVERSION RESULT ===`);
// // //         console.log(`Success: ${conversionResult.success}`);
// // //         console.log(`Error: ${conversionResult.error || 'None'}`);
// // //         console.log(`Converted file path: ${conversionResult.convertedFilePath || 'None'}`);

// // //         if (conversionResult.success && conversionResult.convertedFilePath) {
// // //           // Verify the converted file actually exists
// // //           try {
// // //             await fs.access(conversionResult.convertedFilePath);
// // //             const convertedStats = await fs.stat(conversionResult.convertedFilePath);
// // //             console.log(`✓ Converted file verified - size: ${convertedStats.size} bytes`);
            
// // //             // Update submission with converted file path
// // //             const convertedRelativePath = path.join('data', 'Answer_Scripts', assessmentId, convertedFileName);
            
// // //             const updatedSubmission = await prisma.submission.update({
// // //               where: {
// // //                 submission_id: submissionId,
// // //               },
// // //               data: {
// // //                 file_url: convertedRelativePath,
// // //               },
// // //             });

// // //             console.log(`✓ Database updated with converted file path: ${convertedRelativePath}`);

// // //             return NextResponse.json({
// // //               success: true,
// // //               message: 'Handwritten submission uploaded and converted successfully',
// // //               submission_id: submissionId,
// // //               handwritten_file_url: relativePath,
// // //               converted_file_url: convertedRelativePath,
// // //               debug: {
// // //                 originalFile: fullPath,
// // //                 convertedFile: conversionResult.convertedFilePath,
// // //                 conversionSuccess: true
// // //               }
// // //             });
// // //           } catch (verifyError) {
// // //             console.error(`✗ Converted file verification failed: ${verifyError}`);
// // //             throw new Error(`Conversion completed but file verification failed: ${verifyError}`);
// // //           }
// // //         } else {
// // //           console.error(`✗ OCR conversion failed: ${conversionResult.error}`);
          
// // //           return NextResponse.json({
// // //             success: false, // Changed to false since conversion failed
// // //             message: 'Handwritten submission uploaded but OCR conversion failed',
// // //             submission_id: submissionId,
// // //             handwritten_file_url: relativePath,
// // //             conversion_error: conversionResult.error,
// // //             debug: {
// // //               originalFile: fullPath,
// // //               conversionAttempted: true,
// // //               conversionSuccess: false,
// // //               ocrServiceReady: isOcrReady
// // //             }
// // //           }, { status: 500 }); // Return 500 status for conversion failure
// // //         }
// // //       } catch (conversionError) {
// // //         console.error('✗ Error during OCR conversion:', conversionError);
        
// // //         return NextResponse.json({
// // //           success: false,
// // //           message: 'Handwritten submission uploaded but OCR conversion encountered an error',
// // //           submission_id: submissionId,
// // //           handwritten_file_url: relativePath,
// // //           conversion_error: conversionError instanceof Error ? conversionError.message : 'Unknown conversion error',
// // //           debug: {
// // //             originalFile: fullPath,
// // //             conversionAttempted: true,
// // //             conversionSuccess: false,
// // //             error: conversionError instanceof Error ? conversionError.message : String(conversionError)
// // //           }
// // //         }, { status: 500 });
// // //       }
// // //     } else {
// // //       // Handle regular digital submission (unchanged)
// // //       uploadBase = path.join(parentDir, 'data', 'Answer_Scripts', assessmentId);
// // //       await fs.mkdir(uploadBase, { recursive: true });
      
// // //       const fileExtension = path.extname(file.name);
// // //       const fileName = `${uuidv4()}${fileExtension}`;
// // //       const fullPath = path.join(uploadBase, fileName);
// // //       relativePath = path.join('data', 'Answer_Scripts', assessmentId, fileName);
      
// // //       const buffer = Buffer.from(await file.arrayBuffer());
// // //       await fs.writeFile(fullPath, buffer);
      
// // //       console.log(`Digital file saved to: ${fullPath}`);

// // //       const existingSubmission = await prisma.submission.findFirst({
// // //         where: {
// // //           assessment_id: assessmentId,
// // //           student_id: studentId,
// // //         },
// // //       });

// // //       if (existingSubmission) {
// // //         const updatedSubmission = await prisma.submission.update({
// // //           where: {
// // //             submission_id: existingSubmission.submission_id,
// // //           },
// // //           data: {
// // //             file_url: relativePath,
// // //             submission_time: new Date(),
// // //             is_handwritten: false,
// // //             handwritten_file_url: null,
// // //           },
// // //         });

// // //         return NextResponse.json({
// // //           success: true,
// // //           message: 'Digital submission updated successfully',
// // //           submission_id: updatedSubmission.submission_id,
// // //           file_url: relativePath,
// // //         });
// // //       } else {
// // //         const newSubmission = await prisma.submission.create({
// // //           data: {
// // //             submission_id: uuidv4(),
// // //             assessment_id: assessmentId,
// // //             student_id: studentId,
// // //             file_url: relativePath,
// // //             submission_time: new Date(),
// // //             is_handwritten: false,
// // //           },
// // //         });

// // //         return NextResponse.json({
// // //           success: true,
// // //           message: 'Digital submission uploaded successfully',
// // //           submission_id: newSubmission.submission_id,
// // //           file_url: relativePath,
// // //         });
// // //       }
// // //     }
// // //   } catch (error) {
// // //     console.error('Submission upload error:', error);
// // //     return NextResponse.json({ 
// // //       error: 'Internal Server Error',
// // //       details: error instanceof Error ? error.message : 'Unknown error'
// // //     }, { status: 500 });
// // //   }
// // // }

// // import { NextResponse } from 'next/server';
// // import { prisma } from '@/lib/prisma';
// // import * as path from 'path';
// // import * as fs from 'fs/promises';
// // import { v4 as uuidv4 } from 'uuid';
// // import { ocrService } from '@/lib/ocrService';

// // // Helper function to check file type by extension (more reliable than MIME type)
// // function isValidHandwrittenFile(fileName: string, mimeType: string): boolean {
// //   const ext = path.extname(fileName).toLowerCase();
// //   const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
// //   const validMimeTypes = [
// //     'application/pdf',
// //     'image/png', 
// //     'image/jpeg',
// //     'image/jpg',
// //     'image/pjpeg',
// //     ''
// //   ];
  
// //   const hasValidExtension = validExtensions.includes(ext);
// //   const hasValidMimeType = validMimeTypes.includes(mimeType) || mimeType === undefined || mimeType === null;
  
// //   console.log(`Handwritten file validation:`);
// //   console.log(`  - Extension: ${ext} (valid: ${hasValidExtension})`);
// //   console.log(`  - MIME type: ${mimeType} (valid: ${hasValidMimeType})`);
  
// //   return hasValidExtension && hasValidMimeType;
// // }

// // function isValidDigitalFile(fileName: string, mimeType: string): boolean {
// //   const ext = path.extname(fileName).toLowerCase();
// //   const validExtensions = ['.pdf', '.docx'];
// //   const validMimeTypes = [
// //     'application/pdf',
// //     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
// //   ];
  
// //   console.log(`Digital file validation:`);
// //   console.log(`  - Extension: ${ext}`);
// //   console.log(`  - MIME type: ${mimeType}`);
  
// //   return validExtensions.includes(ext) && validMimeTypes.includes(mimeType);
// // }

// // export async function POST(
// //   request: Request,
// //   { params }: { params: { studentId: string; assessmentId: string; moduleId: string } }
// // ) {
// //   console.log('=== STARTING SUBMISSION UPLOAD PROCESS ===');
  
// //   const { assessmentId, studentId, moduleId } = params;
// //   console.log(`Parameters:`);
// //   console.log(`  - Assessment ID: ${assessmentId}`);
// //   console.log(`  - Student ID: ${studentId}`);
// //   console.log(`  - Module ID: ${moduleId}`);

// //   try {
// //     console.log(`Parsing form data...`);
// //     const formData = await request.formData();
// //     const file = formData.get('file') as File;
// //     const isHandwritten = formData.get('isHandwritten') === 'true';

// //     if (!file) {
// //       console.log('✗ No file provided');
// //       return NextResponse.json({ error: 'No file provided' }, { status: 400 });
// //     }

// //     console.log(`File details:`);
// //     console.log(`  - Name: ${file.name}`);
// //     console.log(`  - Type: ${file.type}`);
// //     console.log(`  - Size: ${file.size} bytes`);
// //     console.log(`  - Is handwritten: ${isHandwritten}`);

// //     // Validate file type based on whether it's handwritten or digital
// //     if (isHandwritten) {
// //       if (!isValidHandwrittenFile(file.name, file.type)) {
// //         const ext = path.extname(file.name).toLowerCase();
// //         console.log(`✗ File validation failed - Extension: ${ext}, MIME type: ${file.type}`);
// //         return NextResponse.json({ 
// //           error: 'Handwritten submissions must be in PDF, PNG, JPG, or JPEG format',
// //           details: `Received file: ${file.name} with MIME type: ${file.type}`
// //         }, { status: 400 });
// //       }
// //       console.log(`✓ Handwritten file validation passed`);
// //     } else {
// //       if (!isValidDigitalFile(file.name, file.type)) {
// //         console.log(`✗ Digital file validation failed`);
// //         return NextResponse.json({ 
// //           error: 'Invalid file type. Allowed types: PDF, DOCX' 
// //         }, { status: 400 });
// //       }
// //       console.log(`✓ Digital file validation passed`);
// //     }

// //     if (file.size > 50 * 1024 * 1024) {
// //       console.log(`✗ File too large: ${file.size} bytes`);
// //       return NextResponse.json({ 
// //         error: 'File too large (max 50MB)' 
// //       }, { status: 400 });
// //     }

// //     const projectRoot = process.cwd();
// //     const parentDir = path.dirname(projectRoot);
    
// //     let uploadBase: string;
// //     let relativePath: string;
    
// //     if (isHandwritten) {
// //       console.log('=== PROCESSING HANDWRITTEN SUBMISSION ===');
      
// //       // Save handwritten submissions to Handwritten_Answer_Scripts folder
// //       uploadBase = path.join(parentDir, 'data', 'Handwritten_Answer_Scripts', assessmentId);
// //       await fs.mkdir(uploadBase, { recursive: true });
// //       console.log(`✓ Handwritten upload directory created: ${uploadBase}`);
      
// //       const fileExtension = path.extname(file.name);
// //       const fileName = `${uuidv4()}${fileExtension}`;
// //       const fullPath = path.join(uploadBase, fileName);
// //       relativePath = path.join('data', 'Handwritten_Answer_Scripts', assessmentId, fileName);
      
// //       console.log(`Saving handwritten file to: ${fullPath}`);
      
// //       const buffer = Buffer.from(await file.arrayBuffer());
// //       await fs.writeFile(fullPath, buffer);
      
// //       console.log(`✓ Handwritten file saved to: ${fullPath}`);
      
// //       // Verify file was actually written
// //       try {
// //         const stats = await fs.stat(fullPath);
// //         console.log(`✓ File verified on disk - size: ${stats.size} bytes`);
// //       } catch (statError) {
// //         console.error(`✗ Error verifying file on disk: ${statError}`);
// //         throw new Error('File was not saved properly');
// //       }

// //       // Check if there's already a submission for this student and assessment
// //       const existingSubmission = await prisma.submission.findFirst({
// //         where: {
// //           assessment_id: assessmentId,
// //           student_id: studentId,
// //         },
// //       });

// //       let submissionId: string;
// //       let submissionResult;

// //       if (existingSubmission) {
// //         submissionResult = await prisma.submission.update({
// //           where: {
// //             submission_id: existingSubmission.submission_id,
// //           },
// //           data: {
// //             is_handwritten: true,
// //             handwritten_file_url: relativePath,
// //             submission_time: new Date(),
// //             file_url: null, // Will be updated after conversion
// //           },
// //         });
// //         submissionId = submissionResult.submission_id;
// //         console.log(`✓ Handwritten file updated for submission ID: ${submissionId}`);
// //       } else {
// //         submissionResult = await prisma.submission.create({
// //           data: {
// //             submission_id: uuidv4(),
// //             assessment_id: assessmentId,
// //             student_id: studentId,
// //             file_url: null, // Will be updated after conversion
// //             is_handwritten: true,
// //             handwritten_file_url: relativePath,
// //             submission_time: new Date(),
// //           },
// //         });
// //         submissionId = submissionResult.submission_id;
// //         console.log(`✓ Handwritten submission created with ID: ${submissionId}`);
// //       }

// //       // Start OCR conversion process with detailed logging
// //       console.log('=== STARTING OCR CONVERSION PROCESS ===');
// //       console.log(`Input file path: ${fullPath}`);
      
// //       try {
// //         // Double-check file exists before conversion
// //         await fs.access(fullPath);
// //         console.log(`✓ Input file exists and is accessible`);
        
// //         // Verify OCR service is ready
// //         console.log('Checking OCR service readiness...');
// //         const isOcrReady = await ocrService.isReady();
// //         console.log(`OCR service ready: ${isOcrReady}`);
        
// //         if (!isOcrReady) {
// //           throw new Error('OCR service is not available');
// //         }
        
// //         // Prepare output directory and filename for converted PDF
// //         const answerScriptsBase = path.join(parentDir, 'data', 'Answer_Scripts', assessmentId);
// //         await fs.mkdir(answerScriptsBase, { recursive: true });
// //         console.log(`✓ Output directory created/verified: ${answerScriptsBase}`);
        
// //         const convertedFileName = `${uuidv4()}_converted.pdf`;
// //         const expectedOutputPath = path.join(answerScriptsBase, convertedFileName);
        
// //         console.log(`Expected output file: ${expectedOutputPath}`);
        
// //         // Convert handwritten file
// //         console.log('Starting OCR conversion...');
// //         const conversionResult = await ocrService.convertHandwrittenFile(
// //           fullPath,
// //           answerScriptsBase,
// //           convertedFileName
// //         );

// //         console.log(`=== CONVERSION RESULT ===`);
// //         console.log(`Success: ${conversionResult.success}`);
// //         console.log(`Error: ${conversionResult.error || 'None'}`);
// //         console.log(`Converted file path: ${conversionResult.convertedFilePath || 'None'}`);

// //         if (conversionResult.success && conversionResult.convertedFilePath) {
// //           // Verify the converted file actually exists
// //           try {
// //             await fs.access(conversionResult.convertedFilePath);
// //             const convertedStats = await fs.stat(conversionResult.convertedFilePath);
// //             console.log(`✓ Converted file verified - size: ${convertedStats.size} bytes`);
            
// //             // Update submission with converted file path
// //             const convertedRelativePath = path.join('data', 'Answer_Scripts', assessmentId, convertedFileName);
            
// //             const updatedSubmission = await prisma.submission.update({
// //               where: {
// //                 submission_id: submissionId,
// //               },
// //               data: {
// //                 file_url: convertedRelativePath,
// //               },
// //             });

// //             console.log(`✓ Database updated with converted file path: ${convertedRelativePath}`);

// //             return NextResponse.json({
// //               success: true,
// //               message: 'Handwritten submission uploaded and converted successfully',
// //               submission_id: submissionId,
// //               handwritten_file_url: relativePath,
// //               converted_file_url: convertedRelativePath,
// //               debug: {
// //                 originalFile: fullPath,
// //                 convertedFile: conversionResult.convertedFilePath,
// //                 conversionSuccess: true,
// //                 fileSize: file.size,
// //                 fileName: file.name,
// //                 fileType: file.type
// //               }
// //             });
// //           } catch (verifyError) {
// //             console.error(`✗ Converted file verification failed: ${verifyError}`);
            
// //             // Still return success for the upload, but indicate conversion verification failed
// //             return NextResponse.json({
// //               success: true,
// //               message: 'Handwritten submission uploaded and conversion completed, but file verification failed',
// //               submission_id: submissionId,
// //               handwritten_file_url: relativePath,
// //               conversion_warning: `Conversion completed but file verification failed: ${verifyError}`,
// //               debug: {
// //                 originalFile: fullPath,
// //                 expectedConvertedFile: conversionResult.convertedFilePath,
// //                 conversionSuccess: true,
// //                 verificationFailed: true
// //               }
// //             });
// //           }
// //         } else {
// //           console.error(`✗ OCR conversion failed: ${conversionResult.error}`);
          
// //           // Return success for upload but failure for conversion
// //           return NextResponse.json({
// //             success: true,
// //             message: 'Handwritten submission uploaded successfully, but OCR conversion failed',
// //             submission_id: submissionId,
// //             handwritten_file_url: relativePath,
// //             conversion_error: conversionResult.error,
// //             debug: {
// //               originalFile: fullPath,
// //               conversionAttempted: true,
// //               conversionSuccess: false,
// //               ocrServiceReady: isOcrReady,
// //               fileSize: file.size,
// //               fileName: file.name,
// //               fileType: file.type
// //             }
// //           });
// //         }
// //       } catch (conversionError) {
// //         console.error('✗ Error during OCR conversion:', conversionError);
        
// //         // Return success for upload but error for conversion
// //         return NextResponse.json({
// //           success: true,
// //           message: 'Handwritten submission uploaded successfully, but OCR conversion encountered an error',
// //           submission_id: submissionId,
// //           handwritten_file_url: relativePath,
// //           conversion_error: conversionError instanceof Error ? conversionError.message : 'Unknown conversion error',
// //           debug: {
// //             originalFile: fullPath,
// //             conversionAttempted: true,
// //             conversionSuccess: false,
// //             error: conversionError instanceof Error ? conversionError.message : String(conversionError),
// //             fileSize: file.size,
// //             fileName: file.name,
// //             fileType: file.type
// //           }
// //         });
// //       }
// //     } else {
// //       console.log('=== PROCESSING DIGITAL SUBMISSION ===');
      
// //       // Handle regular digital submission
// //       uploadBase = path.join(parentDir, 'data', 'Answer_Scripts', assessmentId);
// //       await fs.mkdir(uploadBase, { recursive: true });
// //       console.log(`✓ Digital upload directory created: ${uploadBase}`);
      
// //       const fileExtension = path.extname(file.name);
// //       const fileName = `${uuidv4()}${fileExtension}`;
// //       const fullPath = path.join(uploadBase, fileName);
// //       relativePath = path.join('data', 'Answer_Scripts', assessmentId, fileName);
      
// //       console.log(`Saving digital file to: ${fullPath}`);
      
// //       const buffer = Buffer.from(await file.arrayBuffer());
// //       await fs.writeFile(fullPath, buffer);
      
// //       console.log(`✓ Digital file saved to: ${fullPath}`);

// //       // Verify file was written
// //       try {
// //         const stats = await fs.stat(fullPath);
// //         console.log(`✓ Digital file verified on disk - size: ${stats.size} bytes`);
// //       } catch (statError) {
// //         console.error(`✗ Error verifying digital file on disk: ${statError}`);
// //         throw new Error('Digital file was not saved properly');
// //       }

// //       const existingSubmission = await prisma.submission.findFirst({
// //         where: {
// //           assessment_id: assessmentId,
// //           student_id: studentId,
// //         },
// //       });

// //       if (existingSubmission) {
// //         const updatedSubmission = await prisma.submission.update({
// //           where: {
// //             submission_id: existingSubmission.submission_id,
// //           },
// //           data: {
// //             file_url: relativePath,
// //             submission_time: new Date(),
// //             is_handwritten: false,
// //             handwritten_file_url: null,
// //           },
// //         });

// //         console.log(`✓ Digital submission updated successfully: ${updatedSubmission.submission_id}`);

// //         return NextResponse.json({
// //           success: true,
// //           message: 'Digital submission updated successfully',
// //           submission_id: updatedSubmission.submission_id,
// //           file_url: relativePath,
// //           debug: {
// //             originalFile: fullPath,
// //             fileSize: file.size,
// //             fileName: file.name,
// //             fileType: file.type,
// //             isUpdate: true
// //           }
// //         });
// //       } else {
// //         const newSubmission = await prisma.submission.create({
// //           data: {
// //             submission_id: uuidv4(),
// //             assessment_id: assessmentId,
// //             student_id: studentId,
// //             file_url: relativePath,
// //             submission_time: new Date(),
// //             is_handwritten: false,
// //           },
// //         });

// //         console.log(`✓ Digital submission created successfully: ${newSubmission.submission_id}`);

// //         return NextResponse.json({
// //           success: true,
// //           message: 'Digital submission uploaded successfully',
// //           submission_id: newSubmission.submission_id,
// //           file_url: relativePath,
// //           debug: {
// //             originalFile: fullPath,
// //             fileSize: file.size,
// //             fileName: file.name,
// //             fileType: file.type,
// //             isNew: true
// //           }
// //         });
// //       }
// //     }
// //   } catch (error) {
// //     console.error('✗ Submission upload error:', error);
    
// //     // Provide detailed error information
// //     let errorMessage = 'Internal Server Error';
// //     let errorDetails = 'Unknown error';
    
// //     if (error instanceof Error) {
// //       errorMessage = error.message;
// //       errorDetails = error.stack || error.message;
      
// //       // Check for specific error types
// //       if (error.message.includes('ENOENT')) {
// //         errorMessage = 'File or directory not found';
// //       } else if (error.message.includes('EACCES')) {
// //         errorMessage = 'Permission denied accessing file or directory';
// //       } else if (error.message.includes('ENOSPC')) {
// //         errorMessage = 'No space left on device';
// //       } else if (error.message.includes('Prisma')) {
// //         errorMessage = 'Database operation failed';
// //       }
// //     }
    
// //     console.error(`Error details: ${errorDetails}`);
    
// //     return NextResponse.json({ 
// //       error: errorMessage,
// //       details: error instanceof Error ? error.message : 'Unknown error',
// //       debug: {
// //         timestamp: new Date().toISOString(),
// //         assessmentId,
// //         studentId,
// //         moduleId
// //       }
// //     }, { status: 500 });
// //   }
// // }

// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import * as path from 'path';
// import * as fs from 'fs/promises';
// import { v4 as uuidv4 } from 'uuid';
// import { ocrService } from '@/lib/ocrService';

// // Helper function to check file type by extension (more reliable than MIME type)
// function isValidHandwrittenFile(fileName: string, mimeType: string): boolean {
//   const ext = path.extname(fileName).toLowerCase();
//   const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
  
//   console.log(`Handwritten file validation:`);
//   console.log(`  - Filename: ${fileName}`);
//   console.log(`  - Extension: ${ext}`);
//   console.log(`  - MIME type: ${mimeType}`);
  
//   // Primary validation: Check file extension
//   const hasValidExtension = validExtensions.includes(ext);
//   console.log(`  - Valid extension: ${hasValidExtension}`);
  
//   if (!hasValidExtension) {
//     console.log(`  ✗ Invalid extension: ${ext}`);
//     return false;
//   }
  
//   // Secondary validation: MIME type (more lenient)
//   if (mimeType && mimeType !== '' && mimeType !== null && mimeType !== undefined) {
//     const validMimeTypes = [
//       'application/pdf',
//       'image/png', 
//       'image/jpeg',
//       'image/jpg',
//       'image/pjpeg',
//       'image/webp'
//     ];
    
//     const hasValidMimeType = validMimeTypes.includes(mimeType) || mimeType.startsWith('image/');
//     console.log(`  - Valid MIME type: ${hasValidMimeType}`);
    
//     if (!hasValidMimeType) {
//       console.log(`  ⚠ Warning: Unexpected MIME type ${mimeType}, but accepting based on extension`);
//       // Don't reject - rely on extension validation for handwritten files
//     }
//   } else {
//     console.log(`  - MIME type empty/null, relying on extension validation`);
//   }
  
//   console.log(`  ✓ Handwritten file validation passed`);
//   return true;
// }

// function isValidDigitalFile(fileName: string, mimeType: string): boolean {
//   const ext = path.extname(fileName).toLowerCase();
//   const validExtensions = ['.pdf', '.docx'];
//   const validMimeTypes = [
//     'application/pdf',
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//   ];
  
//   console.log(`Digital file validation:`);
//   console.log(`  - Extension: ${ext}`);
//   console.log(`  - MIME type: ${mimeType}`);
  
//   const hasValidExtension = validExtensions.includes(ext);
//   const hasValidMimeType = validMimeTypes.includes(mimeType);
  
//   console.log(`  - Valid extension: ${hasValidExtension}`);
//   console.log(`  - Valid MIME type: ${hasValidMimeType}`);
  
//   return hasValidExtension && hasValidMimeType;
// }

// export async function POST(
//   request: Request,
//   { params }: { params: { studentId: string; assessmentId: string; moduleId: string } }
// ) {
//   console.log('=== STARTING SUBMISSION UPLOAD PROCESS ===');
  
//   const { assessmentId, studentId, moduleId } = params;
//   console.log(`Parameters:`);
//   console.log(`  - Assessment ID: ${assessmentId}`);
//   console.log(`  - Student ID: ${studentId}`);
//   console.log(`  - Module ID: ${moduleId}`);

//   try {
//     console.log(`Parsing form data...`);
//     const formData = await request.formData();
//     const file = formData.get('file') as File;
//     const isHandwritten = formData.get('isHandwritten') === 'true';

//     if (!file) {
//       console.log('✗ No file provided');
//       return NextResponse.json({ error: 'No file provided' }, { status: 400 });
//     }

//     console.log(`File details:`);
//     console.log(`  - Name: ${file.name}`);
//     console.log(`  - Type: ${file.type}`);
//     console.log(`  - Size: ${file.size} bytes`);
//     console.log(`  - Is handwritten: ${isHandwritten}`);

//     // Validate file type based on whether it's handwritten or digital
//     if (isHandwritten) {
//       console.log(`=== VALIDATING HANDWRITTEN FILE ===`);
//       if (!isValidHandwrittenFile(file.name, file.type)) {
//         const ext = path.extname(file.name).toLowerCase();
//         console.log(`✗ Handwritten file validation failed`);
//         console.log(`  - Extension: ${ext}`);
//         console.log(`  - MIME type: ${file.type}`);
//         console.log(`  - Expected extensions: .pdf, .png, .jpg, .jpeg`);
//         return NextResponse.json({ 
//           error: 'Handwritten submissions must be in PDF, PNG, JPG, or JPEG format',
//           details: `Received file: ${file.name} with extension: ${ext} and MIME type: ${file.type}`
//         }, { status: 400 });
//       }
//       console.log(`✓ Handwritten file validation passed`);
//     } else {
//       console.log(`=== VALIDATING DIGITAL FILE ===`);
//       if (!isValidDigitalFile(file.name, file.type)) {
//         console.log(`✗ Digital file validation failed`);
//         console.log(`  - Extension: ${path.extname(file.name).toLowerCase()}`);
//         console.log(`  - MIME type: ${file.type}`);
//         return NextResponse.json({ 
//           error: 'Invalid file type. Allowed types: PDF, DOCX' 
//         }, { status: 400 });
//       }
//       console.log(`✓ Digital file validation passed`);
//     }

//     if (file.size > 50 * 1024 * 1024) {
//       console.log(`✗ File too large: ${file.size} bytes`);
//       return NextResponse.json({ 
//         error: 'File too large (max 50MB)' 
//       }, { status: 400 });
//     }

//     const projectRoot = process.cwd();
//     const parentDir = path.dirname(projectRoot);
    
//     let uploadBase: string;
//     let relativePath: string;
    
//     if (isHandwritten) {
//       console.log('=== PROCESSING HANDWRITTEN SUBMISSION ===');
//       console.log(`File details for OCR processing:`);
//       console.log(`  - Original filename: ${file.name}`);
//       console.log(`  - File size: ${file.size} bytes`);
//       console.log(`  - MIME type: ${file.type}`);
//       console.log(`  - File extension: ${path.extname(file.name).toLowerCase()}`);
      
//       // Save handwritten submissions to Handwritten_Answer_Scripts folder
//       uploadBase = path.join(parentDir, 'data', 'Handwritten_Answer_Scripts', assessmentId);
//       await fs.mkdir(uploadBase, { recursive: true });
//       console.log(`✓ Handwritten upload directory created: ${uploadBase}`);
      
//       const fileExtension = path.extname(file.name);
//       const fileName = `${uuidv4()}${fileExtension}`;
//       const fullPath = path.join(uploadBase, fileName);
//       relativePath = path.join('data', 'Handwritten_Answer_Scripts', assessmentId, fileName);
      
//       console.log(`Saving handwritten file to: ${fullPath}`);
      
//       const buffer = Buffer.from(await file.arrayBuffer());
//       await fs.writeFile(fullPath, buffer);
      
//       console.log(`✓ Handwritten file saved to: ${fullPath}`);
      
//       // Verify file was actually written
//       try {
//         const stats = await fs.stat(fullPath);
//         console.log(`✓ File verified on disk - size: ${stats.size} bytes`);
        
//         // Additional verification: check if file is readable
//         await fs.access(fullPath, fs.constants.R_OK);
//         console.log(`✓ File is readable`);
//       } catch (statError) {
//         console.error(`✗ Error verifying file on disk: ${statError}`);
//         throw new Error('File was not saved properly');
//       }

//       // Check if there's already a submission for this student and assessment
//       const existingSubmission = await prisma.submission.findFirst({
//         where: {
//           assessment_id: assessmentId,
//           student_id: studentId,
//         },
//       });

//       let submissionId: string;
//       let submissionResult;

//       if (existingSubmission) {
//         submissionResult = await prisma.submission.update({
//           where: {
//             submission_id: existingSubmission.submission_id,
//           },
//           data: {
//             is_handwritten: true,
//             handwritten_file_url: relativePath,
//             submission_time: new Date(),
//             file_url: null, // Will be updated after conversion
//           },
//         });
//         submissionId = submissionResult.submission_id;
//         console.log(`✓ Handwritten file updated for submission ID: ${submissionId}`);
//       } else {
//         submissionResult = await prisma.submission.create({
//           data: {
//             submission_id: uuidv4(),
//             assessment_id: assessmentId,
//             student_id: studentId,
//             file_url: null, // Will be updated after conversion
//             is_handwritten: true,
//             handwritten_file_url: relativePath,
//             submission_time: new Date(),
//           },
//         });
//         submissionId = submissionResult.submission_id;
//         console.log(`✓ Handwritten submission created with ID: ${submissionId}`);
//       }

//       // Start OCR conversion process with detailed logging
//       console.log('=== STARTING OCR CONVERSION PROCESS ===');
//       console.log(`Input file path: ${fullPath}`);
//       console.log(`Input file name: ${file.name}`);
//       console.log(`Input file extension: ${path.extname(file.name).toLowerCase()}`);
      
//       try {
//         // Double-check file exists before conversion
//         await fs.access(fullPath);
//         console.log(`✓ Input file exists and is accessible`);
        
//         // Get file stats for final verification
//         const finalStats = await fs.stat(fullPath);
//         console.log(`✓ Final file verification - size: ${finalStats.size} bytes, created: ${finalStats.birthtime}`);
        
//         // Verify OCR service is ready
//         console.log('Checking OCR service readiness...');
//         const isOcrReady = await ocrService.isReady();
//         console.log(`OCR service ready: ${isOcrReady}`);
        
//         if (!isOcrReady) {
//           throw new Error('OCR service is not available');
//         }
        
//         // Prepare output directory and filename for converted PDF
//         const answerScriptsBase = path.join(parentDir, 'data', 'Answer_Scripts', assessmentId);
//         await fs.mkdir(answerScriptsBase, { recursive: true });
//         console.log(`✓ Output directory created/verified: ${answerScriptsBase}`);
        
//         const convertedFileName = `${uuidv4()}_converted.pdf`;
//         const expectedOutputPath = path.join(answerScriptsBase, convertedFileName);
        
//         console.log(`Expected output file: ${expectedOutputPath}`);
        
//         // Convert handwritten file
//         console.log('Starting OCR conversion...');
//         console.log(`Calling ocrService.convertHandwrittenFile with:`);
//         console.log(`  - Input: ${fullPath}`);
//         console.log(`  - Output dir: ${answerScriptsBase}`);
//         console.log(`  - Output filename: ${convertedFileName}`);
        
//         const conversionResult = await ocrService.convertHandwrittenFile(
//           fullPath,
//           answerScriptsBase,
//           convertedFileName
//         );

//         console.log(`=== CONVERSION RESULT ===`);
//         console.log(`Success: ${conversionResult.success}`);
//         console.log(`Error: ${conversionResult.error || 'None'}`);
//         console.log(`Converted file path: ${conversionResult.convertedFilePath || 'None'}`);

//         if (conversionResult.success && conversionResult.convertedFilePath) {
//           // Verify the converted file actually exists
//           try {
//             await fs.access(conversionResult.convertedFilePath);
//             const convertedStats = await fs.stat(conversionResult.convertedFilePath);
//             console.log(`✓ Converted file verified - size: ${convertedStats.size} bytes`);
            
//             if (convertedStats.size < 100) {
//               console.log(`⚠ Warning: Converted file is very small (${convertedStats.size} bytes)`);
//             }
            
//             // Update submission with converted file path
//             const convertedRelativePath = path.join('data', 'Answer_Scripts', assessmentId, convertedFileName);
            
//             const updatedSubmission = await prisma.submission.update({
//               where: {
//                 submission_id: submissionId,
//               },
//               data: {
//                 file_url: convertedRelativePath,
//               },
//             });

//             console.log(`✓ Database updated with converted file path: ${convertedRelativePath}`);

//             return NextResponse.json({
//               success: true,
//               message: 'Handwritten submission uploaded and converted successfully',
//               submission_id: submissionId,
//               handwritten_file_url: relativePath,
//               converted_file_url: convertedRelativePath,
//               debug: {
//                 originalFile: fullPath,
//                 convertedFile: conversionResult.convertedFilePath,
//                 conversionSuccess: true,
//                 fileSize: file.size,
//                 fileName: file.name,
//                 fileType: file.type,
//                 fileExtension: path.extname(file.name).toLowerCase()
//               }
//             });
//           } catch (verifyError) {
//             console.error(`✗ Converted file verification failed: ${verifyError}`);
            
//             // Still return success for the upload, but indicate conversion verification failed
//             return NextResponse.json({
//               success: true,
//               message: 'Handwritten submission uploaded and conversion completed, but file verification failed',
//               submission_id: submissionId,
//               handwritten_file_url: relativePath,
//               conversion_warning: `Conversion completed but file verification failed: ${verifyError}`,
//               debug: {
//                 originalFile: fullPath,
//                 expectedConvertedFile: conversionResult.convertedFilePath,
//                 conversionSuccess: true,
//                 verificationFailed: true,
//                 fileName: file.name,
//                 fileType: file.type,
//                 fileExtension: path.extname(file.name).toLowerCase()
//               }
//             });
//           }
//         } else {
//           console.error(`✗ OCR conversion failed: ${conversionResult.error}`);
          
//           // Return success for upload but failure for conversion
//           return NextResponse.json({
//             success: true,
//             message: 'Handwritten submission uploaded successfully, but OCR conversion failed',
//             submission_id: submissionId,
//             handwritten_file_url: relativePath,
//             conversion_error: conversionResult.error,
//             debug: {
//               originalFile: fullPath,
//               conversionAttempted: true,
//               conversionSuccess: false,
//               ocrServiceReady: isOcrReady,
//               fileSize: file.size,
//               fileName: file.name,
//               fileType: file.type,
//               fileExtension: path.extname(file.name).toLowerCase()
//             }
//           });
//         }
//       } catch (conversionError) {
//         console.error('✗ Error during OCR conversion:', conversionError);
//         console.error(`Error details:`, conversionError);
        
//         // Return success for upload but error for conversion
//         return NextResponse.json({
//           success: true,
//           message: 'Handwritten submission uploaded successfully, but OCR conversion encountered an error',
//           submission_id: submissionId,
//           handwritten_file_url: relativePath,
//           conversion_error: conversionError instanceof Error ? conversionError.message : 'Unknown conversion error',
//           debug: {
//             originalFile: fullPath,
//             conversionAttempted: true,
//             conversionSuccess: false,
//             error: conversionError instanceof Error ? conversionError.message : String(conversionError),
//             errorStack: conversionError instanceof Error ? conversionError.stack : undefined,
//             fileSize: file.size,
//             fileName: file.name,
//             fileType: file.type,
//             fileExtension: path.extname(file.name).toLowerCase()
//           }
//         });
//       }
//     } else {
//       console.log('=== PROCESSING DIGITAL SUBMISSION ===');
      
//       // Handle regular digital submission
//       uploadBase = path.join(parentDir, 'data', 'Answer_Scripts', assessmentId);
//       await fs.mkdir(uploadBase, { recursive: true });
//       console.log(`✓ Digital upload directory created: ${uploadBase}`);
      
//       const fileExtension = path.extname(file.name);
//       const fileName = `${uuidv4()}${fileExtension}`;
//       const fullPath = path.join(uploadBase, fileName);
//       relativePath = path.join('data', 'Answer_Scripts', assessmentId, fileName);
      
//       console.log(`Saving digital file to: ${fullPath}`);
      
//       const buffer = Buffer.from(await file.arrayBuffer());
//       await fs.writeFile(fullPath, buffer);
      
//       console.log(`✓ Digital file saved to: ${fullPath}`);

//       // Verify file was written
//       try {
//         const stats = await fs.stat(fullPath);
//         console.log(`✓ Digital file verified on disk - size: ${stats.size} bytes`);
//       } catch (statError) {
//         console.error(`✗ Error verifying digital file on disk: ${statError}`);
//         throw new Error('Digital file was not saved properly');
//       }

//       const existingSubmission = await prisma.submission.findFirst({
//         where: {
//           assessment_id: assessmentId,
//           student_id: studentId,
//         },
//       });

//       if (existingSubmission) {
//         const updatedSubmission = await prisma.submission.update({
//           where: {
//             submission_id: existingSubmission.submission_id,
//           },
//           data: {
//             file_url: relativePath,
//             submission_time: new Date(),
//             is_handwritten: false,
//             handwritten_file_url: null,
//           },
//         });

//         console.log(`✓ Digital submission updated successfully: ${updatedSubmission.submission_id}`);

//         return NextResponse.json({
//           success: true,
//           message: 'Digital submission updated successfully',
//           submission_id: updatedSubmission.submission_id,
//           file_url: relativePath,
//           debug: {
//             originalFile: fullPath,
//             fileSize: file.size,
//             fileName: file.name,
//             fileType: file.type,
//             isUpdate: true
//           }
//         });
//       } else {
//         const newSubmission = await prisma.submission.create({
//           data: {
//             submission_id: uuidv4(),
//             assessment_id: assessmentId,
//             student_id: studentId,
//             file_url: relativePath,
//             submission_time: new Date(),
//             is_handwritten: false,
//           },
//         });

//         console.log(`✓ Digital submission created successfully: ${newSubmission.submission_id}`);

//         return NextResponse.json({
//           success: true,
//           message: 'Digital submission uploaded successfully',
//           submission_id: newSubmission.submission_id,
//           file_url: relativePath,
//           debug: {
//             originalFile: fullPath,
//             fileSize: file.size,
//             fileName: file.name,
//             fileType: file.type,
//             isNew: true
//           }
//         });
//       }
//     }
//   } catch (error) {
//     console.error('✗ Submission upload error:', error);
    
//     // Provide detailed error information
//     let errorMessage = 'Internal Server Error';
//     let errorDetails = 'Unknown error';
    
//     if (error instanceof Error) {
//       errorMessage = error.message;
//       errorDetails = error.stack || error.message;
      
//       // Check for specific error types
//       if (error.message.includes('ENOENT')) {
//         errorMessage = 'File or directory not found';
//       } else if (error.message.includes('EACCES')) {
//         errorMessage = 'Permission denied accessing file or directory';
//       } else if (error.message.includes('ENOSPC')) {
//         errorMessage = 'No space left on device';
//       } else if (error.message.includes('Prisma')) {
//         errorMessage = 'Database operation failed';
//       }
//     }
    
//     console.error(`Error details: ${errorDetails}`);
    
//     return NextResponse.json({ 
//       error: errorMessage,
//       details: error instanceof Error ? error.message : 'Unknown error',
//       debug: {
//         timestamp: new Date().toISOString(),
//         assessmentId,
//         studentId,
//         moduleId,
//         errorStack: error instanceof Error ? error.stack : undefined
//       }
//     }, { status: 500 });
//   }
// }

// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import * as path from 'path';
// import * as fs from 'fs/promises';
// import { v4 as uuidv4 } from 'uuid';
// import { ocrService } from '@/lib/ocrService';

// // Helper function to check file type by extension (more reliable than MIME type)
// function isValidHandwrittenFile(fileName: string, mimeType: string): boolean {
//   const ext = path.extname(fileName).toLowerCase();
//   const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
  
//   console.log(`Handwritten file validation:`);
//   console.log(`  - Filename: ${fileName}`);
//   console.log(`  - Extension: ${ext}`);
//   console.log(`  - MIME type: ${mimeType}`);
  
//   // Primary validation: Check file extension
//   const hasValidExtension = validExtensions.includes(ext);
//   console.log(`  - Valid extension: ${hasValidExtension}`);
  
//   if (!hasValidExtension) {
//     console.log(`  ✗ Invalid extension: ${ext}`);
//     return false;
//   }
  
//   // Secondary validation: MIME type (more lenient)
//   if (mimeType && mimeType !== '' && mimeType !== null && mimeType !== undefined) {
//     const validMimeTypes = [
//       'application/pdf',
//       'image/png', 
//       'image/jpeg',
//       'image/jpg',
//       'image/pjpeg',
//       'image/webp'
//     ];
    
//     const hasValidMimeType = validMimeTypes.includes(mimeType) || mimeType.startsWith('image/');
//     console.log(`  - Valid MIME type: ${hasValidMimeType}`);
    
//     if (!hasValidMimeType) {
//       console.log(`  ⚠ Warning: Unexpected MIME type ${mimeType}, but accepting based on extension`);
//       // Don't reject - rely on extension validation for handwritten files
//     }
//   } else {
//     console.log(`  - MIME type empty/null, relying on extension validation`);
//   }
  
//   console.log(`  ✓ Handwritten file validation passed`);
//   return true;
// }

// function isValidDigitalFile(fileName: string, mimeType: string): boolean {
//   const ext = path.extname(fileName).toLowerCase();
//   const validExtensions = ['.pdf', '.docx'];
//   const validMimeTypes = [
//     'application/pdf',
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//   ];
  
//   console.log(`Digital file validation:`);
//   console.log(`  - Extension: ${ext}`);
//   console.log(`  - MIME type: ${mimeType}`);
  
//   const hasValidExtension = validExtensions.includes(ext);
//   const hasValidMimeType = validMimeTypes.includes(mimeType);
  
//   console.log(`  - Valid extension: ${hasValidExtension}`);
//   console.log(`  - Valid MIME type: ${hasValidMimeType}`);
  
//   return hasValidExtension && hasValidMimeType;
// }

// export async function POST(
//   request: Request,
//   { params }: { params: { studentId: string; assessmentId: string; moduleId: string } }
// ) {
//   console.log('=== STARTING SUBMISSION UPLOAD PROCESS ===');
  
//   const { assessmentId, studentId, moduleId } = params;
//   console.log(`Parameters:`);
//   console.log(`  - Assessment ID: ${assessmentId}`);
//   console.log(`  - Student ID: ${studentId}`);
//   console.log(`  - Module ID: ${moduleId}`);

//   try {
//     console.log(`Parsing form data...`);
//     const formData = await request.formData();
//     const file = formData.get('file') as File;
//     const isHandwritten = formData.get('isHandwritten') === 'true';

//     if (!file) {
//       console.log('✗ No file provided');
//       return NextResponse.json({ error: 'No file provided' }, { status: 400 });
//     }

//     console.log(`File details:`);
//     console.log(`  - Name: ${file.name}`);
//     console.log(`  - Type: ${file.type}`);
//     console.log(`  - Size: ${file.size} bytes`);
//     console.log(`  - Is handwritten: ${isHandwritten}`);

//     // Validate file type based on whether it's handwritten or digital
//     if (isHandwritten) {
//       console.log(`=== VALIDATING HANDWRITTEN FILE ===`);
//       if (!isValidHandwrittenFile(file.name, file.type)) {
//         const ext = path.extname(file.name).toLowerCase();
//         console.log(`✗ Handwritten file validation failed`);
//         console.log(`  - Extension: ${ext}`);
//         console.log(`  - MIME type: ${file.type}`);
//         console.log(`  - Expected extensions: .pdf, .png, .jpg, .jpeg`);
//         return NextResponse.json({ 
//           error: 'Handwritten submissions must be in PDF, PNG, JPG, or JPEG format',
//           details: `Received file: ${file.name} with extension: ${ext} and MIME type: ${file.type}`
//         }, { status: 400 });
//       }
//       console.log(`✓ Handwritten file validation passed`);
//     } else {
//       console.log(`=== VALIDATING DIGITAL FILE ===`);
//       if (!isValidDigitalFile(file.name, file.type)) {
//         console.log(`✗ Digital file validation failed`);
//         console.log(`  - Extension: ${path.extname(file.name).toLowerCase()}`);
//         console.log(`  - MIME type: ${file.type}`);
//         return NextResponse.json({ 
//           error: 'Invalid file type. Allowed types: PDF, DOCX' 
//         }, { status: 400 });
//       }
//       console.log(`✓ Digital file validation passed`);
//     }

//     if (file.size > 50 * 1024 * 1024) {
//       console.log(`✗ File too large: ${file.size} bytes`);
//       return NextResponse.json({ 
//         error: 'File too large (max 50MB)' 
//       }, { status: 400 });
//     }

//     const projectRoot = process.cwd();
//     const parentDir = path.dirname(projectRoot);
    
//     let uploadBase: string;
//     let relativePath: string;
    
//     if (isHandwritten) {
//       console.log('=== PROCESSING HANDWRITTEN SUBMISSION ===');
//       console.log(`File details for OCR processing:`);
//       console.log(`  - Original filename: ${file.name}`);
//       console.log(`  - File size: ${file.size} bytes`);
//       console.log(`  - MIME type: ${file.type}`);
//       console.log(`  - File extension: ${path.extname(file.name).toLowerCase()}`);
      
//       // Save handwritten submissions to Handwritten_Answer_Scripts folder
//       uploadBase = path.join(parentDir, 'data', 'Handwritten_Answer_Scripts', assessmentId);
//       await fs.mkdir(uploadBase, { recursive: true });
//       console.log(`✓ Handwritten upload directory created: ${uploadBase}`);
      
//       const fileExtension = path.extname(file.name);
//       const fileName = `${uuidv4()}${fileExtension}`;
//       const fullPath = path.join(uploadBase, fileName);
//       relativePath = path.join('data', 'Handwritten_Answer_Scripts', assessmentId, fileName);
      
//       console.log(`Saving handwritten file to: ${fullPath}`);
      
//       const buffer = Buffer.from(await file.arrayBuffer());
//       await fs.writeFile(fullPath, buffer);
      
//       console.log(`✓ Handwritten file saved to: ${fullPath}`);
      
//       // Verify file was actually written
//       try {
//         const stats = await fs.stat(fullPath);
//         console.log(`✓ File verified on disk - size: ${stats.size} bytes`);
        
//         // Additional verification: check if file is readable
//         await fs.access(fullPath, fs.constants.R_OK);
//         console.log(`✓ File is readable`);
//       } catch (statError) {
//         console.error(`✗ Error verifying file on disk: ${statError}`);
//         throw new Error('File was not saved properly');
//       }

//       // Check if there's already a submission for this student and assessment
//       const existingSubmission = await prisma.submission.findFirst({
//         where: {
//           assessment_id: assessmentId,
//           student_id: studentId,
//         },
//       });

//       let submissionId: string;
//       let submissionResult;

//       if (existingSubmission) {
//         submissionResult = await prisma.submission.update({
//           where: {
//             submission_id: existingSubmission.submission_id,
//           },
//           data: {
//             is_handwritten: true,
//             handwritten_file_url: relativePath,
//             submission_time: new Date(),
//             file_url: null, // Will be updated after conversion
//           },
//         });
//         submissionId = submissionResult.submission_id;
//         console.log(`✓ Handwritten file updated for submission ID: ${submissionId}`);
//       } else {
//         submissionResult = await prisma.submission.create({
//           data: {
//             submission_id: uuidv4(),
//             assessment_id: assessmentId,
//             student_id: studentId,
//             file_url: null, // Will be updated after conversion
//             is_handwritten: true,
//             handwritten_file_url: relativePath,
//             submission_time: new Date(),
//           },
//         });
//         submissionId = submissionResult.submission_id;
//         console.log(`✓ Handwritten submission created with ID: ${submissionId}`);
//       }

//       // Start OCR conversion process with detailed logging
//       console.log('=== STARTING OCR CONVERSION PROCESS ===');
//       console.log(`Input file path: ${fullPath}`);
//       console.log(`Input file name: ${file.name}`);
//       console.log(`Input file extension: ${path.extname(file.name).toLowerCase()}`);
      
//       try {
//         // Double-check file exists before conversion
//         await fs.access(fullPath);
//         console.log(`✓ Input file exists and is accessible`);
        
//         // Get file stats for final verification
//         const finalStats = await fs.stat(fullPath);
//         console.log(`✓ Final file verification - size: ${finalStats.size} bytes, created: ${finalStats.birthtime}`);
        
//         // Verify OCR service is ready
//         console.log('Checking OCR service readiness...');
//         const isOcrReady = await ocrService.isReady();
//         console.log(`OCR service ready: ${isOcrReady}`);
        
//         if (!isOcrReady) {
//           console.error('OCR service is not available, but continuing with file upload...');
          
//           // Still return success for the upload, but indicate OCR service unavailable
//           return NextResponse.json({
//             success: true,
//             message: 'Handwritten submission uploaded successfully, but OCR service is not available for conversion',
//             submission_id: submissionId,
//             handwritten_file_url: relativePath,
//             conversion_error: 'OCR service not available',
//             debug: {
//               originalFile: fullPath,
//               conversionAttempted: false,
//               conversionSuccess: false,
//               ocrServiceReady: false,
//               fileSize: file.size,
//               fileName: file.name,
//               fileType: file.type,
//               fileExtension: path.extname(file.name).toLowerCase()
//             }
//           });
//         }
        
//         // Prepare output directory and filename for converted PDF
//         const answerScriptsBase = path.join(parentDir, 'data', 'Answer_Scripts', assessmentId);
//         await fs.mkdir(answerScriptsBase, { recursive: true });
//         console.log(`✓ Output directory created/verified: ${answerScriptsBase}`);
        
//         const convertedFileName = `${uuidv4()}_converted.pdf`;
//         const expectedOutputPath = path.join(answerScriptsBase, convertedFileName);
        
//         console.log(`Expected output file: ${expectedOutputPath}`);
        
//         // Convert handwritten file - CRITICAL FIX: Pass original filename to OCR service
//         console.log('Starting OCR conversion...');
//         console.log(`Calling ocrService.convertHandwrittenFile with:`);
//         console.log(`  - Input: ${fullPath}`);
//         console.log(`  - Output dir: ${answerScriptsBase}`);
//         console.log(`  - Output filename: ${convertedFileName}`);
//         console.log(`  - Original filename: ${file.name}`); // This is important for OCR service to determine file type
        
//         const conversionResult = await ocrService.convertHandwrittenFile(
//           fullPath,
//           answerScriptsBase,
//           convertedFileName
//         );

//         console.log(`=== CONVERSION RESULT ===`);
//         console.log(`Success: ${conversionResult.success}`);
//         console.log(`Error: ${conversionResult.error || 'None'}`);
//         console.log(`Converted file path: ${conversionResult.convertedFilePath || 'None'}`);

//         if (conversionResult.success && conversionResult.convertedFilePath) {
//           // Verify the converted file actually exists
//           try {
//             await fs.access(conversionResult.convertedFilePath);
//             const convertedStats = await fs.stat(conversionResult.convertedFilePath);
//             console.log(`✓ Converted file verified - size: ${convertedStats.size} bytes`);
            
//             if (convertedStats.size < 1000) { // Changed from 100 to 1000 bytes for better detection
//               console.log(`⚠ Warning: Converted file is very small (${convertedStats.size} bytes)`);
//             }
            
//             // Update submission with converted file path
//             const convertedRelativePath = path.join('data', 'Answer_Scripts', assessmentId, convertedFileName);
            
//             const updatedSubmission = await prisma.submission.update({
//               where: {
//                 submission_id: submissionId,
//               },
//               data: {
//                 file_url: convertedRelativePath,
//               },
//             });

//             console.log(`✓ Database updated with converted file path: ${convertedRelativePath}`);

//             return NextResponse.json({
//               success: true,
//               message: 'Handwritten submission uploaded and converted successfully',
//               submission_id: submissionId,
//               handwritten_file_url: relativePath,
//               converted_file_url: convertedRelativePath,
//               debug: {
//                 originalFile: fullPath,
//                 convertedFile: conversionResult.convertedFilePath,
//                 conversionSuccess: true,
//                 fileSize: file.size,
//                 fileName: file.name,
//                 fileType: file.type,
//                 fileExtension: path.extname(file.name).toLowerCase()
//               }
//             });
//           } catch (verifyError) {
//             console.error(`✗ Converted file verification failed: ${verifyError}`);
            
//             // Still return success for the upload, but indicate conversion verification failed
//             return NextResponse.json({
//               success: true,
//               message: 'Handwritten submission uploaded and conversion completed, but file verification failed',
//               submission_id: submissionId,
//               handwritten_file_url: relativePath,
//               conversion_warning: `Conversion completed but file verification failed: ${verifyError}`,
//               debug: {
//                 originalFile: fullPath,
//                 expectedConvertedFile: conversionResult.convertedFilePath,
//                 conversionSuccess: true,
//                 verificationFailed: true,
//                 fileName: file.name,
//                 fileType: file.type,
//                 fileExtension: path.extname(file.name).toLowerCase()
//               }
//             });
//           }
//         } else {
//           console.error(`✗ OCR conversion failed: ${conversionResult.error}`);
          
//           // Return success for upload but failure for conversion
//           return NextResponse.json({
//             success: true,
//             message: 'Handwritten submission uploaded successfully, but OCR conversion failed',
//             submission_id: submissionId,
//             handwritten_file_url: relativePath,
//             conversion_error: conversionResult.error,
//             debug: {
//               originalFile: fullPath,
//               conversionAttempted: true,
//               conversionSuccess: false,
//               ocrServiceReady: isOcrReady,
//               fileSize: file.size,
//               fileName: file.name,
//               fileType: file.type,
//               fileExtension: path.extname(file.name).toLowerCase()
//             }
//           });
//         }
//       } catch (conversionError) {
//         console.error('✗ Error during OCR conversion:', conversionError);
//         console.error(`Error details:`, conversionError);
        
//         // Return success for upload but error for conversion
//         return NextResponse.json({
//           success: true,
//           message: 'Handwritten submission uploaded successfully, but OCR conversion encountered an error',
//           submission_id: submissionId,
//           handwritten_file_url: relativePath,
//           conversion_error: conversionError instanceof Error ? conversionError.message : 'Unknown conversion error',
//           debug: {
//             originalFile: fullPath,
//             conversionAttempted: true,
//             conversionSuccess: false,
//             error: conversionError instanceof Error ? conversionError.message : String(conversionError),
//             errorStack: conversionError instanceof Error ? conversionError.stack : undefined,
//             fileSize: file.size,
//             fileName: file.name,
//             fileType: file.type,
//             // fileExtension: path.extension(file.name).toLowerCase()
//           }
//         });
//       }
//     } else {
//       console.log('=== PROCESSING DIGITAL SUBMISSION ===');
      
//       // Handle regular digital submission
//       uploadBase = path.join(parentDir, 'data', 'Answer_Scripts', assessmentId);
//       await fs.mkdir(uploadBase, { recursive: true });
//       console.log(`✓ Digital upload directory created: ${uploadBase}`);
      
//       const fileExtension = path.extname(file.name);
//       const fileName = `${uuidv4()}${fileExtension}`;
//       const fullPath = path.join(uploadBase, fileName);
//       relativePath = path.join('data', 'Answer_Scripts', assessmentId, fileName);
      
//       console.log(`Saving digital file to: ${fullPath}`);
      
//       const buffer = Buffer.from(await file.arrayBuffer());
//       await fs.writeFile(fullPath, buffer);
      
//       console.log(`✓ Digital file saved to: ${fullPath}`);

//       // Verify file was written
//       try {
//         const stats = await fs.stat(fullPath);
//         console.log(`✓ Digital file verified on disk - size: ${stats.size} bytes`);
//       } catch (statError) {
//         console.error(`✗ Error verifying digital file on disk: ${statError}`);
//         throw new Error('Digital file was not saved properly');
//       }

//       const existingSubmission = await prisma.submission.findFirst({
//         where: {
//           assessment_id: assessmentId,
//           student_id: studentId,
//         },
//       });

//       if (existingSubmission) {
//         const updatedSubmission = await prisma.submission.update({
//           where: {
//             submission_id: existingSubmission.submission_id,
//           },
//           data: {
//             file_url: relativePath,
//             submission_time: new Date(),
//             is_handwritten: false,
//             handwritten_file_url: null,
//           },
//         });

//         console.log(`✓ Digital submission updated successfully: ${updatedSubmission.submission_id}`);

//         return NextResponse.json({
//           success: true,
//           message: 'Digital submission updated successfully',
//           submission_id: updatedSubmission.submission_id,
//           file_url: relativePath,
//           debug: {
//             originalFile: fullPath,
//             fileSize: file.size,
//             fileName: file.name,
//             fileType: file.type,
//             isUpdate: true
//           }
//         });
//       } else {
//         const newSubmission = await prisma.submission.create({
//           data: {
//             submission_id: uuidv4(),
//             assessment_id: assessmentId,
//             student_id: studentId,
//             file_url: relativePath,
//             submission_time: new Date(),
//             is_handwritten: false,
//           },
//         });

//         console.log(`✓ Digital submission created successfully: ${newSubmission.submission_id}`);

//         return NextResponse.json({
//           success: true,
//           message: 'Digital submission uploaded successfully',
//           submission_id: newSubmission.submission_id,
//           file_url: relativePath,
//           debug: {
//             originalFile: fullPath,
//             fileSize: file.size,
//             fileName: file.name,
//             fileType: file.type,
//             isNew: true
//           }
//         });
//       }
//     }
//   } catch (error) {
//     console.error('✗ Submission upload error:', error);
    
//     // Provide detailed error information
//     let errorMessage = 'Internal Server Error';
//     let errorDetails = 'Unknown error';
    
//     if (error instanceof Error) {
//       errorMessage = error.message;
//       errorDetails = error.stack || error.message;
      
//       // Check for specific error types
//       if (error.message.includes('ENOENT')) {
//         errorMessage = 'File or directory not found';
//       } else if (error.message.includes('EACCES')) {
//         errorMessage = 'Permission denied accessing file or directory';
//       } else if (error.message.includes('ENOSPC')) {
//         errorMessage = 'No space left on device';
//       } else if (error.message.includes('Prisma')) {
//         errorMessage = 'Database operation failed';
//       }
//     }
    
//     console.error(`Error details: ${errorDetails}`);
    
//     return NextResponse.json({ 
//       error: errorMessage,
//       details: error instanceof Error ? error.message : 'Unknown error',
//       debug: {
//         timestamp: new Date().toISOString(),
//         assessmentId,
//         studentId,
//         moduleId,
//         errorStack: error instanceof Error ? error.stack : undefined
//       }
//     }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { ocrService } from '@/lib/ocrService';

// Helper function to check file type by extension (more reliable than MIME type)
function isValidHandwrittenFile(fileName: string, mimeType: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
  
  console.log(`Handwritten file validation:`);
  console.log(`  - Filename: ${fileName}`);
  console.log(`  - Extension: ${ext}`);
  console.log(`  - MIME type: ${mimeType}`);
  
  // Primary validation: Check file extension
  const hasValidExtension = validExtensions.includes(ext);
  console.log(`  - Valid extension: ${hasValidExtension}`);
  
  if (!hasValidExtension) {
    console.log(`  ✗ Invalid extension: ${ext}`);
    return false;
  }
  
  // Secondary validation: MIME type (more lenient for images)
  if (mimeType && mimeType !== '' && mimeType !== null && mimeType !== undefined) {
    const validMimeTypes = [
      'application/pdf',
      'image/png', 
      'image/jpeg',
      'image/jpg',
      'image/pjpeg',
      'image/webp'
    ];
    
    const hasValidMimeType = validMimeTypes.includes(mimeType) || mimeType.startsWith('image/');
    console.log(`  - Valid MIME type: ${hasValidMimeType}`);
    
    if (!hasValidMimeType) {
      console.log(`  ⚠ Warning: Unexpected MIME type ${mimeType}, but accepting based on extension`);
      // Don't reject - rely on extension validation for handwritten files
    }
  } else {
    console.log(`  - MIME type empty/null, relying on extension validation`);
  }
  
  console.log(`  ✓ Handwritten file validation passed`);
  return true;
}

function isValidDigitalFile(fileName: string, mimeType: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  const validExtensions = ['.pdf', '.docx'];
  const validMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  
  console.log(`Digital file validation:`);
  console.log(`  - Extension: ${ext}`);
  console.log(`  - MIME type: ${mimeType}`);
  
  const hasValidExtension = validExtensions.includes(ext);
  const hasValidMimeType = validMimeTypes.includes(mimeType);
  
  console.log(`  - Valid extension: ${hasValidExtension}`);
  console.log(`  - Valid MIME type: ${hasValidMimeType}`);
  
  return hasValidExtension && hasValidMimeType;
}

// Helper function to determine if file is an image
function isImageFile(fileName: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  return ['.png', '.jpg', '.jpeg'].includes(ext);
}

// Helper function to determine if file is a PDF
function isPdfFile(fileName: string): boolean {
  const ext = path.extname(fileName).toLowerCase();
  return ext === '.pdf';
}

export async function POST(
  request: Request,
  { params }: { params: { studentId: string; assessmentId: string; moduleId: string } }
) {
  console.log('=== STARTING SUBMISSION UPLOAD PROCESS ===');
  
  const { assessmentId, studentId, moduleId } = params;
  console.log(`Parameters:`);
  console.log(`  - Assessment ID: ${assessmentId}`);
  console.log(`  - Student ID: ${studentId}`);
  console.log(`  - Module ID: ${moduleId}`);

  try {
    console.log(`Parsing form data...`);
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const isHandwritten = formData.get('isHandwritten') === 'true';

    if (!file) {
      console.log('✗ No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log(`File details:`);
    console.log(`  - Name: ${file.name}`);
    console.log(`  - Type: ${file.type}`);
    console.log(`  - Size: ${file.size} bytes`);
    console.log(`  - Is handwritten: ${isHandwritten}`);

    // Validate file type based on whether it's handwritten or digital
    if (isHandwritten) {
      console.log(`=== VALIDATING HANDWRITTEN FILE ===`);
      if (!isValidHandwrittenFile(file.name, file.type)) {
        const ext = path.extname(file.name).toLowerCase();
        console.log(`✗ Handwritten file validation failed`);
        console.log(`  - Extension: ${ext}`);
        console.log(`  - MIME type: ${file.type}`);
        console.log(`  - Expected extensions: .pdf, .png, .jpg, .jpeg`);
        return NextResponse.json({ 
          error: 'Handwritten submissions must be in PDF, PNG, JPG, or JPEG format',
          details: `Received file: ${file.name} with extension: ${ext} and MIME type: ${file.type}`
        }, { status: 400 });
      }
      console.log(`✓ Handwritten file validation passed`);
    } else {
      console.log(`=== VALIDATING DIGITAL FILE ===`);
      if (!isValidDigitalFile(file.name, file.type)) {
        console.log(`✗ Digital file validation failed`);
        console.log(`  - Extension: ${path.extname(file.name).toLowerCase()}`);
        console.log(`  - MIME type: ${file.type}`);
        return NextResponse.json({ 
          error: 'Invalid file type. Allowed types: PDF, DOCX' 
        }, { status: 400 });
      }
      console.log(`✓ Digital file validation passed`);
    }

    if (file.size > 50 * 1024 * 1024) {
      console.log(`✗ File too large: ${file.size} bytes`);
      return NextResponse.json({ 
        error: 'File too large (max 50MB)' 
      }, { status: 400 });
    }

    const projectRoot = process.cwd();
    const parentDir = path.dirname(projectRoot);
    
    let uploadBase: string;
    let relativePath: string;
    
    if (isHandwritten) {
      console.log('=== PROCESSING HANDWRITTEN SUBMISSION ===');
      console.log(`File details for OCR processing:`);
      console.log(`  - Original filename: ${file.name}`);
      console.log(`  - File size: ${file.size} bytes`);
      console.log(`  - MIME type: ${file.type}`);
      console.log(`  - File extension: ${path.extname(file.name).toLowerCase()}`);
      console.log(`  - Is Image: ${isImageFile(file.name)}`);
      console.log(`  - Is PDF: ${isPdfFile(file.name)}`);
      
      // Save handwritten submissions to Handwritten_Answer_Scripts folder
      uploadBase = path.join(parentDir, 'data', 'Handwritten_Answer_Scripts', assessmentId);
      await fs.mkdir(uploadBase, { recursive: true });
      console.log(`✓ Handwritten upload directory created: ${uploadBase}`);
      
      const fileExtension = path.extname(file.name);
      const fileName = `${uuidv4()}${fileExtension}`;
      const fullPath = path.join(uploadBase, fileName);
      relativePath = path.join('data', 'Handwritten_Answer_Scripts', assessmentId, fileName);
      
      console.log(`Saving handwritten file to: ${fullPath}`);
      
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(fullPath, buffer);
      
      console.log(`✓ Handwritten file saved to: ${fullPath}`);
      
      // Verify file was actually written
      try {
        const stats = await fs.stat(fullPath);
        console.log(`✓ File verified on disk - size: ${stats.size} bytes`);
        
        // Additional verification: check if file is readable
        await fs.access(fullPath, fs.constants.R_OK);
        console.log(`✓ File is readable`);
        
        // Verify file content for images and PDFs
        if (isImageFile(file.name)) {
          // Check image file signature
          const fileBuffer = await fs.readFile(fullPath);
          const isPng = fileBuffer[0] === 0x89 && fileBuffer[1] === 0x50;
          const isJpeg = fileBuffer[0] === 0xFF && fileBuffer[1] === 0xD8;
          console.log(`✓ Image file signature check - PNG: ${isPng}, JPEG: ${isJpeg}`);
          
          if (!isPng && !isJpeg) {
            console.log(`⚠ Warning: Image file doesn't have expected signature`);
          }
        } else if (isPdfFile(file.name)) {
          // Check PDF file signature
          const fileBuffer = await fs.readFile(fullPath);
          const isPdf = fileBuffer.toString('ascii', 0, 4).includes('%PDF');
          console.log(`✓ PDF file signature check: ${isPdf}`);
          
          if (!isPdf) {
            console.log(`⚠ Warning: PDF file doesn't have expected signature`);
          }
        }
        
      } catch (statError) {
        console.error(`✗ Error verifying file on disk: ${statError}`);
        throw new Error('File was not saved properly');
      }

      // Check if there's already a submission for this student and assessment
      const existingSubmission = await prisma.submission.findFirst({
        where: {
          assessment_id: assessmentId,
          student_id: studentId,
        },
      });

      let submissionId: string;
      let submissionResult;

      if (existingSubmission) {
        submissionResult = await prisma.submission.update({
          where: {
            submission_id: existingSubmission.submission_id,
          },
          data: {
            is_handwritten: true,
            handwritten_file_url: relativePath,
            submission_time: new Date(),
            file_url: null, // Will be updated after conversion
          },
        });
        submissionId = submissionResult.submission_id;
        console.log(`✓ Handwritten file updated for submission ID: ${submissionId}`);
      } else {
        submissionResult = await prisma.submission.create({
          data: {
            submission_id: uuidv4(),
            assessment_id: assessmentId,
            student_id: studentId,
            file_url: null, // Will be updated after conversion
            is_handwritten: true,
            handwritten_file_url: relativePath,
            submission_time: new Date(),
          },
        });
        submissionId = submissionResult.submission_id;
        console.log(`✓ Handwritten submission created with ID: ${submissionId}`);
      }

      // Start OCR conversion process with detailed logging
      console.log('=== STARTING OCR CONVERSION PROCESS ===');
      console.log(`Input file path: ${fullPath}`);
      console.log(`Input file name: ${file.name}`);
      console.log(`Input file extension: ${path.extname(file.name).toLowerCase()}`);
      console.log(`File type detection:`);
      console.log(`  - Is Image File: ${isImageFile(file.name)}`);
      console.log(`  - Is PDF File: ${isPdfFile(file.name)}`);
      
      try {
        // Double-check file exists before conversion
        await fs.access(fullPath);
        console.log(`✓ Input file exists and is accessible`);
        
        // Get file stats for final verification
        const finalStats = await fs.stat(fullPath);
        console.log(`✓ Final file verification - size: ${finalStats.size} bytes, created: ${finalStats.birthtime}`);
        
        // Verify OCR service is ready
        console.log('Checking OCR service readiness...');
        const isOcrReady = await ocrService.isReady();
        console.log(`OCR service ready: ${isOcrReady}`);
        
        if (!isOcrReady) {
          console.error('OCR service is not available, but continuing with file upload...');
          
          // Still return success for the upload, but indicate OCR service unavailable
          return NextResponse.json({
            success: true,
            message: 'Handwritten submission uploaded successfully, but OCR service is not available for conversion',
            submission_id: submissionId,
            handwritten_file_url: relativePath,
            conversion_error: 'OCR service not available',
            debug: {
              originalFile: fullPath,
              conversionAttempted: false,
              conversionSuccess: false,
              ocrServiceReady: false,
              fileSize: file.size,
              fileName: file.name,
              fileType: file.type,
              fileExtension: path.extname(file.name).toLowerCase(),
              isImage: isImageFile(file.name),
              isPdf: isPdfFile(file.name)
            }
          });
        }
        
        // Prepare output directory and filename for converted PDF
        const answerScriptsBase = path.join(parentDir, 'data', 'Answer_Scripts', assessmentId);
        await fs.mkdir(answerScriptsBase, { recursive: true });
        console.log(`✓ Output directory created/verified: ${answerScriptsBase}`);
        
        const convertedFileName = `${uuidv4()}_converted.pdf`;
        const expectedOutputPath = path.join(answerScriptsBase, convertedFileName);
        
        console.log(`Expected output file: ${expectedOutputPath}`);
        
        // Convert handwritten file - Works for both images and PDFs
        console.log('Starting OCR conversion...');
        console.log(`Calling ocrService.convertHandwrittenFile with:`);
        console.log(`  - Input: ${fullPath}`);
        console.log(`  - Output dir: ${answerScriptsBase}`);
        console.log(`  - Output filename: ${convertedFileName}`);
        console.log(`  - Original filename: ${file.name}`);
        console.log(`  - File type: ${isImageFile(file.name) ? 'Image' : 'PDF'}`);
        
        const conversionResult = await ocrService.convertHandwrittenFile(
          fullPath,
          answerScriptsBase,
          convertedFileName
        );

        console.log(`=== CONVERSION RESULT ===`);
        console.log(`Success: ${conversionResult.success}`);
        console.log(`Error: ${conversionResult.error || 'None'}`);
        console.log(`Converted file path: ${conversionResult.convertedFilePath || 'None'}`);

        if (conversionResult.success && conversionResult.convertedFilePath) {
          // Verify the converted file actually exists
          try {
            await fs.access(conversionResult.convertedFilePath);
            const convertedStats = await fs.stat(conversionResult.convertedFilePath);
            console.log(`✓ Converted file verified - size: ${convertedStats.size} bytes`);
            
            if (convertedStats.size < 1000) {
              console.log(`⚠ Warning: Converted file is very small (${convertedStats.size} bytes)`);
            }
            
            // Verify it's a valid PDF
            const convertedBuffer = await fs.readFile(conversionResult.convertedFilePath);
            const isPdfValid = convertedBuffer.toString('ascii', 0, 4).includes('%PDF');
            console.log(`✓ Converted file PDF validation: ${isPdfValid}`);
            
            if (!isPdfValid) {
              console.log(`⚠ Warning: Converted file may not be a valid PDF`);
            }
            
            // Update submission with converted file path
            const convertedRelativePath = path.join('data', 'Answer_Scripts', assessmentId, convertedFileName);
            
            const updatedSubmission = await prisma.submission.update({
              where: {
                submission_id: submissionId,
              },
              data: {
                file_url: convertedRelativePath,
              },
            });

            console.log(`✓ Database updated with converted file path: ${convertedRelativePath}`);

            return NextResponse.json({
              success: true,
              message: `Handwritten ${isImageFile(file.name) ? 'image' : 'PDF'} submission uploaded and converted successfully`,
              submission_id: submissionId,
              handwritten_file_url: relativePath,
              converted_file_url: convertedRelativePath,
              debug: {
                originalFile: fullPath,
                convertedFile: conversionResult.convertedFilePath,
                conversionSuccess: true,
                fileSize: file.size,
                fileName: file.name,
                fileType: file.type,
                fileExtension: path.extname(file.name).toLowerCase(),
                isImage: isImageFile(file.name),
                isPdf: isPdfFile(file.name),
                convertedFileSize: convertedStats.size,
                isPdfValid: isPdfValid
              }
            });
          } catch (verifyError) {
            console.error(`✗ Converted file verification failed: ${verifyError}`);
            
            // Still return success for the upload, but indicate conversion verification failed
            return NextResponse.json({
              success: true,
              message: 'Handwritten submission uploaded and conversion completed, but file verification failed',
              submission_id: submissionId,
              handwritten_file_url: relativePath,
              conversion_warning: `Conversion completed but file verification failed: ${verifyError}`,
              debug: {
                originalFile: fullPath,
                expectedConvertedFile: conversionResult.convertedFilePath,
                conversionSuccess: true,
                verificationFailed: true,
                fileName: file.name,
                fileType: file.type,
                fileExtension: path.extname(file.name).toLowerCase(),
                isImage: isImageFile(file.name),
                isPdf: isPdfFile(file.name)
              }
            });
          }
        } else {
          console.error(`✗ OCR conversion failed: ${conversionResult.error}`);
          
          // Return success for upload but failure for conversion
          return NextResponse.json({
            success: true,
            message: `Handwritten ${isImageFile(file.name) ? 'image' : 'PDF'} submission uploaded successfully, but OCR conversion failed`,
            submission_id: submissionId,
            handwritten_file_url: relativePath,
            conversion_error: conversionResult.error,
            debug: {
              originalFile: fullPath,
              conversionAttempted: true,
              conversionSuccess: false,
              ocrServiceReady: isOcrReady,
              fileSize: file.size,
              fileName: file.name,
              fileType: file.type,
              fileExtension: path.extname(file.name).toLowerCase(),
              isImage: isImageFile(file.name),
              isPdf: isPdfFile(file.name)
            }
          });
        }
      } catch (conversionError) {
        console.error('✗ Error during OCR conversion:', conversionError);
        console.error(`Error details:`, conversionError);
        
        // Return success for upload but error for conversion
        return NextResponse.json({
          success: true,
          message: `Handwritten ${isImageFile(file.name) ? 'image' : 'PDF'} submission uploaded successfully, but OCR conversion encountered an error`,
          submission_id: submissionId,
          handwritten_file_url: relativePath,
          conversion_error: conversionError instanceof Error ? conversionError.message : 'Unknown conversion error',
          debug: {
            originalFile: fullPath,
            conversionAttempted: true,
            conversionSuccess: false,
            error: conversionError instanceof Error ? conversionError.message : String(conversionError),
            errorStack: conversionError instanceof Error ? conversionError.stack : undefined,
            fileSize: file.size,
            fileName: file.name,
            fileType: file.type,
            fileExtension: path.extname(file.name).toLowerCase(),
            isImage: isImageFile(file.name),
            isPdf: isPdfFile(file.name)
          }
        });
      }
    } else {
      console.log('=== PROCESSING DIGITAL SUBMISSION ===');
      
      // Handle regular digital submission
      uploadBase = path.join(parentDir, 'data', 'Answer_Scripts', assessmentId);
      await fs.mkdir(uploadBase, { recursive: true });
      console.log(`✓ Digital upload directory created: ${uploadBase}`);
      
      const fileExtension = path.extname(file.name);
      const fileName = `${uuidv4()}${fileExtension}`;
      const fullPath = path.join(uploadBase, fileName);
      relativePath = path.join('data', 'Answer_Scripts', assessmentId, fileName);
      
      console.log(`Saving digital file to: ${fullPath}`);
      
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(fullPath, buffer);
      
      console.log(`✓ Digital file saved to: ${fullPath}`);

      // Verify file was written
      try {
        const stats = await fs.stat(fullPath);
        console.log(`✓ Digital file verified on disk - size: ${stats.size} bytes`);
      } catch (statError) {
        console.error(`✗ Error verifying digital file on disk: ${statError}`);
        throw new Error('Digital file was not saved properly');
      }

      const existingSubmission = await prisma.submission.findFirst({
        where: {
          assessment_id: assessmentId,
          student_id: studentId,
        },
      });

      if (existingSubmission) {
        const updatedSubmission = await prisma.submission.update({
          where: {
            submission_id: existingSubmission.submission_id,
          },
          data: {
            file_url: relativePath,
            submission_time: new Date(),
            is_handwritten: false,
            handwritten_file_url: null,
          },
        });

        console.log(`✓ Digital submission updated successfully: ${updatedSubmission.submission_id}`);

        return NextResponse.json({
          success: true,
          message: 'Digital submission updated successfully',
          submission_id: updatedSubmission.submission_id,
          file_url: relativePath,
          debug: {
            originalFile: fullPath,
            fileSize: file.size,
            fileName: file.name,
            fileType: file.type,
            isUpdate: true
          }
        });
      } else {
        const newSubmission = await prisma.submission.create({
          data: {
            submission_id: uuidv4(),
            assessment_id: assessmentId,
            student_id: studentId,
            file_url: relativePath,
            submission_time: new Date(),
            is_handwritten: false,
          },
        });

        console.log(`✓ Digital submission created successfully: ${newSubmission.submission_id}`);

        return NextResponse.json({
          success: true,
          message: 'Digital submission uploaded successfully',
          submission_id: newSubmission.submission_id,
          file_url: relativePath,
          debug: {
            originalFile: fullPath,
            fileSize: file.size,
            fileName: file.name,
            fileType: file.type,
            isNew: true
          }
        });
      }
    }
  } catch (error) {
    console.error('✗ Submission upload error:', error);
    
    // Provide detailed error information
    let errorMessage = 'Internal Server Error';
    let errorDetails = 'Unknown error';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || error.message;
      
      // Check for specific error types
      if (error.message.includes('ENOENT')) {
        errorMessage = 'File or directory not found';
      } else if (error.message.includes('EACCES')) {
        errorMessage = 'Permission denied accessing file or directory';
      } else if (error.message.includes('ENOSPC')) {
        errorMessage = 'No space left on device';
      } else if (error.message.includes('Prisma')) {
        errorMessage = 'Database operation failed';
      }
    }
    
    console.error(`Error details: ${errorDetails}`);
    
    return NextResponse.json({ 
      error: errorMessage,
      details: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        timestamp: new Date().toISOString(),
        assessmentId,
        studentId,
        moduleId,
        errorStack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 });
  }
}