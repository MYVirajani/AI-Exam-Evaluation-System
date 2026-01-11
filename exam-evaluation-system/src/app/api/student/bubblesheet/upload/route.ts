// // // // // // // // // src/app/api/student/bubblesheet/upload/route.ts
// // // // // // // // import { NextRequest, NextResponse } from "next/server";
// // // // // // // // import { prisma } from "@/lib/prisma";

// // // // // // // // const FLASK_API_BASE = process.env.FLASK_API_BASE || "http://localhost:7000";

// // // // // // // // export async function POST(request: NextRequest) {
// // // // // // // //   try {
// // // // // // // //     const formData = await request.formData();
// // // // // // // //     const file = formData.get("file") as File;
// // // // // // // //     const studentId = formData.get("studentId") as string;
// // // // // // // //     const assessmentId = formData.get("assessmentId") as string;
// // // // // // // //     const moduleId = formData.get("moduleId") as string;

// // // // // // // //     if (!file || !studentId || !assessmentId || !moduleId) {
// // // // // // // //       return NextResponse.json(
// // // // // // // //         { error: "Missing required fields" },
// // // // // // // //         { status: 400 }
// // // // // // // //       );
// // // // // // // //     }

// // // // // // // //     // Prepare form data for Flask API
// // // // // // // //     const flaskFormData = new FormData();
// // // // // // // //     flaskFormData.append("file", file);
// // // // // // // //     flaskFormData.append("studentId", studentId);
// // // // // // // //     flaskFormData.append("assessmentId", assessmentId);
// // // // // // // //     flaskFormData.append("moduleId", moduleId);

// // // // // // // //     // Call Flask API to process bubble sheet
// // // // // // // //     const flaskResponse = await fetch(
// // // // // // // //       `${FLASK_API_BASE}/api/process-bubble-sheet`,
// // // // // // // //       {
// // // // // // // //         method: "POST",
// // // // // // // //         body: flaskFormData,
// // // // // // // //       }
// // // // // // // //     );

// // // // // // // //     if (!flaskResponse.ok) {
// // // // // // // //       const errorData = await flaskResponse.json();
// // // // // // // //       throw new Error(errorData.error || "Bubble sheet processing failed");
// // // // // // // //     }

// // // // // // // //     const flaskResult = await flaskResponse.json();
// // // // // // // //     console.log("Flask processing result:", flaskResult);

// // // // // // // //     // Get student registration number
// // // // // // // //     const student = await prisma.student.findUnique({
// // // // // // // //       where: { user_id: studentId },
// // // // // // // //       select: { registration_number: true },
// // // // // // // //     });

// // // // // // // //     if (!student) {
// // // // // // // //       return NextResponse.json({ error: "Student not found" }, { status: 404 });
// // // // // // // //     }

// // // // // // // //     // Delete existing answers for this student and assessment
// // // // // // // //     await prisma.bubbleSheet_Student_Answer.deleteMany({
// // // // // // // //       where: {
// // // // // // // //         student_id: studentId,
// // // // // // // //         assessment_id: assessmentId,
// // // // // // // //       },
// // // // // // // //     });

// // // // // // // //     // Store answers in database
// // // // // // // //     const answers = flaskResult.answers as Array<{
// // // // // // // //       question_number: number;
// // // // // // // //       selected_option: string;
// // // // // // // //     }>;

// // // // // // // //     const bubbleSheetAnswers = await prisma.$transaction(
// // // // // // // //       answers.map((answer) =>
// // // // // // // //         prisma.bubbleSheet_Student_Answer.create({
// // // // // // // //           data: {
// // // // // // // //             student_id: studentId,
// // // // // // // //             assessment_id: assessmentId,
// // // // // // // //             module_id: moduleId,
// // // // // // // //             question_number: answer.question_number,
// // // // // // // //             selected_option: answer.selected_option,
// // // // // // // //           },
// // // // // // // //         })
// // // // // // // //       )
// // // // // // // //     );

// // // // // // // //     console.log(`✅ Stored ${bubbleSheetAnswers.length} answers in database`);

// // // // // // // //     return NextResponse.json({
// // // // // // // //       success: true,
// // // // // // // //       message: "Bubble sheet processed successfully",
// // // // // // // //       answers_count: answers.length,
// // // // // // // //       file_path: flaskResult.file_path,
// // // // // // // //     });
// // // // // // // //   } catch (error) {
// // // // // // // //     console.error("Error uploading bubble sheet:", error);

// // // // // // // //     if (error instanceof Error && error.message.includes("fetch")) {
// // // // // // // //       return NextResponse.json(
// // // // // // // //         {
// // // // // // // //           error: "Bubble sheet processing service unavailable",
// // // // // // // //           details: "Please ensure the Flask API is running on port 7000",
// // // // // // // //         },
// // // // // // // //         { status: 503 }
// // // // // // // //       );
// // // // // // // //     }

// // // // // // // //     return NextResponse.json(
// // // // // // // //       {
// // // // // // // //         error: "Failed to process bubble sheet",
// // // // // // // //         details: error instanceof Error ? error.message : "Unknown error",
// // // // // // // //       },
// // // // // // // //       { status: 500 }
// // // // // // // //     );
// // // // // // // //   }
// // // // // // // // }

// // // // // // // // src/app/api/student/bubblesheet/upload/route.ts
// // // // // // // import { NextRequest, NextResponse } from "next/server";
// // // // // // // import { prisma } from "@/lib/prisma";

// // // // // // // const FLASK_API_BASE = process.env.FLASK_API_BASE || "http://localhost:7000";

// // // // // // // export async function POST(request: NextRequest) {
// // // // // // //   try {
// // // // // // //     // Get query parameters
// // // // // // //     const { searchParams } = new URL(request.url);
// // // // // // //     const studentId = searchParams.get("studentId");
// // // // // // //     const assessmentId = searchParams.get("assessmentId");
// // // // // // //     const moduleId = searchParams.get("moduleId");

// // // // // // //     if (!studentId || !assessmentId || !moduleId) {
// // // // // // //       return NextResponse.json(
// // // // // // //         { error: "Missing required query parameters" },
// // // // // // //         { status: 400 }
// // // // // // //       );
// // // // // // //     }

// // // // // // //     const formData = await request.formData();
// // // // // // //     const file = formData.get("file") as File;

// // // // // // //     if (!file) {
// // // // // // //       return NextResponse.json(
// // // // // // //         { error: "No file uploaded" },
// // // // // // //         { status: 400 }
// // // // // // //       );
// // // // // // //     }

// // // // // // //     // Validate file type
// // // // // // //     const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
// // // // // // //     if (!allowedTypes.includes(file.type)) {
// // // // // // //       return NextResponse.json(
// // // // // // //         { error: "Invalid file type. Only PNG, JPG, and JPEG images are allowed" },
// // // // // // //         { status: 400 }
// // // // // // //       );
// // // // // // //     }

// // // // // // //     // Prepare form data for Flask API
// // // // // // //     const flaskFormData = new FormData();
// // // // // // //     flaskFormData.append("file", file);
// // // // // // //     flaskFormData.append("studentId", studentId);
// // // // // // //     flaskFormData.append("assessmentId", assessmentId);
// // // // // // //     flaskFormData.append("moduleId", moduleId);

// // // // // // //     // Call Flask API to process bubble sheet
// // // // // // //     const flaskResponse = await fetch(
// // // // // // //       `${FLASK_API_BASE}/api/process-bubble-sheet`,
// // // // // // //       {
// // // // // // //         method: "POST",
// // // // // // //         body: flaskFormData,
// // // // // // //       }
// // // // // // //     );

// // // // // // //     if (!flaskResponse.ok) {
// // // // // // //       const errorData = await flaskResponse.json();
// // // // // // //       throw new Error(errorData.error || "Bubble sheet processing failed");
// // // // // // //     }

// // // // // // //     const flaskResult = await flaskResponse.json();
// // // // // // //     console.log("Flask processing result:", flaskResult);

// // // // // // //     // Get student registration number
// // // // // // //     const student = await prisma.student.findUnique({
// // // // // // //       where: { user_id: studentId },
// // // // // // //       select: { registration_number: true },
// // // // // // //     });

// // // // // // //     if (!student) {
// // // // // // //       return NextResponse.json({ error: "Student not found" }, { status: 404 });
// // // // // // //     }

// // // // // // //     // Delete existing answers for this student and assessment
// // // // // // //     await prisma.bubbleSheet_Student_Answer.deleteMany({
// // // // // // //       where: {
// // // // // // //         student_id: studentId,
// // // // // // //         assessment_id: assessmentId,
// // // // // // //       },
// // // // // // //     });

// // // // // // //     // Store answers in database
// // // // // // //     const answers = flaskResult.answers as Array<{
// // // // // // //       question_number: number;
// // // // // // //       selected_option: string;
// // // // // // //     }>;

// // // // // // //     const bubbleSheetAnswers = await prisma.$transaction(
// // // // // // //       answers.map((answer) =>
// // // // // // //         prisma.bubbleSheet_Student_Answer.create({
// // // // // // //           data: {
// // // // // // //             student_id: studentId,
// // // // // // //             assessment_id: assessmentId,
// // // // // // //             module_id: moduleId,
// // // // // // //             question_number: answer.question_number,
// // // // // // //             selected_option: answer.selected_option,
// // // // // // //           },
// // // // // // //         })
// // // // // // //       )
// // // // // // //     );

// // // // // // //     console.log(`✅ Stored ${bubbleSheetAnswers.length} answers in database`);

// // // // // // //     return NextResponse.json({
// // // // // // //       success: true,
// // // // // // //       message: "Bubble sheet processed successfully",
// // // // // // //       answers_count: answers.length,
// // // // // // //       file_path: flaskResult.file_path,
// // // // // // //     });
// // // // // // //   } catch (error) {
// // // // // // //     console.error("Error uploading bubble sheet:", error);

// // // // // // //     if (error instanceof Error && error.message.includes("fetch")) {
// // // // // // //       return NextResponse.json(
// // // // // // //         {
// // // // // // //           error: "Bubble sheet processing service unavailable",
// // // // // // //           details: "Please ensure the Flask API is running on port 7000",
// // // // // // //         },
// // // // // // //         { status: 503 }
// // // // // // //       );
// // // // // // //     }

// // // // // // //     return NextResponse.json(
// // // // // // //       {
// // // // // // //         error: "Failed to process bubble sheet",
// // // // // // //         details: error instanceof Error ? error.message : "Unknown error",
// // // // // // //       },
// // // // // // //       { status: 500 }
// // // // // // //     );
// // // // // // //   }
// // // // // // // }

// // // // // // // CREATE THIS FILE: src/app/api/student/bubblesheet/upload/route.ts

// // // // // // import { NextRequest, NextResponse } from "next/server";
// // // // // // import { prisma } from "@/lib/prisma";
// // // // // // import { writeFile, mkdir } from "fs/promises";
// // // // // // import path from "path";

// // // // // // const FLASK_API_BASE = process.env.FLASK_API_BASE || "http://localhost:7000";

// // // // // // export async function POST(request: NextRequest) {
// // // // // //   console.log("=== BUBBLE SHEET UPLOAD API CALLED ===");
  
// // // // // //   try {
// // // // // //     // Get query parameters
// // // // // //     const { searchParams } = new URL(request.url);
// // // // // //     const studentId = searchParams.get("studentId");
// // // // // //     const assessmentId = searchParams.get("assessmentId");
// // // // // //     const moduleId = searchParams.get("moduleId");

// // // // // //     console.log("Bubble Sheet Upload Parameters:");
// // // // // //     console.log("  - Student ID:", studentId);
// // // // // //     console.log("  - Assessment ID:", assessmentId);
// // // // // //     console.log("  - Module ID:", moduleId);

// // // // // //     if (!studentId || !assessmentId || !moduleId) {
// // // // // //       return NextResponse.json(
// // // // // //         { error: "Missing required query parameters" },
// // // // // //         { status: 400 }
// // // // // //       );
// // // // // //     }

// // // // // //     const formData = await request.formData();
// // // // // //     const file = formData.get("file") as File;

// // // // // //     if (!file) {
// // // // // //       return NextResponse.json(
// // // // // //         { error: "No file uploaded" },
// // // // // //         { status: 400 }
// // // // // //       );
// // // // // //     }

// // // // // //     console.log("File details:");
// // // // // //     console.log("  - Name:", file.name);
// // // // // //     console.log("  - Type:", file.type);
// // // // // //     console.log("  - Size:", file.size);

// // // // // //     // Validate file type - images only
// // // // // //     const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
// // // // // //     if (!allowedTypes.includes(file.type)) {
// // // // // //       return NextResponse.json(
// // // // // //         { error: "Invalid file type. Only PNG, JPG, and JPEG images are allowed" },
// // // // // //         { status: 400 }
// // // // // //       );
// // // // // //     }

// // // // // //     console.log("✓ File type validation passed");

// // // // // //     // Check if Flask API is available
// // // // // //     console.log("Checking Flask API availability at:", FLASK_API_BASE);
    
// // // // // //     try {
// // // // // //       const healthCheck = await fetch(`${FLASK_API_BASE}/api/health`, {
// // // // // //         method: 'GET',
// // // // // //         signal: AbortSignal.timeout(5000)
// // // // // //       });
      
// // // // // //       if (!healthCheck.ok) {
// // // // // //         throw new Error("Flask API health check failed");
// // // // // //       }
      
// // // // // //       console.log("✓ Flask API is available");
// // // // // //     } catch (healthError) {
// // // // // //       console.error("Flask API not available:", healthError);
// // // // // //       return NextResponse.json(
// // // // // //         { 
// // // // // //           error: "Bubble sheet processing service is not available",
// // // // // //           details: "Please ensure Flask API is running on port 7000",
// // // // // //           hint: "Run: cd services/bubblesheet-ocr && python flask_api.py"
// // // // // //         },
// // // // // //         { status: 503 }
// // // // // //       );
// // // // // //     }

// // // // // //     // Prepare form data for Flask API
// // // // // //     const flaskFormData = new FormData();
// // // // // //     flaskFormData.append("file", file);
// // // // // //     flaskFormData.append("studentId", studentId);
// // // // // //     flaskFormData.append("assessmentId", assessmentId);
// // // // // //     flaskFormData.append("moduleId", moduleId);

// // // // // //     console.log("Sending to Flask API for bubble detection...");

// // // // // //     // Call Flask API on Port 7000
// // // // // //     const flaskResponse = await fetch(
// // // // // //       `${FLASK_API_BASE}/api/process-bubble-sheet`,
// // // // // //       {
// // // // // //         method: "POST",
// // // // // //         body: flaskFormData,
// // // // // //       }
// // // // // //     );

// // // // // //     if (!flaskResponse.ok) {
// // // // // //       const errorData = await flaskResponse.json();
// // // // // //       console.error("Flask API error:", errorData);
// // // // // //       throw new Error(errorData.error || "Bubble sheet processing failed");
// // // // // //     }

// // // // // //     const flaskResult = await flaskResponse.json();
// // // // // //     console.log("Flask processing result:", flaskResult);
// // // // // //     console.log("✓ Detected", flaskResult.answers_count, "answers");

// // // // // //     // Get student registration number
// // // // // //     const student = await prisma.student.findUnique({
// // // // // //       where: { user_id: studentId },
// // // // // //       select: { registration_number: true },
// // // // // //     });

// // // // // //     if (!student) {
// // // // // //       return NextResponse.json({ error: "Student not found" }, { status: 404 });
// // // // // //     }

// // // // // //     // Delete existing answers for this student and assessment
// // // // // //     const deletedCount = await prisma.bubbleSheet_Student_Answer.deleteMany({
// // // // // //       where: {
// // // // // //         student_id: studentId,
// // // // // //         assessment_id: assessmentId,
// // // // // //       },
// // // // // //     });

// // // // // //     console.log("Deleted", deletedCount.count, "existing answers");

// // // // // //     // Store answers in database
// // // // // //     const answers = flaskResult.answers as Array<{
// // // // // //       question_number: number;
// // // // // //       selected_option: string;
// // // // // //     }>;

// // // // // //     if (answers.length === 0) {
// // // // // //       return NextResponse.json(
// // // // // //         { 
// // // // // //           error: "No answers detected",
// // // // // //           details: "Please ensure bubbles are clearly filled and the image is clear"
// // // // // //         },
// // // // // //         { status: 400 }
// // // // // //       );
// // // // // //     }

// // // // // //     const bubbleSheetAnswers = await prisma.$transaction(
// // // // // //       answers.map((answer) =>
// // // // // //         prisma.bubbleSheet_Student_Answer.create({
// // // // // //           data: {
// // // // // //             student_id: studentId,
// // // // // //             assessment_id: assessmentId,
// // // // // //             module_id: moduleId,
// // // // // //             question_number: answer.question_number,
// // // // // //             selected_option: answer.selected_option,
// // // // // //           },
// // // // // //         })
// // // // // //       )
// // // // // //     );

// // // // // //     console.log(`✓ Stored ${bubbleSheetAnswers.length} answers in database`);

// // // // // //     return NextResponse.json({
// // // // // //       success: true,
// // // // // //       message: "Bubble sheet processed successfully",
// // // // // //       answers_count: answers.length,
// // // // // //       file_path: flaskResult.file_path,
// // // // // //       answers: answers,
// // // // // //     });

// // // // // //   } catch (error) {
// // // // // //     console.error("=== BUBBLE SHEET UPLOAD ERROR ===");
// // // // // //     console.error(error);

// // // // // //     if (error instanceof Error && error.message.includes("fetch")) {
// // // // // //       return NextResponse.json(
// // // // // //         {
// // // // // //           error: "Bubble sheet processing service unavailable",
// // // // // //           details: "Flask API on port 7000 is not responding",
// // // // // //           hint: "Start Flask API: cd services/bubblesheet-ocr && python flask_api.py"
// // // // // //         },
// // // // // //         { status: 503 }
// // // // // //       );
// // // // // //     }

// // // // // //     return NextResponse.json(
// // // // // //       {
// // // // // //         error: "Failed to process bubble sheet",
// // // // // //         details: error instanceof Error ? error.message : "Unknown error",
// // // // // //       },
// // // // // //       { status: 500 }
// // // // // //     );
// // // // // //   }
// // // // // // }

// // // // // import { NextRequest, NextResponse } from "next/server";
// // // // // import { prisma } from "@/lib/prisma";

// // // // // const FLASK_API_BASE = process.env.FLASK_API_BASE || "http://localhost:7000";

// // // // // export async function POST(request: NextRequest) {
// // // // //   console.log("========================================");
// // // // //   console.log("🎯 BUBBLE SHEET UPLOAD API CALLED");
// // // // //   console.log("========================================");
  
// // // // //   try {
// // // // //     const { searchParams } = new URL(request.url);
// // // // //     const studentId = searchParams.get("studentId");
// // // // //     const assessmentId = searchParams.get("assessmentId");
// // // // //     const moduleId = searchParams.get("moduleId");

// // // // //     console.log("Parameters:");
// // // // //     console.log("  Student ID:", studentId);
// // // // //     console.log("  Assessment ID:", assessmentId);
// // // // //     console.log("  Module ID:", moduleId);

// // // // //     if (!studentId || !assessmentId || !moduleId) {
// // // // //       return NextResponse.json(
// // // // //         { error: "Missing required parameters" },
// // // // //         { status: 400 }
// // // // //       );
// // // // //     }

// // // // //     const formData = await request.formData();
// // // // //     const file = formData.get("file") as File;

// // // // //     if (!file) {
// // // // //       return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
// // // // //     }

// // // // //     console.log("File details:");
// // // // //     console.log("  Name:", file.name);
// // // // //     console.log("  Type:", file.type);
// // // // //     console.log("  Size:", file.size, "bytes");

// // // // //     // Validate image files only
// // // // //     const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
// // // // //     if (!allowedTypes.includes(file.type)) {
// // // // //       console.log("❌ Invalid file type:", file.type);
// // // // //       return NextResponse.json(
// // // // //         { error: "Only PNG, JPG, JPEG images are allowed" },
// // // // //         { status: 400 }
// // // // //       );
// // // // //     }

// // // // //     console.log("✅ File type validation passed");

// // // // //     // Check Flask API
// // // // //     console.log("Checking Flask API at:", FLASK_API_BASE);
// // // // //     try {
// // // // //       const healthCheck = await fetch(`${FLASK_API_BASE}/api/health`, {
// // // // //         signal: AbortSignal.timeout(5000)
// // // // //       });
      
// // // // //       if (!healthCheck.ok) {
// // // // //         throw new Error("Flask API not healthy");
// // // // //       }
// // // // //       console.log("✅ Flask API is running");
// // // // //     } catch (healthError) {
// // // // //       console.error("❌ Flask API not available:", healthError);
// // // // //       return NextResponse.json(
// // // // //         { 
// // // // //           error: "Bubble sheet processing service unavailable",
// // // // //           details: "Please start Flask API: cd services/bubblesheet-ocr && python flask_api.py",
// // // // //           port: "Flask should be running on port 7000"
// // // // //         },
// // // // //         { status: 503 }
// // // // //       );
// // // // //     }

// // // // //     // Send to Flask
// // // // //     const flaskFormData = new FormData();
// // // // //     flaskFormData.append("file", file);
// // // // //     flaskFormData.append("studentId", studentId);
// // // // //     flaskFormData.append("assessmentId", assessmentId);
// // // // //     flaskFormData.append("moduleId", moduleId);

// // // // //     console.log("Sending to Flask API for bubble detection...");

// // // // //     const flaskResponse = await fetch(
// // // // //       `${FLASK_API_BASE}/api/process-bubble-sheet`,
// // // // //       {
// // // // //         method: "POST",
// // // // //         body: flaskFormData,
// // // // //       }
// // // // //     );

// // // // //     if (!flaskResponse.ok) {
// // // // //       const errorData = await flaskResponse.json();
// // // // //       console.error("Flask error:", errorData);
// // // // //       throw new Error(errorData.error || "Bubble detection failed");
// // // // //     }

// // // // //     const flaskResult = await flaskResponse.json();
// // // // //     console.log("✅ Flask processed successfully");
// // // // //     console.log("   Detected answers:", flaskResult.answers_count);

// // // // //     // Get student
// // // // //     const student = await prisma.student.findUnique({
// // // // //       where: { user_id: studentId },
// // // // //       select: { registration_number: true },
// // // // //     });

// // // // //     if (!student) {
// // // // //       return NextResponse.json({ error: "Student not found" }, { status: 404 });
// // // // //     }

// // // // //     // Delete old answers
// // // // //     await prisma.bubbleSheet_Student_Answer.deleteMany({
// // // // //       where: { student_id: studentId, assessment_id: assessmentId },
// // // // //     });

// // // // //     // Save new answers
// // // // //     const answers = flaskResult.answers as Array<{
// // // // //       question_number: number;
// // // // //       selected_option: string;
// // // // //     }>;

// // // // //     if (answers.length === 0) {
// // // // //       return NextResponse.json(
// // // // //         { error: "No answers detected in bubble sheet" },
// // // // //         { status: 400 }
// // // // //       );
// // // // //     }

// // // // //     await prisma.$transaction(
// // // // //       answers.map((answer) =>
// // // // //         prisma.bubbleSheet_Student_Answer.create({
// // // // //           data: {
// // // // //             student_id: studentId,
// // // // //             assessment_id: assessmentId,
// // // // //             module_id: moduleId,
// // // // //             question_number: answer.question_number,
// // // // //             selected_option: answer.selected_option,
// // // // //           },
// // // // //         })
// // // // //       )
// // // // //     );

// // // // //     console.log("✅ Saved", answers.length, "answers to database");
// // // // //     console.log("========================================");

// // // // //     return NextResponse.json({
// // // // //       success: true,
// // // // //       message: "Bubble sheet processed successfully",
// // // // //       answers_count: answers.length,
// // // // //       answers: answers,
// // // // //     });

// // // // //   } catch (error) {
// // // // //     console.error("========================================");
// // // // //     console.error("❌ BUBBLE SHEET UPLOAD ERROR");
// // // // //     console.error(error);
// // // // //     console.error("========================================");

// // // // //     return NextResponse.json(
// // // // //       {
// // // // //         error: "Failed to process bubble sheet",
// // // // //         details: error instanceof Error ? error.message : "Unknown error",
// // // // //       },
// // // // //       { status: 500 }
// // // // //     );
// // // // //   }
// // // // // }

// // // // // src/app/api/student/bubblesheet/upload/route.ts
// // // // import { NextRequest, NextResponse } from "next/server";
// // // // import { prisma } from "@/lib/prisma";
// // // // import path from "path";

// // // // export async function POST(req: NextRequest) {
// // // //   try {
// // // //     const { searchParams } = new URL(req.url);
// // // //     const studentId = searchParams.get("studentId");
// // // //     const assessmentId = searchParams.get("assessmentId");
// // // //     const moduleId = searchParams.get("moduleId");

// // // //     console.log("\n" + "=".repeat(60));
// // // //     console.log("📝 STUDENT BUBBLE SHEET UPLOAD REQUEST");
// // // //     console.log("=".repeat(60));
// // // //     console.log("Student ID:", studentId);
// // // //     console.log("Assessment ID:", assessmentId);
// // // //     console.log("Module ID:", moduleId);

// // // //     // Validate required parameters
// // // //     if (!studentId || !assessmentId || !moduleId) {
// // // //       console.error("❌ Missing required parameters");
// // // //       return NextResponse.json(
// // // //         { error: "Missing required parameters" },
// // // //         { status: 400 }
// // // //       );
// // // //     }

// // // //     // Get the uploaded file
// // // //     const formData = await req.formData();
// // // //     const file = formData.get("file") as File;

// // // //     if (!file) {
// // // //       console.error("❌ No file in form data");
// // // //       return NextResponse.json(
// // // //         { error: "No file uploaded" },
// // // //         { status: 400 }
// // // //       );
// // // //     }

// // // //     console.log("📄 File received:", file.name);
// // // //     console.log("   Type:", file.type);
// // // //     console.log("   Size:", file.size, "bytes");

// // // //     // Validate file type (images only)
// // // //     const validExtensions = ['.png', '.jpg', '.jpeg'];
// // // //     const fileExtension = path.extname(file.name).toLowerCase();
    
// // // //     if (!validExtensions.includes(fileExtension)) {
// // // //       console.error("❌ Invalid file type:", fileExtension);
// // // //       return NextResponse.json(
// // // //         { 
// // // //           error: "Invalid file type",
// // // //           details: `Please upload image file (.png, .jpg, .jpeg). Got: ${fileExtension}`
// // // //         },
// // // //         { status: 400 }
// // // //       );
// // // //     }

// // // //     console.log("✅ File type valid:", fileExtension);

// // // //     // Prepare data for Flask
// // // //     const bytes = await file.arrayBuffer();
// // // //     const buffer = Buffer.from(bytes);
// // // //     const fileBlob = new Blob([buffer], { type: file.type || 'image/jpeg' });

// // // //     const flaskFormData = new FormData();
// // // //     flaskFormData.append("file", fileBlob, file.name);
// // // //     flaskFormData.append("assessmentId", assessmentId);
// // // //     flaskFormData.append("studentId", studentId);
// // // //     flaskFormData.append("moduleId", moduleId);

// // // //     // Flask configuration
// // // //     const flaskUrl = process.env.FLASK_API_URL || "http://localhost:7000";
// // // //     const flaskEndpoint = `${flaskUrl}/api/process-bubble-sheet`;

// // // //     console.log("🔄 Forwarding to Flask:", flaskEndpoint);

// // // //     // Test Flask connection first
// // // //     try {
// // // //       console.log("🏥 Testing Flask connection...");
// // // //       const healthCheck = await fetch(`${flaskUrl}/api/health`, {
// // // //         method: "GET",
// // // //         signal: AbortSignal.timeout(5000),
// // // //       });

// // // //       if (!healthCheck.ok) {
// // // //         throw new Error("Flask health check failed");
// // // //       }

// // // //       const healthData = await healthCheck.json();
// // // //       console.log("✅ Flask is running:", healthData.service);
// // // //     } catch (healthError) {
// // // //       console.error("❌ Flask health check failed:", healthError);
// // // //       return NextResponse.json(
// // // //         {
// // // //           error: "Cannot connect to Flask service",
// // // //           details:
// // // //             "Flask API is not running on port 7000. Please start it with: python services/bubblesheet-ocr/flask_api.py",
// // // //         },
// // // //         { status: 503 }
// // // //       );
// // // //     }

// // // //     // Send to Flask for processing
// // // //     console.log("📤 Sending bubble sheet to Flask for processing...");
// // // //     let flaskResponse;
    
// // // //     try {
// // // //       flaskResponse = await fetch(flaskEndpoint, {
// // // //         method: "POST",
// // // //         body: flaskFormData,
// // // //         signal: AbortSignal.timeout(30000),
// // // //       });
// // // //     } catch (fetchError) {
// // // //       console.error("❌ Failed to reach Flask:", fetchError);
// // // //       return NextResponse.json(
// // // //         {
// // // //           error: "Failed to connect to Flask service",
// // // //           details: fetchError instanceof Error ? fetchError.message : "Unknown error",
// // // //         },
// // // //         { status: 503 }
// // // //       );
// // // //     }

// // // //     console.log("📥 Flask response status:", flaskResponse.status);

// // // //     // Get response text first
// // // //     const responseText = await flaskResponse.text();
// // // //     console.log("📥 Response preview (first 500 chars):", responseText.substring(0, 500));

// // // //     // Check if response is JSON
// // // //     const contentType = flaskResponse.headers.get("content-type");
// // // //     if (!contentType || !contentType.includes("application/json")) {
// // // //       console.error("❌ Flask returned non-JSON response");
// // // //       console.error("Content-Type:", contentType);

// // // //       return NextResponse.json(
// // // //         {
// // // //           error: "Flask service error",
// // // //           details: "Flask returned an unexpected response. Check Flask console for details.",
// // // //           status: flaskResponse.status,
// // // //         },
// // // //         { status: 502 }
// // // //       );
// // // //     }

// // // //     // Parse JSON response
// // // //     let result;
// // // //     try {
// // // //       result = JSON.parse(responseText);
// // // //     } catch (parseError) {
// // // //       console.error("❌ Failed to parse JSON:", parseError);
// // // //       return NextResponse.json(
// // // //         {
// // // //           error: "Invalid response from Flask",
// // // //           details: "Could not parse Flask response as JSON",
// // // //         },
// // // //         { status: 502 }
// // // //       );
// // // //     }

// // // //     // Handle Flask errors
// // // //     if (!flaskResponse.ok) {
// // // //       console.error("❌ Flask error response:", result);

// // // //       const errorMessage = result.error || "Failed to process bubble sheet";
// // // //       const errorDetails = result.details || "Unknown error";

// // // //       return NextResponse.json(
// // // //         {
// // // //           error: errorMessage,
// // // //           details: errorDetails,
// // // //         },
// // // //         { status: flaskResponse.status }
// // // //       );
// // // //     }

// // // //     // Success! Now store in database
// // // //     console.log("✅ Flask processed successfully");
// // // //     console.log("   Answers detected:", result.answers_count);

// // // //     // Check if answers were extracted
// // // //     const answers = result.answers as Array<{
// // // //       question_number: number;
// // // //       selected_option: string;
// // // //     }>;

// // // //     if (!answers || answers.length === 0) {
// // // //       console.error("❌ No answers extracted from bubble sheet");
// // // //       return NextResponse.json(
// // // //         {
// // // //           error: "No answers detected",
// // // //           details: "Please ensure bubbles are properly filled and image is clear",
// // // //         },
// // // //         { status: 400 }
// // // //       );
// // // //     }

// // // //     // Delete existing answers for this student and assessment
// // // //     console.log("🗑️ Deleting existing answers...");
// // // //     const deletedCount = await prisma.bubbleSheet_Student_Answer.deleteMany({
// // // //       where: {
// // // //         student_id: studentId,
// // // //         assessment_id: assessmentId,
// // // //       },
// // // //     });
// // // //     console.log(`   Deleted ${deletedCount.count} existing answers`);

// // // //     // Store new answers
// // // //     console.log("💾 Storing new answers in database...");
    
// // // //     const storedAnswers = await prisma.$transaction(
// // // //       answers.map((answer) =>
// // // //         prisma.bubbleSheet_Student_Answer.create({
// // // //           data: {
// // // //             student_id: studentId,
// // // //             assessment_id: assessmentId,
// // // //             module_id: moduleId,
// // // //             question_number: answer.question_number,
// // // //             selected_option: answer.selected_option,
// // // //           },
// // // //         })
// // // //       )
// // // //     );

// // // //     console.log(`✅ Stored ${storedAnswers.length} answers in database`);
// // // //     console.log("=".repeat(60) + "\n");

// // // //     // Return success response
// // // //     return NextResponse.json({
// // // //       success: true,
// // // //       message: "Bubble sheet uploaded and processed successfully",
// // // //       answers: result.answers,
// // // //       answers_count: result.answers_count,
// // // //       file_path: result.file_path,
// // // //       stored_count: storedAnswers.length,
// // // //     });
// // // //   } catch (error) {
// // // //     console.error("\n❌ ERROR IN BUBBLE SHEET UPLOAD");
// // // //     console.error("=".repeat(60));
// // // //     console.error("Error:", error);
// // // //     console.error("Type:", error instanceof Error ? error.constructor.name : typeof error);
// // // //     if (error instanceof Error) {
// // // //       console.error("Message:", error.message);
// // // //       console.error("Stack:", error.stack);
// // // //     }
// // // //     console.error("=".repeat(60) + "\n");

// // // //     // Check for specific error types
// // // //     if (error instanceof Error) {
// // // //       if (error.message.includes("fetch failed") || error.name === "TimeoutError") {
// // // //         return NextResponse.json(
// // // //           {
// // // //             error: "Cannot connect to Flask service",
// // // //             details:
// // // //               "Please ensure Flask API is running: python services/bubblesheet-ocr/flask_api.py",
// // // //           },
// // // //           { status: 503 }
// // // //         );
// // // //       }
// // // //     }

// // // //     return NextResponse.json(
// // // //       {
// // // //         error: "Failed to process bubble sheet",
// // // //         details: error instanceof Error ? error.message : "Unknown error",
// // // //       },
// // // //       { status: 500 }
// // // //     );
// // // //   }
// // // // }

// // // // // Handle OPTIONS for CORS preflight
// // // // export async function OPTIONS(req: NextRequest) {
// // // //   return new NextResponse(null, {
// // // //     status: 200,
// // // //     headers: {
// // // //       "Access-Control-Allow-Origin": "*",
// // // //       "Access-Control-Allow-Methods": "POST, OPTIONS",
// // // //       "Access-Control-Allow-Headers": "Content-Type",
// // // //     },
// // // //   });
// // // // }

// // // // src/app/api/student/bubblesheet/upload/route.ts
// // // import { NextRequest, NextResponse } from "next/server";
// // // import { prisma } from "@/lib/prisma";
// // // import path from "path";

// // // export async function POST(req: NextRequest) {
// // //   try {
// // //     const { searchParams } = new URL(req.url);
// // //     const studentId = searchParams.get("studentId");
// // //     const assessmentId = searchParams.get("assessmentId");
// // //     const moduleId = searchParams.get("moduleId");

// // //     console.log("\n" + "=".repeat(60));
// // //     console.log("📝 STUDENT BUBBLE SHEET UPLOAD REQUEST");
// // //     console.log("=".repeat(60));
// // //     console.log("Student ID:", studentId);
// // //     console.log("Assessment ID:", assessmentId);
// // //     console.log("Module ID:", moduleId);

// // //     // Validate required parameters
// // //     if (!studentId || !assessmentId || !moduleId) {
// // //       console.error("❌ Missing required parameters");
// // //       return NextResponse.json(
// // //         { error: "Missing required parameters" },
// // //         { status: 400 }
// // //       );
// // //     }

// // //     // Get the uploaded file
// // //     const formData = await req.formData();
// // //     const file = formData.get("file") as File;

// // //     if (!file) {
// // //       console.error("❌ No file in form data");
// // //       return NextResponse.json(
// // //         { error: "No file uploaded" },
// // //         { status: 400 }
// // //       );
// // //     }

// // //     console.log("📄 File received:", file.name);
// // //     console.log("   Type:", file.type);
// // //     console.log("   Size:", file.size, "bytes");

// // //     // Validate file type (images only)
// // //     const validExtensions = ['.png', '.jpg', '.jpeg'];
// // //     const fileExtension = path.extname(file.name).toLowerCase();
    
// // //     if (!validExtensions.includes(fileExtension)) {
// // //       console.error("❌ Invalid file type:", fileExtension);
// // //       return NextResponse.json(
// // //         { 
// // //           error: "Invalid file type",
// // //           details: `Please upload image file (.png, .jpg, .jpeg). Got: ${fileExtension}`
// // //         },
// // //         { status: 400 }
// // //       );
// // //     }

// // //     console.log("✅ File type valid:", fileExtension);

// // //     // Prepare data for Flask
// // //     const bytes = await file.arrayBuffer();
// // //     const buffer = Buffer.from(bytes);
// // //     const fileBlob = new Blob([buffer], { type: file.type || 'image/jpeg' });

// // //     const flaskFormData = new FormData();
// // //     flaskFormData.append("file", fileBlob, file.name);
// // //     flaskFormData.append("assessmentId", assessmentId);
// // //     flaskFormData.append("studentId", studentId);
// // //     flaskFormData.append("moduleId", moduleId);

// // //     // Flask configuration
// // //     const flaskUrl = process.env.FLASK_API_URL || "http://localhost:7000";
// // //     const flaskEndpoint = `${flaskUrl}/api/process-bubble-sheet`;

// // //     console.log("🔄 Forwarding to Flask:", flaskEndpoint);

// // //     // Test Flask connection first
// // //     try {
// // //       console.log("🏥 Testing Flask connection...");
// // //       const healthCheck = await fetch(`${flaskUrl}/api/health`, {
// // //         method: "GET",
// // //         signal: AbortSignal.timeout(5000),
// // //       });

// // //       if (!healthCheck.ok) {
// // //         throw new Error("Flask health check failed");
// // //       }

// // //       const healthData = await healthCheck.json();
// // //       console.log("✅ Flask is running:", healthData.service);
// // //     } catch (healthError) {
// // //       console.error("❌ Flask health check failed:", healthError);
// // //       return NextResponse.json(
// // //         {
// // //           error: "Cannot connect to Flask service",
// // //           details:
// // //             "Flask API is not running on port 7000. Please start it with: python services/bubblesheet-ocr/flask_api.py",
// // //         },
// // //         { status: 503 }
// // //       );
// // //     }

// // //     // Send to Flask for processing with longer timeout for image processing
// // //     console.log("📤 Sending bubble sheet to Flask for processing...");
// // //     console.log("   This may take up to 60 seconds for large images...");
// // //     let flaskResponse;
    
// // //     try {
// // //       flaskResponse = await fetch(flaskEndpoint, {
// // //         method: "POST",
// // //         body: flaskFormData,
// // //         signal: AbortSignal.timeout(60000), // Increased to 60 seconds
// // //       });
// // //     } catch (fetchError) {
// // //       console.error("❌ Failed to reach Flask:", fetchError);
      
// // //       // Check if it's a timeout error
// // //       if (fetchError instanceof Error && fetchError.name === "TimeoutError") {
// // //         return NextResponse.json(
// // //           {
// // //             error: "Processing timeout",
// // //             details: "The image is taking too long to process. Please try with a smaller or clearer image.",
// // //           },
// // //           { status: 408 }
// // //         );
// // //       }
      
// // //       return NextResponse.json(
// // //         {
// // //           error: "Failed to connect to Flask service",
// // //           details: fetchError instanceof Error ? fetchError.message : "Unknown error",
// // //         },
// // //         { status: 503 }
// // //       );
// // //     }

// // //     console.log("📥 Flask response status:", flaskResponse.status);

// // //     // Get response text first
// // //     const responseText = await flaskResponse.text();
// // //     console.log("📥 Response preview (first 500 chars):", responseText.substring(0, 500));

// // //     // Check if response is JSON
// // //     const contentType = flaskResponse.headers.get("content-type");
// // //     if (!contentType || !contentType.includes("application/json")) {
// // //       console.error("❌ Flask returned non-JSON response");
// // //       console.error("Content-Type:", contentType);

// // //       return NextResponse.json(
// // //         {
// // //           error: "Flask service error",
// // //           details: "Flask returned an unexpected response. Check Flask console for details.",
// // //           status: flaskResponse.status,
// // //         },
// // //         { status: 502 }
// // //       );
// // //     }

// // //     // Parse JSON response
// // //     let result;
// // //     try {
// // //       result = JSON.parse(responseText);
// // //     } catch (parseError) {
// // //       console.error("❌ Failed to parse JSON:", parseError);
// // //       return NextResponse.json(
// // //         {
// // //           error: "Invalid response from Flask",
// // //           details: "Could not parse Flask response as JSON",
// // //         },
// // //         { status: 502 }
// // //       );
// // //     }

// // //     // Handle Flask errors
// // //     if (!flaskResponse.ok) {
// // //       console.error("❌ Flask error response:", result);

// // //       const errorMessage = result.error || "Failed to process bubble sheet";
// // //       const errorDetails = result.details || "Unknown error";

// // //       return NextResponse.json(
// // //         {
// // //           error: errorMessage,
// // //           details: errorDetails,
// // //         },
// // //         { status: flaskResponse.status }
// // //       );
// // //     }

// // //     // Success! Now store in database
// // //     console.log("✅ Flask processed successfully");
// // //     console.log("   Answers detected:", result.answers_count);

// // //     // Check if answers were extracted
// // //     const answers = result.answers as Array<{
// // //       question_number: number;
// // //       selected_option: string;
// // //     }>;

// // //     if (!answers || answers.length === 0) {
// // //       console.error("❌ No answers extracted from bubble sheet");
// // //       return NextResponse.json(
// // //         {
// // //           error: "No answers detected",
// // //           details: "Please ensure bubbles are properly filled and image is clear",
// // //         },
// // //         { status: 400 }
// // //       );
// // //     }

// // //     // Delete existing answers for this student and assessment
// // //     console.log("🗑️ Deleting existing answers...");
// // //     const deletedCount = await prisma.bubbleSheet_Student_Answer.deleteMany({
// // //       where: {
// // //         student_id: studentId,
// // //         assessment_id: assessmentId,
// // //       },
// // //     });
// // //     console.log(`   Deleted ${deletedCount.count} existing answers`);

// // //     // Store new answers
// // //     console.log("💾 Storing new answers in database...");
    
// // //     const storedAnswers = await prisma.$transaction(
// // //       answers.map((answer) =>
// // //         prisma.bubbleSheet_Student_Answer.create({
// // //           data: {
// // //             student_id: studentId,
// // //             assessment_id: assessmentId,
// // //             module_id: moduleId,
// // //             question_number: answer.question_number,
// // //             selected_option: answer.selected_option,
// // //           },
// // //         })
// // //       )
// // //     );

// // //     console.log(`✅ Stored ${storedAnswers.length} answers in database`);
// // //     console.log("=".repeat(60) + "\n");

// // //     // Return success response
// // //     return NextResponse.json({
// // //       success: true,
// // //       message: "Bubble sheet uploaded and processed successfully",
// // //       answers: result.answers,
// // //       answers_count: result.answers_count,
// // //       file_path: result.file_path,
// // //       stored_count: storedAnswers.length,
// // //     });
// // //   } catch (error) {
// // //     console.error("\n❌ ERROR IN BUBBLE SHEET UPLOAD");
// // //     console.error("=".repeat(60));
// // //     console.error("Error:", error);
// // //     console.error("Type:", error instanceof Error ? error.constructor.name : typeof error);
// // //     if (error instanceof Error) {
// // //       console.error("Message:", error.message);
// // //       console.error("Stack:", error.stack);
// // //     }
// // //     console.error("=".repeat(60) + "\n");

// // //     // Check for specific error types
// // //     if (error instanceof Error) {
// // //       if (error.message.includes("fetch failed") || error.name === "TimeoutError") {
// // //         return NextResponse.json(
// // //           {
// // //             error: "Cannot connect to Flask service",
// // //             details:
// // //               "Please ensure Flask API is running: python services/bubblesheet-ocr/flask_api.py",
// // //           },
// // //           { status: 503 }
// // //         );
// // //       }
// // //     }

// // //     return NextResponse.json(
// // //       {
// // //         error: "Failed to process bubble sheet",
// // //         details: error instanceof Error ? error.message : "Unknown error",
// // //       },
// // //       { status: 500 }
// // //     );
// // //   }
// // // }

// // // // Handle OPTIONS for CORS preflight
// // // export async function OPTIONS(req: NextRequest) {
// // //   return new NextResponse(null, {
// // //     status: 200,
// // //     headers: {
// // //       "Access-Control-Allow-Origin": "*",
// // //       "Access-Control-Allow-Methods": "POST, OPTIONS",
// // //       "Access-Control-Allow-Headers": "Content-Type",
// // //     },
// // //   });
// // // }

// // // src/app/api/student/bubblesheet/upload/route.ts
// // import { NextRequest, NextResponse } from "next/server";
// // import { prisma } from "@/lib/prisma";
// // import path from "path";

// // export async function POST(req: NextRequest) {
// //   try {
// //     const { searchParams } = new URL(req.url);
// //     const studentId = searchParams.get("studentId");
// //     const assessmentId = searchParams.get("assessmentId");
// //     const moduleId = searchParams.get("moduleId");

// //     console.log("\n" + "=".repeat(60));
// //     console.log("📝 STUDENT BUBBLE SHEET UPLOAD REQUEST");
// //     console.log("=".repeat(60));
// //     console.log("Student ID:", studentId);
// //     console.log("Assessment ID:", assessmentId);
// //     console.log("Module ID:", moduleId);

// //     if (!studentId || !assessmentId || !moduleId) {
// //       console.error("❌ Missing required parameters");
// //       return NextResponse.json(
// //         { error: "Missing required parameters" },
// //         { status: 400 }
// //       );
// //     }

// //     const formData = await req.formData();
// //     const file = formData.get("file") as File;

// //     if (!file) {
// //       console.error("❌ No file in form data");
// //       return NextResponse.json(
// //         { error: "No file uploaded" },
// //         { status: 400 }
// //       );
// //     }

// //     console.log("📄 File received:", file.name);
// //     console.log("   Type:", file.type);
// //     console.log("   Size:", file.size, "bytes");

// //     // Validate file type
// //     const validExtensions = ['.png', '.jpg', '.jpeg'];
// //     const fileExtension = path.extname(file.name).toLowerCase();
    
// //     if (!validExtensions.includes(fileExtension)) {
// //       console.error("❌ Invalid file type:", fileExtension);
// //       return NextResponse.json(
// //         { 
// //           error: "Invalid file type",
// //           details: `Please upload image file (.png, .jpg, .jpeg). Got: ${fileExtension}`
// //         },
// //         { status: 400 }
// //       );
// //     }

// //     console.log("✅ File type valid:", fileExtension);

// //     // Flask configuration
// //     const flaskUrl = process.env.FLASK_API_URL || "http://localhost:7000";
// //     const flaskEndpoint = `${flaskUrl}/api/process-bubble-sheet`;

// //     console.log("🔄 Forwarding to Flask:", flaskEndpoint);

// //     // Test Flask connection
// //     try {
// //       console.log("🏥 Testing Flask connection...");
// //       const healthCheck = await fetch(`${flaskUrl}/api/health`, {
// //         method: "GET",
// //         signal: AbortSignal.timeout(5000),
// //       });

// //       if (!healthCheck.ok) {
// //         throw new Error("Flask health check failed");
// //       }

// //       const healthData = await healthCheck.json();
// //       console.log("✅ Flask is running:", healthData.service);
// //     } catch (healthError) {
// //       console.error("❌ Flask health check failed:", healthError);
// //       return NextResponse.json(
// //         {
// //           error: "Cannot connect to Flask service",
// //           details: "Flask API is not running on port 7000. Start with: python services/bubblesheet-ocr/flask_api.py",
// //         },
// //         { status: 503 }
// //       );
// //     }

// //     // ✅ FIX: Properly prepare FormData for Flask
// //     console.log("📤 Preparing FormData for Flask...");
    
// //     // Convert file to buffer
// //     const bytes = await file.arrayBuffer();
// //     const buffer = Buffer.from(bytes);
    
// //     // Create a proper File-like Blob with correct MIME type
// //     const mimeType = file.type || 'image/jpeg';
// //     const fileBlob = new Blob([buffer], { type: mimeType });
    
// //     // Create FormData with proper file structure
// //     const flaskFormData = new FormData();
// //     // ⚠️ IMPORTANT: Use original filename so Flask gets the extension
// //     flaskFormData.append("file", fileBlob, file.name);
// //     flaskFormData.append("assessmentId", assessmentId);
// //     flaskFormData.append("studentId", studentId);
// //     flaskFormData.append("moduleId", moduleId);

// //     console.log("   File blob size:", fileBlob.size);
// //     console.log("   MIME type:", mimeType);

// //     // Send to Flask with extended timeout
// //     console.log("📤 Sending to Flask (timeout: 60s)...");
// //     let flaskResponse;
    
// //     try {
// //       flaskResponse = await fetch(flaskEndpoint, {
// //         method: "POST",
// //         body: flaskFormData,
// //         signal: AbortSignal.timeout(60000),
// //       });
// //     } catch (fetchError) {
// //       console.error("❌ Failed to reach Flask:", fetchError);
      
// //       if (fetchError instanceof Error && fetchError.name === "TimeoutError") {
// //         return NextResponse.json(
// //           {
// //             error: "Processing timeout",
// //             details: "Image processing took too long. Try a smaller or clearer image.",
// //           },
// //           { status: 408 }
// //         );
// //       }
      
// //       return NextResponse.json(
// //         {
// //           error: "Failed to connect to Flask service",
// //           details: fetchError instanceof Error ? fetchError.message : "Unknown error",
// //         },
// //         { status: 503 }
// //       );
// //     }

// //     console.log("📥 Flask response status:", flaskResponse.status);

// //     // Get response
// //     const responseText = await flaskResponse.text();
// //     console.log("📥 Response preview:", responseText.substring(0, 200));

// //     // Validate JSON response
// //     const contentType = flaskResponse.headers.get("content-type");
// //     if (!contentType || !contentType.includes("application/json")) {
// //       console.error("❌ Non-JSON response from Flask");
// //       console.error("Content-Type:", contentType);
// //       console.error("Response body:", responseText.substring(0, 500));

// //       return NextResponse.json(
// //         {
// //           error: "Flask service error",
// //           details: "Flask returned non-JSON response. Check Flask logs.",
// //           status: flaskResponse.status,
// //         },
// //         { status: 502 }
// //       );
// //     }

// //     // Parse response
// //     let result;
// //     try {
// //       result = JSON.parse(responseText);
// //     } catch (parseError) {
// //       console.error("❌ JSON parse error:", parseError);
// //       return NextResponse.json(
// //         {
// //           error: "Invalid Flask response",
// //           details: "Could not parse response as JSON",
// //         },
// //         { status: 502 }
// //       );
// //     }

// //     // Handle Flask errors
// //     if (!flaskResponse.ok) {
// //       console.error("❌ Flask error:", result);
// //       return NextResponse.json(
// //         {
// //           error: result.error || "Failed to process bubble sheet",
// //           details: result.details || "Unknown error",
// //           suggestions: result.suggestions || [],
// //         },
// //         { status: flaskResponse.status }
// //       );
// //     }

// //     // Success!
// //     console.log("✅ Flask processed successfully");
// //     console.log("   Answers detected:", result.answers_count);

// //     const answers = result.answers as Array<{
// //       question_number: number;
// //       selected_option: string;
// //     }>;

// //     if (!answers || answers.length === 0) {
// //       console.error("❌ No answers detected");
// //       return NextResponse.json(
// //         {
// //           error: "No answers detected",
// //           details: "Ensure bubbles are properly filled and image is clear",
// //         },
// //         { status: 400 }
// //       );
// //     }

// //     // Delete existing answers
// //     console.log("🗑️ Deleting existing answers...");
// //     const deletedCount = await prisma.bubbleSheet_Student_Answer.deleteMany({
// //       where: {
// //         student_id: studentId,
// //         assessment_id: assessmentId,
// //       },
// //     });
// //     console.log(`   Deleted ${deletedCount.count} existing answers`);

// //     // Store new answers
// //     console.log("💾 Storing answers in database...");
    
// //     const storedAnswers = await prisma.$transaction(
// //       answers.map((answer) =>
// //         prisma.bubbleSheet_Student_Answer.create({
// //           data: {
// //             student_id: studentId,
// //             assessment_id: assessmentId,
// //             module_id: moduleId,
// //             question_number: answer.question_number,
// //             selected_option: answer.selected_option,
// //           },
// //         })
// //       )
// //     );

// //     console.log(`✅ Stored ${storedAnswers.length} answers`);
// //     console.log("=".repeat(60) + "\n");

// //     return NextResponse.json({
// //       success: true,
// //       message: "Bubble sheet processed successfully",
// //       answers: result.answers,
// //       answers_count: result.answers_count,
// //       file_path: result.file_path,
// //       stored_count: storedAnswers.length,
// //     });

// //   } catch (error) {
// //     console.error("\n❌ ERROR IN BUBBLE SHEET UPLOAD");
// //     console.error("=".repeat(60));
// //     console.error("Error:", error);
    
// //     if (error instanceof Error) {
// //       console.error("Message:", error.message);
// //       console.error("Stack:", error.stack);
// //     }
// //     console.error("=".repeat(60) + "\n");

// //     if (error instanceof Error && 
// //         (error.message.includes("fetch failed") || error.name === "TimeoutError")) {
// //       return NextResponse.json(
// //         {
// //           error: "Cannot connect to Flask service",
// //           details: "Ensure Flask is running: python services/bubblesheet-ocr/flask_api.py",
// //         },
// //         { status: 503 }
// //       );
// //     }

// //     return NextResponse.json(
// //       {
// //         error: "Failed to process bubble sheet",
// //         details: error instanceof Error ? error.message : "Unknown error",
// //       },
// //       { status: 500 }
// //     );
// //   }
// // }

// // export async function OPTIONS(req: NextRequest) {
// //   return new NextResponse(null, {
// //     status: 200,
// //     headers: {
// //       "Access-Control-Allow-Origin": "*",
// //       "Access-Control-Allow-Methods": "POST, OPTIONS",
// //       "Access-Control-Allow-Headers": "Content-Type",
// //     },
// //   });
// // }

// // src/app/api/student/bubblesheet/upload/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import path from "path";

// export async function POST(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const studentId = searchParams.get("studentId");
//     const assessmentId = searchParams.get("assessmentId");
//     const moduleId = searchParams.get("moduleId");

//     console.log("\n" + "=".repeat(60));
//     console.log("📝 STUDENT BUBBLE SHEET UPLOAD REQUEST");
//     console.log("=".repeat(60));
//     console.log("Student ID:", studentId);
//     console.log("Assessment ID:", assessmentId);
//     console.log("Module ID:", moduleId);

//     if (!studentId || !assessmentId || !moduleId) {
//       console.error("❌ Missing required parameters");
//       return NextResponse.json(
//         { error: "Missing required parameters" },
//         { status: 400 }
//       );
//     }

//     const formData = await req.formData();
//     const file = formData.get("file") as File;

//     if (!file) {
//       console.error("❌ No file in form data");
//       return NextResponse.json(
//         { error: "No file uploaded" },
//         { status: 400 }
//       );
//     }

//     console.log("📄 File received:", file.name);
//     console.log("   Type:", file.type);
//     console.log("   Size:", file.size, "bytes");

//     // Validate file type
//     const validExtensions = ['.png', '.jpg', '.jpeg'];
//     const fileExtension = path.extname(file.name).toLowerCase();
    
//     if (!validExtensions.includes(fileExtension)) {
//       console.error("❌ Invalid file type:", fileExtension);
//       return NextResponse.json(
//         { 
//           error: "Invalid file type",
//           details: `Please upload image file (.png, .jpg, .jpeg). Got: ${fileExtension}`
//         },
//         { status: 400 }
//       );
//     }

//     console.log("✅ File type valid:", fileExtension);

//     // Flask configuration
//     const flaskUrl = process.env.FLASK_API_URL || "http://localhost:7000";
//     const flaskEndpoint = `${flaskUrl}/api/process-bubble-sheet`;

//     console.log("🔄 Forwarding to Flask:", flaskEndpoint);

//     // Test Flask connection
//     try {
//       console.log("🏥 Testing Flask connection...");
//       const healthCheck = await fetch(`${flaskUrl}/api/health`, {
//         method: "GET",
//         signal: AbortSignal.timeout(5000),
//       });

//       if (!healthCheck.ok) {
//         throw new Error("Flask health check failed");
//       }

//       const healthData = await healthCheck.json();
//       console.log("✅ Flask is running:", healthData.service);
//     } catch (healthError) {
//       console.error("❌ Flask health check failed:", healthError);
//       return NextResponse.json(
//         {
//           error: "Cannot connect to Flask service",
//           details: "Flask API is not running on port 7000. Start with: python services/bubblesheet-ocr/flask_api.py",
//         },
//         { status: 503 }
//       );
//     }

//     // ✅ FIX: Properly prepare FormData for Flask
//     console.log("📤 Preparing FormData for Flask...");
    
//     // Convert file to buffer
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);
    
//     // Create a proper File-like Blob with correct MIME type
//     const mimeType = file.type || 'image/jpeg';
//     const fileBlob = new Blob([buffer], { type: mimeType });
    
//     // Create FormData with proper file structure
//     const flaskFormData = new FormData();
//     // ⚠️ IMPORTANT: Use original filename so Flask gets the extension
//     flaskFormData.append("file", fileBlob, file.name);
//     flaskFormData.append("assessmentId", assessmentId);
//     flaskFormData.append("studentId", studentId);
//     flaskFormData.append("moduleId", moduleId);

//     console.log("   File blob size:", fileBlob.size);
//     console.log("   MIME type:", mimeType);

//     // Send to Flask with extended timeout
//     console.log("📤 Sending to Flask (timeout: 90s)...");
//     console.log("   Endpoint:", flaskEndpoint);
//     console.log("   FormData keys:", Array.from(flaskFormData.keys()));
    
//     let flaskResponse;
//     const startTime = Date.now();
    
//     try {
//       flaskResponse = await fetch(flaskEndpoint, {
//         method: "POST",
//         body: flaskFormData,
//         signal: AbortSignal.timeout(90000), // Increased to 90s
//       });
      
//       const elapsed = Date.now() - startTime;
//       console.log(`📥 Flask responded in ${elapsed}ms`);
//     } catch (fetchError) {
//       const elapsed = Date.now() - startTime;
//       console.error(`❌ Flask request failed after ${elapsed}ms:`, fetchError);
      
//       if (fetchError instanceof Error && fetchError.name === "TimeoutError") {
//         return NextResponse.json(
//           {
//             error: "Processing timeout",
//             details: "Image processing took too long (>90s). Try a smaller or clearer image.",
//           },
//           { status: 408 }
//         );
//       }
      
//       return NextResponse.json(
//         {
//           error: "Failed to connect to Flask service",
//           details: fetchError instanceof Error ? fetchError.message : "Unknown error",
//         },
//         { status: 503 }
//       );
//     }

//     console.log("📥 Flask response status:", flaskResponse.status);
//     console.log("   Headers:", Object.fromEntries(flaskResponse.headers.entries()));

//     // Get response
//     const responseText = await flaskResponse.text();
//     console.log("📥 Response preview:", responseText.substring(0, 200));

//     // Validate JSON response
//     const contentType = flaskResponse.headers.get("content-type");
//     if (!contentType || !contentType.includes("application/json")) {
//       console.error("❌ Non-JSON response from Flask");
//       console.error("Content-Type:", contentType);
//       console.error("Response body:", responseText.substring(0, 500));

//       return NextResponse.json(
//         {
//           error: "Flask service error",
//           details: "Flask returned non-JSON response. Check Flask logs.",
//           status: flaskResponse.status,
//         },
//         { status: 502 }
//       );
//     }

//     // Parse response
//     let result;
//     try {
//       result = JSON.parse(responseText);
//     } catch (parseError) {
//       console.error("❌ JSON parse error:", parseError);
//       return NextResponse.json(
//         {
//           error: "Invalid Flask response",
//           details: "Could not parse response as JSON",
//         },
//         { status: 502 }
//       );
//     }

//     // Handle Flask errors
//     if (!flaskResponse.ok) {
//       console.error("❌ Flask error:", result);
//       return NextResponse.json(
//         {
//           error: result.error || "Failed to process bubble sheet",
//           details: result.details || "Unknown error",
//           suggestions: result.suggestions || [],
//         },
//         { status: flaskResponse.status }
//       );
//     }

//     // Success!
//     console.log("✅ Flask processed successfully");
//     console.log("   Answers detected:", result.answers_count);

//     const answers = result.answers as Array<{
//       question_number: number;
//       selected_option: string;
//     }>;

//     if (!answers || answers.length === 0) {
//       console.error("❌ No answers detected");
//       return NextResponse.json(
//         {
//           error: "No answers detected",
//           details: "Ensure bubbles are properly filled and image is clear",
//         },
//         { status: 400 }
//       );
//     }

//     // Delete existing answers
//     console.log("🗑️ Deleting existing answers...");
//     const deletedCount = await prisma.bubbleSheet_Student_Answer.deleteMany({
//       where: {
//         student_id: studentId,
//         assessment_id: assessmentId,
//       },
//     });
//     console.log(`   Deleted ${deletedCount.count} existing answers`);

//     // Store new answers
//     console.log("💾 Storing answers in database...");
    
//     const storedAnswers = await prisma.$transaction(
//       answers.map((answer) =>
//         prisma.bubbleSheet_Student_Answer.create({
//           data: {
//             student_id: studentId,
//             assessment_id: assessmentId,
//             module_id: moduleId,
//             question_number: answer.question_number,
//             selected_option: answer.selected_option,
//           },
//         })
//       )
//     );

//     console.log(`✅ Stored ${storedAnswers.length} answers`);
//     console.log("=".repeat(60) + "\n");

//     return NextResponse.json({
//       success: true,
//       message: "Bubble sheet processed successfully",
//       answers: result.answers,
//       answers_count: result.answers_count,
//       file_path: result.file_path,
//       stored_count: storedAnswers.length,
//     });

//   } catch (error) {
//     console.error("\n❌ ERROR IN BUBBLE SHEET UPLOAD");
//     console.error("=".repeat(60));
//     console.error("Error:", error);
    
//     if (error instanceof Error) {
//       console.error("Message:", error.message);
//       console.error("Stack:", error.stack);
//     }
//     console.error("=".repeat(60) + "\n");

//     if (error instanceof Error && 
//         (error.message.includes("fetch failed") || error.name === "TimeoutError")) {
//       return NextResponse.json(
//         {
//           error: "Cannot connect to Flask service",
//           details: "Ensure Flask is running: python services/bubblesheet-ocr/flask_api.py",
//         },
//         { status: 503 }
//       );
//     }

//     return NextResponse.json(
//       {
//         error: "Failed to process bubble sheet",
//         details: error instanceof Error ? error.message : "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function OPTIONS(req: NextRequest) {
//   return new NextResponse(null, {
//     status: 200,
//     headers: {
//       "Access-Control-Allow-Origin": "*",
//       "Access-Control-Allow-Methods": "POST, OPTIONS",
//       "Access-Control-Allow-Headers": "Content-Type",
//     },
//   });
// }

// src/app/api/student/bubblesheet/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const assessmentId = searchParams.get("assessmentId");
    const moduleId = searchParams.get("moduleId");

    console.log("\n" + "=".repeat(60));
    console.log("📝 STUDENT BUBBLE SHEET UPLOAD REQUEST");
    console.log("=".repeat(60));
    console.log("Student ID:", studentId);
    console.log("Assessment ID:", assessmentId);
    console.log("Module ID:", moduleId);

    if (!studentId || !assessmentId || !moduleId) {
      console.error("❌ Missing required parameters");
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("❌ No file in form data");
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    console.log("📄 File received:", file.name);
    console.log("   Type:", file.type);
    console.log("   Size:", file.size, "bytes");

    // Validate file type
    const validExtensions = ['.png', '.jpg', '.jpeg'];
    const fileExtension = path.extname(file.name).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      console.error("❌ Invalid file type:", fileExtension);
      return NextResponse.json(
        { 
          error: "Invalid file type",
          details: `Please upload image file (.png, .jpg, .jpeg). Got: ${fileExtension}`
        },
        { status: 400 }
      );
    }

    console.log("✅ File type valid:", fileExtension);

    // Flask configuration
    const flaskUrl = process.env.FLASK_API_URL || "http://localhost:7000";
    const flaskEndpoint = `${flaskUrl}/api/process-bubble-sheet`;

    console.log("🔄 Forwarding to Flask:", flaskEndpoint);

    // Test Flask connection
    try {
      console.log("🏥 Testing Flask connection...");
      const healthCheck = await fetch(`${flaskUrl}/api/health`, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });

      if (!healthCheck.ok) {
        throw new Error("Flask health check failed");
      }

      const healthData = await healthCheck.json();
      console.log("✅ Flask is running:", healthData.service);
    } catch (healthError) {
      console.error("❌ Flask health check failed:", healthError);
      return NextResponse.json(
        {
          error: "Cannot connect to Flask service",
          details: "Flask API is not running on port 7000. Start with: python services/bubblesheet-ocr/flask_api.py",
        },
        { status: 503 }
      );
    }

    // ✅ FIX: Properly prepare FormData for Flask
    console.log("📤 Preparing FormData for Flask...");
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create a proper File-like Blob with correct MIME type
    const mimeType = file.type || 'image/jpeg';
    const fileBlob = new Blob([buffer], { type: mimeType });
    
    // Create FormData with proper file structure
    const flaskFormData = new FormData();
    // ⚠️ IMPORTANT: Use original filename so Flask gets the extension
    flaskFormData.append("file", fileBlob, file.name);
    flaskFormData.append("assessmentId", assessmentId);
    flaskFormData.append("studentId", studentId);
    flaskFormData.append("moduleId", moduleId);

    console.log("   File blob size:", fileBlob.size);
    console.log("   MIME type:", mimeType);

    // Send to Flask with extended timeout
    console.log("📤 Sending to Flask (timeout: 90s)...");
    console.log("   Endpoint:", flaskEndpoint);
    console.log("   FormData keys:", Array.from(flaskFormData.keys()));
    
    let flaskResponse;
    const startTime = Date.now();
    
    try {
      flaskResponse = await fetch(flaskEndpoint, {
        method: "POST",
        body: flaskFormData,
        signal: AbortSignal.timeout(90000), // Increased to 90s
      });
      
      const elapsed = Date.now() - startTime;
      console.log(`📥 Flask responded in ${elapsed}ms`);
    } catch (fetchError) {
      const elapsed = Date.now() - startTime;
      console.error(`❌ Flask request failed after ${elapsed}ms:`, fetchError);
      
      if (fetchError instanceof Error && fetchError.name === "TimeoutError") {
        return NextResponse.json(
          {
            error: "Processing timeout",
            details: "Image processing took too long (>90s). Try a smaller or clearer image.",
          },
          { status: 408 }
        );
      }
      
      return NextResponse.json(
        {
          error: "Failed to connect to Flask service",
          details: fetchError instanceof Error ? fetchError.message : "Unknown error",
        },
        { status: 503 }
      );
    }

    console.log("📥 Flask response status:", flaskResponse.status);
    console.log("   Headers:", Object.fromEntries(flaskResponse.headers.entries()));

    // Get response
    const responseText = await flaskResponse.text();
    console.log("📥 Response preview:", responseText.substring(0, 200));

    // Validate JSON response
    const contentType = flaskResponse.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ Non-JSON response from Flask");
      console.error("Content-Type:", contentType);
      console.error("Response body:", responseText.substring(0, 500));

      return NextResponse.json(
        {
          error: "Flask service error",
          details: "Flask returned non-JSON response. Check Flask logs.",
          status: flaskResponse.status,
        },
        { status: 502 }
      );
    }

    // Parse response
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError);
      return NextResponse.json(
        {
          error: "Invalid Flask response",
          details: "Could not parse response as JSON",
        },
        { status: 502 }
      );
    }

    // Handle Flask errors
    if (!flaskResponse.ok) {
      console.error("❌ Flask error:", result);
      return NextResponse.json(
        {
          error: result.error || "Failed to process bubble sheet",
          details: result.details || "Unknown error",
          suggestions: result.suggestions || [],
        },
        { status: flaskResponse.status }
      );
    }

    // Success!
    console.log("✅ Flask processed successfully");
    console.log("   Answers detected:", result.answers_count);

    const answers = result.answers as Array<{
      question_number: number;
      selected_option: string;
    }>;

    if (!answers || answers.length === 0) {
      console.error("❌ No answers detected");
      return NextResponse.json(
        {
          error: "No answers detected",
          details: "Ensure bubbles are properly filled and image is clear",
        },
        { status: 400 }
      );
    }

    // Deduplicate answers - keep only the last occurrence of each question
    console.log("🔍 Deduplicating answers...");
    const answerMap = new Map<number, string>();
    
    for (const answer of answers) {
      if (answerMap.has(answer.question_number)) {
        console.log(`   ⚠️ Duplicate found: Q${answer.question_number} (keeping last occurrence)`);
      }
      answerMap.set(answer.question_number, answer.selected_option);
    }
    
    const uniqueAnswers = Array.from(answerMap.entries()).map(([question_number, selected_option]) => ({
      question_number,
      selected_option
    }));
    
    console.log(`   Original: ${answers.length} answers`);
    console.log(`   Unique: ${uniqueAnswers.length} answers`);
    
    if (uniqueAnswers.length !== answers.length) {
      console.log(`   ⚠️ Removed ${answers.length - uniqueAnswers.length} duplicates`);
    }

    // Delete existing answers
    console.log("🗑️ Deleting existing answers...");
    const deletedCount = await prisma.bubbleSheet_Student_Answer.deleteMany({
      where: {
        student_id: studentId,
        assessment_id: assessmentId,
      },
    });
    console.log(`   Deleted ${deletedCount.count} existing answers`);

    // Store new answers
    console.log("💾 Storing answers in database...");
    
    const storedAnswers = await prisma.$transaction(
      uniqueAnswers.map((answer) =>
        prisma.bubbleSheet_Student_Answer.create({
          data: {
            student_id: studentId,
            assessment_id: assessmentId,
            module_id: moduleId,
            question_number: answer.question_number,
            selected_option: answer.selected_option,
          },
        })
      )
    );

    console.log(`✅ Stored ${storedAnswers.length} answers`);
    console.log("=".repeat(60) + "\n");

    return NextResponse.json({
      success: true,
      message: "Bubble sheet processed successfully",
      answers: uniqueAnswers,
      answers_count: uniqueAnswers.length,
      original_count: result.answers_count,
      duplicates_removed: result.answers_count - uniqueAnswers.length,
      file_path: result.file_path,
      stored_count: storedAnswers.length,
    });

  } catch (error) {
    console.error("\n❌ ERROR IN BUBBLE SHEET UPLOAD");
    console.error("=".repeat(60));
    console.error("Error:", error);
    
    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
    console.error("=".repeat(60) + "\n");

    if (error instanceof Error && 
        (error.message.includes("fetch failed") || error.name === "TimeoutError")) {
      return NextResponse.json(
        {
          error: "Cannot connect to Flask service",
          details: "Ensure Flask is running: python services/bubblesheet-ocr/flask_api.py",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to process bubble sheet",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}