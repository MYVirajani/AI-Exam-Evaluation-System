// src/app/api/assessment/route.ts
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient, assessmentType } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // 1) Validate core fields
    const type        = formData.get("type")        as string;
    const title       = formData.get("title")       as string;
    const description = (formData.get("description") as string) || "";
    const deadlineRaw = formData.get("deadline")    as string;
    const moduleId    = formData.get("moduleId")    as string;
    const createdBy   = "12345";

    if (!type || !title || !deadlineRaw || !moduleId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }
    const deadline = new Date(deadlineRaw);
    if (isNaN(deadline.getTime())) {
      return NextResponse.json({ success: false, error: "Invalid deadline" }, { status: 400 });
    }

    // 2) Figure out <parent>/src/data
    const projectRoot = process.cwd();
    const parentDir   = path.dirname(projectRoot);
    const baseDataDir = path.join(parentDir, "src", "data");

    // 3) Helper: save into subfolder under baseDataDir
    async function handleFile(fieldName: string, required = false) {
      const file = formData.get(fieldName) as File | null;
      if (!file) {
        if (required) throw new Error(`${fieldName} is required`);
        return { id: uuidv4(), url: null as string | null };
      }

      // decide subdirectory
      const subdirs: Record<string,string> = {
        questionPaper:     "question_papers",
        modelAnswerPaper:  "model_answer_papers",
        markingScheme:     "marking_schemes"
      };
      const subdir = subdirs[fieldName] || "";
      const uploadDir = path.join(baseDataDir, subdir);
      await mkdir(uploadDir, { recursive: true });

      // write file
      const buffer   = Buffer.from(await file.arrayBuffer());
      const ext      = file.name.split(".").pop();
      const id       = uuidv4();
      const filename = `${id}.${ext}`;
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);

      // relative path for DB
      return {
        id,
        url: `src/data/${subdir}/${filename}`,
      };
    }

    // 4) Upload files
    const qp   = await handleFile("questionPaper", true);
    const mapr = await handleFile("modelAnswerPaper");
    const ms   = await handleFile("markingScheme");

    // 5) Persist file‐records
    await prisma.question_Paper.create({
      data: {
        question_paper_id: qp.id,
        file_url:          qp.url!,
        created_on:        new Date(),
      },
    });
    await prisma.model_Answer_Paper.create({
      data: {
        model_answer_paper_id: mapr.id,
        file_url:              mapr.url ?? "",
        created_on:            new Date(),
      },
    });
    await prisma.marking_Scheme.create({
      data: {
        marking_scheme_id: ms.id,
        file_url:          ms.url ?? "",
        created_on:        new Date(),
      },
    });

    // 6) Finally create the assessment
    const newAssessment = await prisma.assessment.create({
      data: {
        assessment_id:          uuidv4(),
        type:                   type as assessmentType,
        title,
        description,
        deadline,
        module_id:              moduleId,
        created_by:             createdBy,
        question_paper_id:      qp.id,
        model_answer_paper_id:  mapr.id,
        marking_scheme_id:      ms.id,
      },
    });

    return NextResponse.json({ success: true, assessment: newAssessment });
  } catch (error: any) {
    console.error("Error creating assessment:", error);
    const message = error instanceof Error ? error.message : "Failed to create assessment";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
