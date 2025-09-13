import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 

import Stripe from "stripe";

// GET /api/admin/pricing-plans → Fetch pricing plans from DB
export async function GET() {
  try {
    const plans = await prisma.pricing_Plan.findMany({
      orderBy: { created_on: "desc" },
    });
    console.log('plans: ', plans);
    return NextResponse.json({ plans });
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
    const { name, description, price, billing_period, model_id } = await req.json();

    // 1. Create product in Stripe
    const product = await stripe.products.create({
      name,
      description,
    });

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
        description,
        price,
        billing_period,
        stripe_product_id: product.id,
        stripe_price_id: stripePrice.id,
        features: [],
        model_id,
      },
    });

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
