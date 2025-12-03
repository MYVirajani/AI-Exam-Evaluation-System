import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------
// PUT /api/admin/evaluation-models/:model_id
// ---------------------------------------------------------
export async function PUT(
  req: Request,
  { params }: { params: { model_id: string } }
) {
  try {
    const modelId = params.model_id;

    const {
      model_name,
      provider,
      chat_model,
      temperature,
      embedding_model,
      description,
    } = await req.json();

    // -------- Validation --------
    if (!model_name || !provider || !embedding_model) {
      return NextResponse.json(
        {
          error:
            "model_name, provider, and embedding_model are required fields.",
        },
        { status: 400 }
      );
    }

    // -------- Update Model --------
    const updatedModel = await prisma.evaluation_Model.update({
      where: { id: modelId },
      data: {
        model_name,
        provider,
        chat_model: chat_model ?? null,
        temperature: typeof temperature === "number" ? temperature : undefined,
        embedding_model,
        description: description ?? null,
      },
      include: {
        pricing_plans: true,
      },
    });

    return NextResponse.json(updatedModel, { status: 200 });
  } catch (err: any) {
    console.error("Error updating evaluation model:", err);

    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "Model name must be unique." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update evaluation model" },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------
// DELETE /api/admin/evaluation-models/:model_id
// ---------------------------------------------------------
export async function DELETE(
  req: Request,
  { params }: { params: { model_id: string } }
) {
  try {
    const modelId = params.model_id;

    await prisma.evaluation_Model.delete({
      where: { id: modelId }, 
    });

    return NextResponse.json(
      { message: "Evaluation model deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting evaluation model:", err);

    return NextResponse.json(
      { error: "Failed to delete evaluation model" },
      { status: 500 }
    );
  }
}
