// src/app/api/stripe/create-checkout-session/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { pricing_plan_id, educator_id } = await req.json();

    // 1. Find pricing plan
    const plan = await prisma.pricing_Plan.findUnique({
      where: { pricing_plan_id },
    });

    if (!plan || !plan.stripe_price_id) {
      return NextResponse.json(
        { error: "Pricing plan not found" },
        { status: 404 }
      );
    }

    // 2. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.stripe_price_id,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/educator/subscription/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/educator/subscription/cancel`,
      metadata: {
        educator_id,
        pricing_plan_id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
