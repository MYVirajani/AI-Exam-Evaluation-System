import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 

import Stripe from "stripe";

export async function GET() {
  try {
    const plans = await prisma.pricing_Plan.findMany({
      orderBy: { created_on: "desc" },
      include: {
        evaluation_model: {
          select: {
            model_id: true,
            model_name: true,
            description: true,
            created_on: true,
          },
        },
        _count: {   // ✅ This gives you the number of related records
          select: { subscriptions: true },
        },
      },
    });

    // Format response to rename `_count.subscriptions` → `subscriptionCount` if needed
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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { name, description, price, billing_period, model_id, features } =
      await req.json();

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!model_id) {
      return NextResponse.json({ error: "Model ID is required" }, { status: 400 });
    }
    if (!price || !billing_period) {
      return NextResponse.json(
        { error: "Price and billing period are required" },
        { status: 400 }
      );
    }

    // 1. Create product in Stripe (only include description if provided)
    const productPayload: { name: string; description?: string } = { name };
    if (description && description.trim() !== "") {
      productPayload.description = description;
    }

    const product = await stripe.products.create(productPayload);

    // 2. Create price in Stripe
    const stripePrice = await stripe.prices.create({
      unit_amount: Math.round(price * 100), // cents
      currency: "usd",
      recurring: { interval: billing_period }, // e.g., 'month' or 'year'
      product: product.id,
    });

    // 3. Save to your database
    const plan = await prisma.pricing_Plan.create({
      data: {
        name,
        description: description?.trim() || null,
        price,
        billing_period,
        stripe_product_id: product.id,
        stripe_price_id: stripePrice.id,
        features: Array.isArray(features) ? features : [], 
        model_id,
      },
    });

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product", details: error.message },
      { status: 500 }
    );
  }
}

