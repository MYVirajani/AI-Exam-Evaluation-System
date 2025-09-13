import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/admin/pricing-plans/[id]
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await req.json();
    console.log('data: ', data);

    if (!data.name || data.price == null) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }

    const updatedPlan = await prisma.pricing_Plan.update({
      where: { pricing_plan_id: id },
      data: {
        name: data.name,
        billing_period: data.billing_period,
        price: data.price,
        description:
          data.description && data.description.trim() !== ""
            ? data.description
            : null,
        features: Array.isArray(data.features) ? data.features : [], // ✅ update features
        model_id: data.model_id, // ✅ update evaluation model
      },
      include: {
        evaluation_model: true, // so UI gets model_name + description
      },
    });

    return NextResponse.json({ plan: updatedPlan }, { status: 200 });
  } catch (err: any) {
    console.error("Error updating plan:", err);
    return NextResponse.json(
      { error: "Failed to update pricing plan", details: err.message },
      { status: 500 }
    );
  }
}

interface Params {
  params: { id: string };
}

export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = params;

    // Delete pricing plan (subscriptions will cascade if set in schema)
    await prisma.pricing_Plan.delete({
      where: { pricing_plan_id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting pricing plan:", error);
    return NextResponse.json(
      { error: "Failed to delete pricing plan" },
      { status: 500 }
    );
  }
}
