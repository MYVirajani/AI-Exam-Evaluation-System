
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid"; // npm install uuid

// ✅ GET /api/admin/evaluation-models (already exists)
export async function GET() {
  try {
    const models = await prisma.evaluation_Model.findMany({
      include: {
        pricing_plans: true, // include available pricing plans for display
      },
      orderBy: { model_name: "asc" },
    });
    console.log('models: ', models);
    return NextResponse.json(models);
  } catch (err) {
    console.error("Error fetching evaluation models:", err);
    return NextResponse.json(
      { error: "Failed to fetch evaluation models" },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  try {
    const { model_name, description } = await req.json();

    if (!model_name) {
      return NextResponse.json(
        { error: "Model name is required." },
        { status: 400 }
      );
    }

    const newModel = await prisma.evaluation_Model.create({
      data: {
        model_id: uuidv4(), // ✅ Generate unique ID
        model_name,
        description: description || null, // Allow empty description
      },
    });

    return NextResponse.json(newModel, { status: 201 });
  } catch (err) {
    console.error("Error creating evaluation model:", err);
    return NextResponse.json(
      { error: "Failed to create evaluation model" },
      { status: 500 }
    );
  }
}

