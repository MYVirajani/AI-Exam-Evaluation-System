import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { PrismaClient, assessmentType } from "@/generated/prisma";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // mandatory fields
    const type = formData.get("type") as string;
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || "";
    const deadlineRaw = formData.get("deadline") as string;
    const moduleId = formData.get("moduleId") as string;
    const createdBy = "12345"; // hard-coded educator id

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

    // store everything under <project-root>/src/data
    const uploadDir = path.join(process.cwd(), "src", "data");
    await mkdir(uploadDir, { recursive: true });

    // helper to save a file input; returns its id + relative path under src/data
    async function handleFile(fieldName: string, required = false) {
      const file = formData.get(fieldName) as File | null;
      if (!file) {
        if (required) throw new Error(`${fieldName} is required`);
        return { id: uuidv4(), url: null as string | null };
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop();
      const id = uuidv4();
      const filename = `${id}.${ext}`;
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);

      // store the _relative_ path (so you can find it under src/data later)
      return {
        id,
        url: `src/data/${filename}`,
      };
    }

    // question paper is mandatory
    const qp = await handleFile("questionPaper", true);

    // optional files
    const mapr = await handleFile("modelAnswerPaper");
    const ms = await handleFile("markingScheme");

    // persist the three file‐record tables
    await prisma.question_Paper.create({
      data: {
        question_paper_id: qp.id,
        file_url: qp.url!,
        created_on: new Date(),
      },
    });
    await prisma.model_Answer_Paper.create({
      data: {
        model_answer_paper_id: mapr.id,
        file_url: mapr.url ?? "",
        created_on: new Date(),
      },
    });
    await prisma.marking_Scheme.create({
      data: {
        marking_scheme_id: ms.id,
        file_url: ms.url ?? "",
        created_on: new Date(),
      },
    });

    // finally create the assessment itself
    const newAssessment = await prisma.assessment.create({
      data: {
        assessment_id: uuidv4(),
        type: type as assessmentType,
        title,
        description,
        deadline,
        module_id: moduleId,
        created_by: createdBy,
        question_paper_id: qp.id,
        model_answer_paper_id: mapr.id,
        marking_scheme_id: ms.id,
      },
    });

    return NextResponse.json({ success: true, assessment: newAssessment });
  } catch (error: any) {
    console.error("Error creating assessment:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create assessment";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
