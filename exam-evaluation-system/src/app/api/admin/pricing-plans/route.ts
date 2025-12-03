import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
});

// ======================================================
// GET /api/admin/pricing-plans
// ======================================================
export async function GET() {
  try {
    const plans = await prisma.pricing_Plan.findMany({
      orderBy: { created_on: "desc" },
      include: {
        evaluation_model: {
          select: {
            id: true,              
            model_name: true,
            description: true,
            created_on: true,
          },
        },
        _count: {
          select: { subscriptions: true }, 
        },
      },
    });

    const formattedPlans = plans.map((plan) => ({
      ...plan,
      subscriptionCount: plan._count.subscriptions,
    }));

    return NextResponse.json({ plans: formattedPlans });
  } catch (error: any) {
    console.error("Error fetching pricing plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch pricing plans" },
      { status: 500 }
    );
  }
}

// ======================================================
// POST /api/admin/pricing-plans
// ======================================================
export async function POST(req: Request) {
  try {
    const { name, description, price, billing_period, model_id, features } =
      await req.json();

    // ----------- VALIDATION -------------
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!billing_period || !["month", "year"].includes(billing_period)) {
      return NextResponse.json(
        { error: "Billing period must be either 'month' or 'year'" },
        { status: 400 }
      );
    }

    if (!model_id) {
      return NextResponse.json({ error: "Model ID is required" }, { status: 400 });
    }

    if (price === undefined || price === null || isNaN(price)) {
      return NextResponse.json(
        { error: "Valid price is required" },
        { status: 400 }
      );
    }

    if (!Array.isArray(features)) {
      return NextResponse.json(
        { error: "Features must be an array of strings" },
        { status: 400 }
      );
    }

    // ----------- CHECK IF MODEL EXISTS -------------
    const modelExists = await prisma.evaluation_Model.findUnique({
      where: { id: model_id },
    });

    if (!modelExists) {
      return NextResponse.json(
        { error: "Evaluation Model not found" },
        { status: 404 }
      );
    }

    // ----------- STRIPE PRODUCT CREATION ------------
    const productPayload: { name: string; description?: string } = { name };
    if (description && description.trim() !== "") {
      productPayload.description = description.trim();
    }

    const product = await stripe.products.create(productPayload);

    // ----------- STRIPE PRICE CREATION ------------
    const stripePrice = await stripe.prices.create({
      unit_amount: Math.round(Number(price) * 100), // convert to cents
      currency: "usd",
      recurring: { interval: billing_period }, // e.g., 'month' or 'year'
      product: product.id,
    });

    // ----------- SAVE PLAN IN DATABASE ------------
    const plan = await prisma.pricing_Plan.create({
      data: {
        name,
        description: description?.trim() || null,
        price: price, // Prisma Decimal supports passing numbers
        billing_period,
        stripe_product_id: product.id,
        stripe_price_id: stripePrice.id,
        features,
        model_id,
      },
    });

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    console.error("Error creating pricing plan:", error);

    return NextResponse.json(
      {
        error: "Failed to create pricing plan",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
