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
