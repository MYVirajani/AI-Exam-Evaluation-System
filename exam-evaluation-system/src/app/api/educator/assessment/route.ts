// src/app/api/assessment/route.ts
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import {  assessmentType } from "@/generated/prisma";
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
      console.error("❌ Missing createdBy (educator ID)");
      return NextResponse.json(
        { success: false, error: "Missing educator ID (createdBy)" },
        { status: 400 }
      );
    }

    if (!type || !title || !deadlineRaw || !moduleId) {
      console.error("❌ Missing required fields");
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const deadline = new Date(deadlineRaw);
    if (isNaN(deadline.getTime())) {
      console.error("❌ Invalid deadline format");
      return NextResponse.json(
        { success: false, error: "Invalid deadline" },
        { status: 400 }
      );
    }

    const projectRoot = process.cwd();
    const parentDir = path.dirname(projectRoot);
    const baseDataDir = path.join(parentDir, "src", "data");

    async function handleFile(fieldName: string, required = false) {
      try {
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
      } catch (err) {
        console.error(`❌ Error handling file (${fieldName}):`, err);
        throw err;
      }
    }

    const qp = await handleFile("questionPaper");
    const mapr = await handleFile("modelAnswerPaper");
    const ms = await handleFile("markingScheme");

    let qpId: string | null = null;
    let maprId: string | null = null;
    let msId: string | null = null;

    if (qp.url) {
      try {
        await prisma.question_Paper.create({
          data: {
            question_paper_id: qp.id,
            file_url: qp.url,
            created_on: new Date(),
          },
        });
        qpId = qp.id;
        console.log("✅ Question paper saved in DB");
      } catch (err) {
        console.error("❌ Failed to save question paper in DB:", err);
      }
    }

    if (mapr.url) {
      try {
        await prisma.model_Answer_Paper.create({
          data: {
            model_answer_paper_id: mapr.id,
            file_url: mapr.url,
            created_on: new Date(),
          },
        });
        maprId = mapr.id;
        console.log("✅ Model answer paper saved in DB");
      } catch (err) {
        console.error("❌ Failed to save model answer paper in DB:", err);
      }
    }

    if (ms.url) {
      try {
        await prisma.marking_Scheme.create({
          data: {
            marking_scheme_id: ms.id,
            file_url: ms.url,
            created_on: new Date(),
          },
        });
        msId = ms.id;
        console.log("✅ Marking scheme saved in DB");
      } catch (err) {
        console.error("❌ Failed to save marking scheme in DB:", err);
      }
    }

    const newAssessment = await prisma.assessment.create({
  data: {
    assessment_id: uuidv4(),
    type: type as assessmentType,
    title,
    description,
    deadline,
    module_id: moduleId,
    created_by: createdBy,
    ...(qpId && { question_paper_id: qpId }),
    ...(maprId && { model_answer_paper_id: maprId }),
    ...(msId && { marking_scheme_id: msId }),
  },
});

    console.log("🎉 Assessment created successfully:", newAssessment);

    return NextResponse.json({ success: true, assessment: newAssessment });
  } catch (error: any) {
    console.error("❌ General error while creating assessment:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create assessment",
      },
      { status: 500 }
    );
  }
}
