import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------
// GET /api/admin/evaluation-models
// ---------------------------------------------------------
export async function GET() {
  try {
    const models = await prisma.evaluation_Model.findMany({
      include: {
        pricing_plans: true,
      },
      orderBy: { model_name: "asc" },
    });

    return NextResponse.json(models);
  } catch (err) {
    console.error("Error fetching evaluation models:", err);
    return NextResponse.json(
      { error: "Failed to fetch evaluation models" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------
// POST /api/admin/evaluation-models
// ---------------------------------------------------------
export async function POST(req: Request) {
  try {
    const {
      model_name,
      provider,
      chat_model,
      temperature,
      embedding_model,
      description,
    } = await req.json();

    // ----------------- Validation -----------------
    if (!model_name || !provider || !embedding_model) {
      return NextResponse.json(
        {
          error:
            "model_name, provider, and embedding_model are required fields.",
        },
        { status: 400 }
      );
    }

    // ----------------- Create Record -----------------
    const newModel = await prisma.evaluation_Model.create({
      data: {
        model_name,
        provider,
        chat_model: chat_model || null,
        temperature: typeof temperature === "number" ? temperature : 0.0,
        embedding_model,
        description: description || null,
      },
    });

    return NextResponse.json(newModel, { status: 201 });
  } catch (err) {
    console.error("Error creating evaluation model:", err);

    if (err.code === "P2002") {
      // Prisma unique constraint error
      return NextResponse.json(
        { error: "Model name must be unique." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create evaluation model" },
      { status: 500 }
    );
  }
}
