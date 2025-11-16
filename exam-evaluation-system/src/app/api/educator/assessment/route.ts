// src/app/api/assessment/route.ts

import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { assessmentType } from "@/generated/prisma";
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    console.log("➡️ Incoming POST request to create assessment");

    const formData = await request.formData();
    const type = formData.get("type") as string;
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || "";
    const deadlineRaw = formData.get("deadline") as string;
    const moduleId = formData.get("moduleId") as string;
    const createdBy = formData.get("createdBy") as string;

    console.log("📦 Form data received:", { type, title, deadlineRaw, moduleId, createdBy });

    if (!createdBy) {
      return NextResponse.json(
        { success: false, error: "Missing educator ID (createdBy)" },
        { status: 400 }
      );
    }

    if (!type || !title || !deadlineRaw || !moduleId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const deadline = new Date(deadlineRaw);
    if (isNaN(deadline.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid deadline" },
        { status: 400 }
      );
    }

    // Step 1: Create assessment first
    const assessmentId = uuidv4();
    const newAssessment = await prisma.assessment.create({
      data: {
        assessment_id: assessmentId,
        type: type as assessmentType,
        title,
        description,
        deadline,
        module_id: moduleId,
        created_by: createdBy,
        total_marks: 0.0, // default, update later if needed
        instructions: [],
      },
    });

    console.log("✅ Assessment created:", assessmentId);

    // Step 2: Handle file uploads
    const projectRoot = process.cwd();
    const baseDataDir = path.join(path.dirname(projectRoot), "src", "data");

    async function handleFile(fieldName: string, required = false) {
      const file = formData.get(fieldName) as File | null;
      if (!file) {
        if (required) throw new Error(`${fieldName} is required`);
        return { id: uuidv4(), url: null as string | null };
      }

      const subdirs: Record<string, string> = {
        questionPaper: "question_papers",
        modelAnswerPaper: "model_answer_papers",
        markingScheme: "marking_schemes",
      };
      const subdir = subdirs[fieldName] || "";
      const uploadDir = path.join(baseDataDir, subdir);
      await mkdir(uploadDir, { recursive: true });

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop();
      const id = uuidv4();
      const filename = `${id}.${ext}`;
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);

      const fileUrl = `src/data/${subdir}/${filename}`;
      console.log(`✅ File saved: ${fileUrl}`);
      return { id, url: fileUrl };
    }

    // Step 3: Save each file (if provided) and related record
    const qp = await handleFile("questionPaper");
    const mapr = await handleFile("modelAnswerPaper");
    const ms = await handleFile("markingScheme");

    if (qp.url) {
      await prisma.question_Paper.create({
        data: {
          assessment_id: assessmentId,
          question_paper_id: qp.id,
          file_url: qp.url,
          created_on: new Date(),
        },
      });
      console.log("✅ Question paper linked");
    }

    if (mapr.url) {
      await prisma.model_Answer_Paper.create({
        data: {
          assessment_id: assessmentId,
          model_answer_paper_id: mapr.id,
          file_url: mapr.url,
          created_on: new Date(),
        },
      });
      console.log("✅ Model answer paper linked");
    }

    if (ms.url) {
      await prisma.marking_Scheme.create({
        data: {
          assessment_id: assessmentId,
          marking_scheme_id: ms.id,
          file_url: ms.url,
          created_on: new Date(),
        },
      });
      console.log("✅ Marking scheme linked");
    }

    return NextResponse.json({ success: true, assessment: newAssessment });

  } catch (error: any) {
    console.error("❌ Error creating assessment:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create assessment",
      },
      { status: 500 }
    );
  }
}