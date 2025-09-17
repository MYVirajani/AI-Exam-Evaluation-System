import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = await params.id;
    const data = await req.json();

    if (!data.name || data.price == null) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }

    // ✅ Update DB
    const updatedPlan = await prisma.pricing_Plan.update({
      where: { pricing_plan_id: id },
      data: {
        name: data.name,
        billing_period: data.billing_period,
        price: data.price,
        description: data.description?.trim() || null,
        features: Array.isArray(data.features) ? data.features : [],
        model_id: data.model_id,
      },
      include: { evaluation_model: true },
    });

    const combinedDescription = [
      updatedPlan.description ? updatedPlan.description : null,
      updatedPlan.features?.length
        ? updatedPlan.features.map((f) => `✔ ${f}`).join("\n")
        : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    // ✅ Sync with Stripe
    if (updatedPlan.stripe_product_id) {
      await stripe.products.update(updatedPlan.stripe_product_id, {
        name: updatedPlan.name,
        description: combinedDescription || undefined,
      });
    }

    // ✅ Get subscription count
    const subscriptionCount = await prisma.subscription.count({
      where: { pricing_plan_id: id },
    });

    return NextResponse.json(
      { plan: { ...updatedPlan, subscriptionCount } },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Error updating plan:", err);
    return NextResponse.json(
      { error: "Failed to update pricing plan", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get plan so we have Stripe IDs
    const plan = await prisma.pricing_Plan.findUnique({
      where: { pricing_plan_id: id },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // ✅ Deactivate Stripe product (soft delete)
    if (plan.stripe_product_id) {
      await stripe.products.update(plan.stripe_product_id, { active: false });
    }

    // ✅ Delete from DB
    await prisma.pricing_Plan.delete({
      where: { pricing_plan_id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting pricing plan:", error);
    return NextResponse.json(
      { error: "Failed to delete pricing plan", details: error.message },
      { status: 500 }
    );
  }
}
