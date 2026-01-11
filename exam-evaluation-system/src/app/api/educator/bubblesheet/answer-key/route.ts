// // // // // src/app/api/educator/bubblesheet/answer-key/route.ts
// // // // import { NextRequest, NextResponse } from "next/server";
// // // // import { prisma } from "@/lib/prisma";

// // // // const FLASK_API_BASE = process.env.FLASK_API_BASE || "http://localhost:7000";

// // // // export async function POST(request: NextRequest) {
// // // //   try {
// // // //     // Get query parameters  
// // // //     const { searchParams } = new URL(request.url);
// // // //     const assessmentId = searchParams.get("assessmentId");
// // // //     const moduleId = searchParams.get("moduleId");
// // // //     const educatorId = searchParams.get("educatorId");

// // // //     if (!assessmentId || !moduleId || !educatorId) {
// // // //       return NextResponse.json(
// // // //         { error: "Missing required query parameters" },
// // // //         { status: 400 }
// // // //       );
// // // //     }

// // // //     const formData = await request.formData();
// // // //     const file = formData.get("file") as File;

// // // //     if (!file) {
// // // //       return NextResponse.json(
// // // //         { error: "No file uploaded" },
// // // //         { status: 400 }
// // // //       );
// // // //     }

// // // //     // Prepare form data for Flask API
// // // //     const flaskFormData = new FormData();
// // // //     flaskFormData.append("file", file);
// // // //     flaskFormData.append("assessmentId", assessmentId);
// // // //     flaskFormData.append("moduleId", moduleId);
// // // //     flaskFormData.append("educatorId", educatorId);

// // // //     // Call Flask API to extract answer key
// // // //     const flaskResponse = await fetch(
// // // //       `${FLASK_API_BASE}/api/extract-answer-key`,
// // // //       {
// // // //         method: "POST",
// // // //         body: flaskFormData,
// // // //       }
// // // //     );

// // // //     if (!flaskResponse.ok) {
// // // //       const errorData = await flaskResponse.json();
// // // //       throw new Error(errorData.error || "Answer key extraction failed");
// // // //     }

// // // //     const flaskResult = await flaskResponse.json();
// // // //     console.log("Flask extraction result:", flaskResult);

// // // //     // Delete existing answer key for this assessment
// // // //     await prisma.bubbleSheet_Answer_Key.deleteMany({
// // // //       where: {
// // // //         assessment_id: assessmentId,
// // // //       },
// // // //     });

// // // //     // Store answer key in database
// // // //     const answers = flaskResult.answers as Array<{
// // // //       question_number: number;
// // // //       correct_option: string;
// // // //     }>;

// // // //     const answerKeys = await prisma.$transaction(
// // // //       answers.map((answer) =>
// // // //         prisma.bubbleSheet_Answer_Key.create({
// // // //           data: {
// // // //             assessment_id: assessmentId,
// // // //             module_id: moduleId,
// // // //             question_number: answer.question_number,
// // // //             correct_option: answer.correct_option,
// // // //             created_by: educatorId,
// // // //           },
// // // //         })
// // // //       )
// // // //     );

// // // //     console.log(`✅ Stored ${answerKeys.length} answer keys in database`);

// // // //     return NextResponse.json({
// // // //       success: true,
// // // //       message: "Answer key uploaded successfully",
// // // //       answer_count: answers.length,
// // // //       file_path: flaskResult.file_path,
// // // //       is_valid: flaskResult.is_valid,
// // // //     });
// // // //   } catch (error) {
// // // //     console.error("Error uploading answer key:", error);

// // // //     if (error instanceof Error && error.message.includes("fetch")) {
// // // //       return NextResponse.json(
// // // //         {
// // // //           error: "Answer key extraction service unavailable",
// // // //           details: "Please ensure the Flask API is running on port 7000",
// // // //         },
// // // //         { status: 503 }
// // // //       );
// // // //     }

// // // //     return NextResponse.json(
// // // //       {
// // // //         error: "Failed to upload answer key",
// // // //         details: error instanceof Error ? error.message : "Unknown error",
// // // //       },
// // // //       { status: 500 }
// // // //     );
// // // //   }
// // // // }

// // // // src/app/api/educator/bubblesheet/answer-key/route.ts
// // // import { NextRequest, NextResponse } from "next/server";
// // // import path from "path";
// // // import { promises as fs } from "fs";
// // // import os from "os";

// // // export async function POST(req: NextRequest) {
// // //   try {
// // //     const { searchParams } = new URL(req.url);
// // //     const assessmentId = searchParams.get("assessmentId");
// // //     const moduleId = searchParams.get("moduleId");
// // //     const educatorId = searchParams.get("educatorId");

// // //     console.log("📋 Answer Key Upload Request");
// // //     console.log("Assessment ID:", assessmentId);
// // //     console.log("Module ID:", moduleId);
// // //     console.log("Educator ID:", educatorId);

// // //     // Validate required parameters
// // //     if (!assessmentId || !moduleId || !educatorId) {
// // //       return NextResponse.json(
// // //         { error: "Missing required parameters" },
// // //         { status: 400 }
// // //       );
// // //     }

// // //     // Get the uploaded file
// // //     const formData = await req.formData();
// // //     const file = formData.get("file") as File;

// // //     if (!file) {
// // //       return NextResponse.json(
// // //         { error: "No file uploaded" },
// // //         { status: 400 }
// // //       );
// // //     }

// // //     console.log("📄 File received:", file.name);
// // //     console.log("📄 File type:", file.type);
// // //     console.log("📄 File size:", file.size, "bytes");

// // //     // Validate file type (Excel files)
// // //     const validTypes = [
// // //       "application/vnd.ms-excel", // .xls
// // //       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
// // //       "application/vnd.ms-excel.sheet.macroEnabled.12", // .xlsm
// // //     ];

// // //     if (!validTypes.includes(file.type) && !file.name.match(/\.(xls|xlsx|xlsm)$/i)) {
// // //       return NextResponse.json(
// // //         { error: "Invalid file type. Please upload an Excel file (.xls, .xlsx, .xlsm)" },
// // //         { status: 400 }
// // //       );
// // //     }

// // //     // Create a temporary file to store the upload
// // //     const bytes = await file.arrayBuffer();
// // //     const buffer = Buffer.from(bytes);

// // //     // Create temp directory if it doesn't exist
// // //     const tempDir = path.join(os.tmpdir(), "bubblesheet-uploads");
// // //     try {
// // //       await fs.mkdir(tempDir, { recursive: true });
// // //     } catch (error) {
// // //       console.log("Temp directory already exists or created");
// // //     }

// // //     // Save file temporarily with unique name
// // //     const timestamp = Date.now();
// // //     const fileExtension = path.extname(file.name);
// // //     const tempFilePath = path.join(tempDir, `answer-key-${assessmentId}-${timestamp}${fileExtension}`);
    
// // //     await fs.writeFile(tempFilePath, buffer);
// // //     console.log("✅ File saved to:", tempFilePath);

// // //     // Forward to Flask service for processing
// // //     const flaskUrl = process.env.FLASK_API_URL || "http://localhost:7000";
// // //     const flaskEndpoint = `${flaskUrl}/api/bubblesheet/answer-key`;

// // //     console.log("🔄 Forwarding to Flask:", flaskEndpoint);

// // //     // Create FormData for Flask
// // //     const flaskFormData = new FormData();
// // //     const fileBlob = new Blob([buffer], { type: file.type });
// // //     flaskFormData.append("file", fileBlob, file.name);
// // //     flaskFormData.append("assessment_id", assessmentId);
// // //     flaskFormData.append("module_id", moduleId);
// // //     flaskFormData.append("educator_id", educatorId);

// // //     const flaskResponse = await fetch(flaskEndpoint, {
// // //       method: "POST",
// // //       body: flaskFormData,
// // //     });

// // //     // Clean up temporary file
// // //     try {
// // //       await fs.unlink(tempFilePath);
// // //       console.log("🗑️ Temporary file deleted");
// // //     } catch (error) {
// // //       console.error("Failed to delete temp file:", error);
// // //     }

// // //     if (!flaskResponse.ok) {
// // //       const errorText = await flaskResponse.text();
// // //       console.error("❌ Flask error:", errorText);
      
// // //       let errorMessage = "Failed to process answer key";
// // //       try {
// // //         const errorJson = JSON.parse(errorText);
// // //         errorMessage = errorJson.error || errorJson.message || errorMessage;
// // //       } catch {
// // //         errorMessage = errorText || errorMessage;
// // //       }

// // //       return NextResponse.json(
// // //         { error: errorMessage },
// // //         { status: flaskResponse.status }
// // //       );
// // //     }

// // //     const result = await flaskResponse.json();
// // //     console.log("✅ Flask response:", result);

// // //     // Return success response
// // //     return NextResponse.json({
// // //       success: true,
// // //       message: "Answer key uploaded and processed successfully",
// // //       data: result,
// // //     });

// // //   } catch (error) {
// // //     console.error("❌ Error in answer key upload:", error);
// // //     return NextResponse.json(
// // //       {
// // //         error: "Internal server error",
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

// // // src/app/api/educator/bubblesheet/answer-key/route.ts
// // import { NextRequest, NextResponse } from "next/server";
// // import path from "path";
// // import { promises as fs } from "fs";
// // import os from "os";

// // export async function POST(req: NextRequest) {
// //   try {
// //     const { searchParams } = new URL(req.url);
// //     const assessmentId = searchParams.get("assessmentId");
// //     const moduleId = searchParams.get("moduleId");
// //     const educatorId = searchParams.get("educatorId");

// //     console.log("📋 Answer Key Upload Request");
// //     console.log("Assessment ID:", assessmentId);
// //     console.log("Module ID:", moduleId);
// //     console.log("Educator ID:", educatorId);

// //     // Validate required parameters
// //     if (!assessmentId || !moduleId || !educatorId) {
// //       return NextResponse.json(
// //         { error: "Missing required parameters" },
// //         { status: 400 }
// //       );
// //     }

// //     // Get the uploaded file
// //     const formData = await req.formData();
// //     const file = formData.get("file") as File;

// //     if (!file) {
// //       return NextResponse.json(
// //         { error: "No file uploaded" },
// //         { status: 400 }
// //       );
// //     }

// //     console.log("📄 File received:", file.name);
// //     console.log("📄 File type:", file.type);
// //     console.log("📄 File size:", file.size, "bytes");

// //     // Validate file type (Excel, PDF, Word files)
// //     const validExtensions = ['.xls', '.xlsx', '.xlsm', '.pdf', '.docx', '.doc'];
// //     const fileExtension = path.extname(file.name).toLowerCase();
    
// //     if (!validExtensions.includes(fileExtension)) {
// //       return NextResponse.json(
// //         { error: "Invalid file type. Please upload Excel (.xls, .xlsx), PDF, or Word (.docx) file" },
// //         { status: 400 }
// //       );
// //     }

// //     // Create a temporary file to store the upload
// //     const bytes = await file.arrayBuffer();
// //     const buffer = Buffer.from(bytes);

// //     // Create temp directory if it doesn't exist
// //     const tempDir = path.join(os.tmpdir(), "bubblesheet-uploads");
// //     try {
// //       await fs.mkdir(tempDir, { recursive: true });
// //     } catch (error) {
// //       console.log("Temp directory already exists or created");
// //     }

// //     // Save file temporarily with unique name
// //     const timestamp = Date.now();
// //     const tempFilePath = path.join(tempDir, `answer-key-${assessmentId}-${timestamp}${fileExtension}`);
    
// //     await fs.writeFile(tempFilePath, buffer);
// //     console.log("✅ File saved to:", tempFilePath);

// //     // Forward to Flask service for processing
// //     const flaskUrl = process.env.FLASK_API_URL || "http://localhost:7000";
// //     // ✅ FIXED: Use the correct Flask endpoint
// //     const flaskEndpoint = `${flaskUrl}/api/extract-answer-key`;

// //     console.log("🔄 Forwarding to Flask:", flaskEndpoint);

// //     // Create FormData for Flask
// //     const flaskFormData = new FormData();
// //     const fileBlob = new Blob([buffer], { type: file.type });
// //     flaskFormData.append("file", fileBlob, file.name);
// //     // ✅ FIXED: Use the field names Flask expects (with underscores, not camelCase)
// //     flaskFormData.append("assessmentId", assessmentId);
// //     flaskFormData.append("moduleId", moduleId);
// //     flaskFormData.append("educatorId", educatorId);

// //     console.log("📤 Sending to Flask with params:", {
// //       assessmentId,
// //       moduleId,
// //       educatorId,
// //       fileName: file.name,
// //     });

// //     const flaskResponse = await fetch(flaskEndpoint, {
// //       method: "POST",
// //       body: flaskFormData,
// //     });

// //     console.log("📥 Flask response status:", flaskResponse.status);

// //     // Clean up temporary file
// //     try {
// //       await fs.unlink(tempFilePath);
// //       console.log("🗑️ Temporary file deleted");
// //     } catch (error) {
// //       console.error("Failed to delete temp file:", error);
// //     }

// //     if (!flaskResponse.ok) {
// //       const errorText = await flaskResponse.text();
// //       console.error("❌ Flask error response:", errorText);
      
// //       let errorMessage = "Failed to process answer key";
// //       let errorDetails = errorText;
      
// //       try {
// //         const errorJson = JSON.parse(errorText);
// //         errorMessage = errorJson.error || errorJson.message || errorMessage;
// //         errorDetails = errorJson.details || errorDetails;
// //       } catch {
// //         // Error text is not JSON, use as is
// //       }

// //       return NextResponse.json(
// //         { 
// //           error: errorMessage,
// //           details: errorDetails
// //         },
// //         { status: flaskResponse.status }
// //       );
// //     }

// //     const result = await flaskResponse.json();
// //     console.log("✅ Flask response data:", result);

// //     // Return success response with Flask data
// //     return NextResponse.json({
// //       success: true,
// //       message: "Answer key uploaded and processed successfully",
// //       answers: result.answers,
// //       answer_count: result.answer_count,
// //       file_path: result.file_path,
// //       is_valid: result.is_valid,
// //       assessment_id: result.assessment_id,
// //       module_id: result.module_id,
// //       educator_id: result.educator_id,
// //     });

// //   } catch (error) {
// //     console.error("❌ Error in answer key upload:", error);
    
// //     // Check if it's a Flask connection error
// //     if (error instanceof Error && error.message.includes('fetch failed')) {
// //       return NextResponse.json(
// //         {
// //           error: "Cannot connect to Flask service",
// //           details: "Please ensure Flask API is running on port 7000. Run: python services/bubblesheet-ocr/flask_api.py",
// //         },
// //         { status: 503 }
// //       );
// //     }
    
// //     return NextResponse.json(
// //       {
// //         error: "Internal server error",
// //         details: error instanceof Error ? error.message : "Unknown error",
// //       },
// //       { status: 500 }
// //     );
// //   }
// // }

// // // Handle OPTIONS for CORS preflight
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

// // src/app/api/educator/bubblesheet/answer-key/route.ts
// import { NextRequest, NextResponse } from "next/server";
// import path from "path";

// export async function POST(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const assessmentId = searchParams.get("assessmentId");
//     const moduleId = searchParams.get("moduleId");
//     const educatorId = searchParams.get("educatorId");

//     console.log("\n" + "=".repeat(60));
//     console.log("📋 ANSWER KEY UPLOAD REQUEST");
//     console.log("=".repeat(60));
//     console.log("Assessment ID:", assessmentId);
//     console.log("Module ID:", moduleId);
//     console.log("Educator ID:", educatorId);

//     // Validate required parameters
//     if (!assessmentId || !moduleId || !educatorId) {
//       console.error("❌ Missing required parameters");
//       return NextResponse.json(
//         { error: "Missing required parameters" },
//         { status: 400 }
//       );
//     }

//     // Get the uploaded file
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
//     const validExtensions = ['.xls', '.xlsx', '.xlsm', '.pdf', '.docx', '.doc'];
//     const fileExtension = path.extname(file.name).toLowerCase();
    
//     if (!validExtensions.includes(fileExtension)) {
//       console.error("❌ Invalid file type:", fileExtension);
//       return NextResponse.json(
//         { 
//           error: "Invalid file type",
//           details: `Please upload Excel (.xls, .xlsx), PDF, or Word (.docx) file. Got: ${fileExtension}`
//         },
//         { status: 400 }
//       );
//     }

//     console.log("✅ File type valid:", fileExtension);

//     // Prepare data for Flask
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);
//     const fileBlob = new Blob([buffer], { type: file.type });

//     const flaskFormData = new FormData();
//     flaskFormData.append("file", fileBlob, file.name);
//     flaskFormData.append("assessmentId", assessmentId);
//     flaskFormData.append("moduleId", moduleId);
//     flaskFormData.append("educatorId", educatorId);

//     // Flask configuration
//     const flaskUrl = process.env.FLASK_API_URL || "http://localhost:7000";
//     const flaskEndpoint = `${flaskUrl}/api/extract-answer-key`;

//     console.log("🔄 Forwarding to Flask:", flaskEndpoint);
//     console.log("   Data:", {
//       fileName: file.name,
//       fileSize: buffer.length,
//       assessmentId,
//       moduleId,
//       educatorId,
//     });

//     // Test Flask connection first
//     try {
//       console.log("🏥 Testing Flask connection...");
//       const healthCheck = await fetch(`${flaskUrl}/api/health`, {
//         method: "GET",
//         signal: AbortSignal.timeout(5000), // 5 second timeout
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
//           details:
//             "Flask API is not running on port 7000. Please start it with: python services/bubblesheet-ocr/flask_api.py",
//         },
//         { status: 503 }
//       );
//     }

//     // Send to Flask
//     console.log("📤 Sending request to Flask...");
//     let flaskResponse;
    
//     try {
//       flaskResponse = await fetch(flaskEndpoint, {
//         method: "POST",
//         body: flaskFormData,
//         signal: AbortSignal.timeout(30000), // 30 second timeout
//       });
//     } catch (fetchError) {
//       console.error("❌ Failed to reach Flask:", fetchError);
//       return NextResponse.json(
//         {
//           error: "Failed to connect to Flask service",
//           details: fetchError instanceof Error ? fetchError.message : "Unknown error",
//         },
//         { status: 503 }
//       );
//     }

//     console.log("📥 Flask response status:", flaskResponse.status);
//     console.log("   Status text:", flaskResponse.statusText);

//     // Get response text first
//     const responseText = await flaskResponse.text();
//     console.log("📥 Response preview (first 500 chars):", responseText.substring(0, 500));

//     // Check if response is JSON
//     const contentType = flaskResponse.headers.get("content-type");
//     if (!contentType || !contentType.includes("application/json")) {
//       console.error("❌ Flask returned non-JSON response");
//       console.error("Content-Type:", contentType);
//       console.error("Full response:", responseText);

//       return NextResponse.json(
//         {
//           error: "Flask service error",
//           details: "Flask returned an HTML error page. Check Flask console for details.",
//           status: flaskResponse.status,
//           response: responseText.substring(0, 200),
//         },
//         { status: 502 }
//       );
//     }

//     // Parse JSON response
//     let result;
//     try {
//       result = JSON.parse(responseText);
//     } catch (parseError) {
//       console.error("❌ Failed to parse JSON:", parseError);
//       return NextResponse.json(
//         {
//           error: "Invalid response from Flask",
//           details: "Could not parse Flask response as JSON",
//         },
//         { status: 502 }
//       );
//     }

//     // Handle Flask errors
//     if (!flaskResponse.ok) {
//       console.error("❌ Flask error response:", result);

//       const errorMessage = result.error || "Failed to process answer key";
//       const errorDetails = result.details || result.message || "Unknown error";

//       return NextResponse.json(
//         {
//           error: errorMessage,
//           details: errorDetails,
//         },
//         { status: flaskResponse.status }
//       );
//     }

//     // Success!
//     console.log("✅ Flask processed successfully");
//     console.log("   Answers extracted:", result.answer_count);
//     console.log("   Valid:", result.is_valid);
//     console.log("=".repeat(60) + "\n");

//     // Return success response
//     return NextResponse.json({
//       success: true,
//       message: "Answer key uploaded and processed successfully",
//       answers: result.answers,
//       answer_count: result.answer_count,
//       file_path: result.file_path,
//       is_valid: result.is_valid,
//       assessment_id: result.assessment_id,
//       module_id: result.module_id,
//       educator_id: result.educator_id,
//     });
//   } catch (error) {
//     console.error("\n❌ ERROR IN ANSWER KEY UPLOAD");
//     console.error("=".repeat(60));
//     console.error("Error:", error);
//     console.error("Type:", error instanceof Error ? error.constructor.name : typeof error);
//     if (error instanceof Error) {
//       console.error("Message:", error.message);
//       console.error("Stack:", error.stack);
//     }
//     console.error("=".repeat(60) + "\n");

//     // Check for specific error types
//     if (error instanceof Error) {
//       if (error.message.includes("fetch failed") || error.name === "TimeoutError") {
//         return NextResponse.json(
//           {
//             error: "Cannot connect to Flask service",
//             details:
//               "Please ensure Flask API is running: python services/bubblesheet-ocr/flask_api.py",
//           },
//           { status: 503 }
//         );
//       }
//     }

//     return NextResponse.json(
//       {
//         error: "Internal server error",
//         details: error instanceof Error ? error.message : "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }

// // Handle OPTIONS for CORS preflight
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

// src/app/api/educator/bubblesheet/answer-key/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assessmentId = searchParams.get("assessmentId");
    const moduleId = searchParams.get("moduleId");
    const educatorId = searchParams.get("educatorId");

    console.log("\n" + "=".repeat(60));
    console.log("📋 ANSWER KEY UPLOAD REQUEST");
    console.log("=".repeat(60));
    console.log("Assessment ID:", assessmentId);
    console.log("Module ID:", moduleId);
    console.log("Educator ID:", educatorId);

    // Validate required parameters
    if (!assessmentId || !moduleId || !educatorId) {
      console.error("❌ Missing required parameters");
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get the uploaded file
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
    const validExtensions = ['.xls', '.xlsx', '.xlsm', '.pdf', '.docx', '.doc'];
    const fileExtension = path.extname(file.name).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      console.error("❌ Invalid file type:", fileExtension);
      return NextResponse.json(
        { 
          error: "Invalid file type",
          details: `Please upload Excel (.xls, .xlsx), PDF, or Word (.docx) file. Got: ${fileExtension}`
        },
        { status: 400 }
      );
    }

    console.log("✅ File type valid:", fileExtension);

    // Prepare data for Flask
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileBlob = new Blob([buffer], { type: file.type });

    const flaskFormData = new FormData();
    flaskFormData.append("file", fileBlob, file.name);
    flaskFormData.append("assessmentId", assessmentId);
    flaskFormData.append("moduleId", moduleId);
    flaskFormData.append("educatorId", educatorId);

    // Flask configuration
    const flaskUrl = process.env.FLASK_API_URL || "http://localhost:7000";
    const flaskEndpoint = `${flaskUrl}/api/extract-answer-key`;

    console.log("🔄 Forwarding to Flask:", flaskEndpoint);

    // Test Flask connection first
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
          details:
            "Flask API is not running on port 7000. Please start it with: python services/bubblesheet-ocr/flask_api.py",
        },
        { status: 503 }
      );
    }

    // Send to Flask
    console.log("📤 Sending request to Flask...");
    let flaskResponse;
    
    try {
      flaskResponse = await fetch(flaskEndpoint, {
        method: "POST",
        body: flaskFormData,
        signal: AbortSignal.timeout(30000),
      });
    } catch (fetchError) {
      console.error("❌ Failed to reach Flask:", fetchError);
      return NextResponse.json(
        {
          error: "Failed to connect to Flask service",
          details: fetchError instanceof Error ? fetchError.message : "Unknown error",
        },
        { status: 503 }
      );
    }

    console.log("📥 Flask response status:", flaskResponse.status);

    // Get response text first
    const responseText = await flaskResponse.text();
    console.log("📥 Response preview (first 500 chars):", responseText.substring(0, 500));

    // Check if response is JSON
    const contentType = flaskResponse.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ Flask returned non-JSON response");
      console.error("Content-Type:", contentType);

      return NextResponse.json(
        {
          error: "Flask service error",
          details: "Flask returned an HTML error page. Check Flask console for details.",
          status: flaskResponse.status,
          response: responseText.substring(0, 200),
        },
        { status: 502 }
      );
    }

    // Parse JSON response
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("❌ Failed to parse JSON:", parseError);
      return NextResponse.json(
        {
          error: "Invalid response from Flask",
          details: "Could not parse Flask response as JSON",
        },
        { status: 502 }
      );
    }

    // Handle Flask errors
    if (!flaskResponse.ok) {
      console.error("❌ Flask error response:", result);

      const errorMessage = result.error || "Failed to process answer key";
      const errorDetails = result.details || result.message || "Unknown error";

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorDetails,
        },
        { status: flaskResponse.status }
      );
    }

    // Success! Now store in database
    console.log("✅ Flask processed successfully");
    console.log("   Answers extracted:", result.answer_count);
    console.log("   Valid:", result.is_valid);

    // Delete existing answer keys for this assessment
    console.log("🗑️ Deleting existing answer keys...");
    await prisma.bubbleSheet_Answer_Key.deleteMany({
      where: {
        assessment_id: assessmentId,
      },
    });

    // Store new answer keys
    console.log("💾 Storing new answer keys in database...");
    const answers = result.answers as Array<{
      question_number: number;
      correct_option: string;
    }>;

    const storedKeys = await prisma.$transaction(
      answers.map((answer) =>
        prisma.bubbleSheet_Answer_Key.create({
          data: {
            assessment_id: assessmentId,
            module_id: moduleId,
            question_number: answer.question_number,
            correct_option: answer.correct_option,
            created_by: educatorId,
          },
        })
      )
    );

    console.log(`✅ Stored ${storedKeys.length} answer keys in database`);
    console.log("=".repeat(60) + "\n");

    // Return success response
    return NextResponse.json({
      success: true,
      message: "Answer key uploaded and stored successfully",
      answers: result.answers,
      answer_count: result.answer_count,
      file_path: result.file_path,
      is_valid: result.is_valid,
      stored_count: storedKeys.length,
    });
  } catch (error) {
    console.error("\n❌ ERROR IN ANSWER KEY UPLOAD");
    console.error("=".repeat(60));
    console.error("Error:", error);
    console.error("Type:", error instanceof Error ? error.constructor.name : typeof error);
    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }
    console.error("=".repeat(60) + "\n");

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes("fetch failed") || error.name === "TimeoutError") {
        return NextResponse.json(
          {
            error: "Cannot connect to Flask service",
            details:
              "Please ensure Flask API is running: python services/bubblesheet-ocr/flask_api.py",
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS preflight
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