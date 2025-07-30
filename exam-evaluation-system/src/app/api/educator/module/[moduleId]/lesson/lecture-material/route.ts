// src/app/api/educator/module/[moduleId]/lesson/lecture-material/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    console.log("[LectureUpload] Received POST request");

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const moduleId = formData.get("moduleId") as string | null;

    if (!file) {
      console.log("[LectureUpload] No file provided");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!moduleId) {
      console.log("[LectureUpload] Module ID missing");
      return NextResponse.json(
        { error: "Module ID is required for lecture materials" },
        { status: 400 }
      );
    }

    const validExtensions = [".pdf", ".docx", ".pptx", ".xlsx"];
    const fileExtension = path.extname(file.name).toLowerCase();

    if (!validExtensions.includes(fileExtension)) {
      console.log("[LectureUpload] Invalid file type");
      return NextResponse.json(
        { error: "Invalid file type for lecture materials" },
        { status: 400 }
      );
    }

    const maxSizeMB = 20;
    if (file.size > maxSizeMB * 1024 * 1024) {
      console.log(
        `[LectureUpload] File too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
      );
      return NextResponse.json(
        { error: `File size exceeds ${maxSizeMB}MB limit` },
        { status: 400 }
      );
    }

    const projectRoot = process.cwd();
    const parentDir = path.dirname(projectRoot);
    const uploadDir = path.join(parentDir, "data", "Lecture_materials", moduleId);

    if (!fs.existsSync(uploadDir)) {
      console.log("[LectureUpload] Creating upload directory...");
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Use original filename as is:
    const fileName = file.name;
    const filePath = path.join(uploadDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    console.log("[LectureUpload] File written:", filePath);

    const relativeFilePath = path.join("data", "Lecture_materials", moduleId, fileName);

    return NextResponse.json({
      success: true,
      filePath: relativeFilePath,
      fileName,
    });
  } catch (error) {
    console.error("[LectureUpload Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
