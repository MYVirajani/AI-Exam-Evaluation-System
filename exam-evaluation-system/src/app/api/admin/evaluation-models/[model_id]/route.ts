import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT /api/admin/evaluation-models/:id
export async function PUT(
  req: Request,
  { params }: { params: { model_id: string } }
) {
  try {
    const modelId = params.model_id;
    const { model_name, description } = await req.json();

    if (!model_name) {
      return NextResponse.json(
        { error: "Model name is required." },
        { status: 400 }
      );
    }

    const updatedModel = await prisma.evaluation_Model.update({
      where: { model_id: modelId },
      data: {
        model_name,
        description: description || null,
      },
      include: {
        pricing_plans: true,
      },
    });

    return NextResponse.json(updatedModel, { status: 200 });
  } catch (err) {
    console.error("Error updating evaluation model:", err);
    return NextResponse.json(
      { error: "Failed to update evaluation model" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/evaluation-models/:id
export async function DELETE(
  req: Request,
  { params }: { params: { model_id: string } }
) {
  try {
    const modelId = params.model_id;

    await prisma.evaluation_Model.delete({
      where: { model_id: modelId },
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
