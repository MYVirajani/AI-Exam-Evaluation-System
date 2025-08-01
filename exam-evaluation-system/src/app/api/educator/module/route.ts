// exam-evaluation-system\src\app\api\educator\modules\route.ts
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const moduleCode = formData.get("moduleCode") as string;
    const createdBy = formData.get("createdBy") as string;

    // ❌ Check if module with same module_code already exists for this educator
    const existingModule = await prisma.module.findFirst({
      where: {
        module_code: moduleCode,
        created_by: createdBy,
      },
    });

    if (existingModule) {
      return NextResponse.json(
        {
          success: false,
          error: `A module with the code "${moduleCode}" already exists for this educator.`,
        },
        { status: 400 }
      );
    }

    // 📂 Create directories if not exist
    const imagesDir = path.join(process.cwd(), "public", "module-images");
    await mkdir(imagesDir, { recursive: true });

    // 🖼️ Process uploaded image
    const imageFile = formData.get("moduleImage") as File | null;
    let imageUrl: string | null = null;

    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const imageExtension = imageFile.name.split(".").pop();
      const imageName = `${uuidv4()}.${imageExtension}`;
      const imagePath = path.join(imagesDir, imageName);

      await writeFile(imagePath, buffer);
      imageUrl = `/module-images/${imageName}`;
    }

    // ✅ Create module in the DB using Prisma
    const newModule = await prisma.module.create({
      data: {
        module_id: uuidv4(),
        module_code: moduleCode,
        module_name: formData.get("moduleName") as string,
        semester: formData.get("semester") as string,
        education_institute: formData.get("educationInstitute") as string,
        max_enrollments: parseInt(formData.get("maxStudents") as string),
        learning_outcomes: formData.get("learningOutcomes") as string | null,
        enrollment_key: formData.get("enrollmentKey") as string | null,
        module_image_url: imageUrl,
        created_by: createdBy,
      },
    });

    return NextResponse.json({ success: true, module: newModule });
  } catch (error) {
    console.error("Error creating module:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create module" },
      { status: 500 }
    );
  }
}
