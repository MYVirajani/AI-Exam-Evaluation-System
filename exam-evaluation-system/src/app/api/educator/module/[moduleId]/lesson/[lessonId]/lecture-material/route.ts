// src/app/api/educator/module/[moduleId]/lesson/[lessonId]/lecture-material/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { FILE_CONFIG } from "@/lib/fileConfig";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { moduleId: string; lessonId: string } }
) {
  try {
    console.log("[LectureUpload] Received POST request");

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const description = formData.get("description") as string | null;

    const { moduleId, lessonId } = params;

    if (!files || files.length === 0) {
      console.log("[LectureUpload] No files provided");
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (!moduleId || !lessonId) {
      console.log("[LectureUpload] Missing moduleId or lessonId");
      return NextResponse.json(
        { error: "moduleId and lessonId are required" },
        { status: 400 }
      );
    }

    // Prepare directory
    const projectRoot = process.cwd();
    const parentDir = path.dirname(projectRoot);
    const uploadDir = path.join(parentDir, "data", "Lecture_materials", moduleId, lessonId);

    if (!fs.existsSync(uploadDir)) {
      console.log("[LectureUpload] Creating upload directory...");
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uploadedMaterials = [];

    for (const file of files) {
      // Validate extension and size for each file
      const { types: validExtensions, maxSizeMB } = FILE_CONFIG.LECTURE_MATERIAL;
      const fileExtension = path.extname(file.name).toLowerCase();

      if (!validExtensions.includes(fileExtension)) {
        console.log(`[LectureUpload] Invalid file type for ${file.name}`);
        continue; // Skip this file but continue with others
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        const actualSize = (file.size / (1024 * 1024)).toFixed(2);
        console.log(`[LectureUpload] File ${file.name} too large: ${actualSize}MB`);
        continue; // Skip this file but continue with others
      }

      // Save file
      const fileName = file.name;
      const filePath = path.join(uploadDir, fileName);
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
      console.log("[LectureUpload] File written:", filePath);

      const relativeFilePath = path.join("data", "Lecture_materials", moduleId, lessonId, fileName);

      // Save metadata to database
      const newMaterial = await prisma.lectureMaterial.create({
        data: {
          lesson_id: lessonId,
          file_name: fileName,
          file_url: relativeFilePath,
          description: description ?? null,
        },
      });

      uploadedMaterials.push(newMaterial);
    }

    if (uploadedMaterials.length === 0) {
      return NextResponse.json(
        { error: "No valid files were uploaded" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Lecture materials uploaded successfully",
      materials: uploadedMaterials,
    });
  } catch (error) {
    console.error("[LectureUpload Error]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}