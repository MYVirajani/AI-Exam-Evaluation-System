import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Prisma, PrismaClient } from "@/generated/prisma"; // adjust path if needed

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    // Create directories if not exist
    const imagesDir = path.join(process.cwd(), "public", "module-images");
    await mkdir(imagesDir, { recursive: true });

    // Process uploaded image
    const imageFile = formData.get("moduleImage") as File | null;
    let imageUrl: string | null = null;

    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const imageExtension = imageFile.name.split(".").pop();
      const imageName = `${uuidv4()}.${imageExtension}`;
      const imagePath = path.join(imagesDir, imageName);

      await writeFile(imagePath, buffer);
      imageUrl = `/module-images/${imageName}`; // relative URL to access image
    }


    // Create module in the DB using Prisma
    const newModule = await prisma.module.create({
      data: {
        module_id: uuidv4(),
        module_code: formData.get("moduleCode") as string,
        module_name: formData.get("moduleName") as string,
        semester: formData.get("semester") as string,
        education_institute: formData.get("educationInstitute") as string,
        max_enrollments:parseInt(formData.get("maxStudents") as string),
        learning_outcomes: formData.get("learningOutcomes") as string | null,
        enrollment_key: formData.get("enrollmentKey") as string | null,
        module_image_url: imageUrl,
        created_by: "12345",
      },
    });

    return NextResponse.json({ success: true, module: newModule });

    // return NextResponse.json({ success: true, module });
  } catch (error) {
    console.error("Error creating module:", error);

    return NextResponse.json(
      { success: false, error: "Failed to create module" },
      { status: 500 }
    );
  }
}
